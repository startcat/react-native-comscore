import { type HandlerContext } from '../handlers/types';
import { type ComscoreStateManager } from './ComscoreStateManager';
import { type ComponentLogger } from '../logger/types';
import { ComscoreState } from '../types';
import { StateUtils } from './StateUtils';
import {
  type AdBeginParams,
  type AdEndParams,
  type AdPauseParams,
  type AdResumeParams,
  type AdSkipParams,
  type AdBreakBeginParams,
  type AdBreakEndParams,
} from '../types/AnalyticsPlugin';
import {
  type ComscoreAdvertisementMetadata,
  ComscoreAdvertisementType,
} from '../types/ComscoreAdvertisementMetadata';

export class ComscoreAdvertisementHandler {
  private context: HandlerContext;
  private stateManager: ComscoreStateManager;
  private logger: ComponentLogger;

  // Estado del anuncio actual
  private currentAdMetadata: ComscoreAdvertisementMetadata | null = null;
  private currentAdBreakId: string | null = null;
  private adBreakStartTime: number = 0;
  private adStartTime: number = 0;

  constructor(context: HandlerContext, stateManager: ComscoreStateManager) {
    this.context = context;
    this.stateManager = stateManager;
    this.logger = context.logger.forComponent('AdvertisementHandler');
  }

  // Eventos de anuncios individuales
  handleAdBegin(params: AdBeginParams): void {
    if (__DEV__) {
      this.logger.info('📺 handleAdBegin', params);
    }

    // Validar parámetros del anuncio
    const validation = this.validateAdParams(params);
    if (!validation.isValid) {
      this.logger.error('Invalid ad parameters', {
        errors: validation.errors,
        params,
      });
      return;
    }

    if (__DEV__ && validation.warnings.length > 0) {
      this.logger.warn('Ad parameters have warnings', {
        warnings: validation.warnings,
        params,
      });
    }

    this.adStartTime = Date.now();

    // Actualizar estado interno
    this.stateManager.setInAd(true);

    // Crear metadatos del anuncio basados en los parámetros
    this.currentAdMetadata = this.createAdMetadata(params);

    // Calcular offset del anuncio
    if (typeof params.adPosition === 'number') {
      this.stateManager.setCurrentAdOffset(params.adPosition);
    }

    // Configurar metadatos del anuncio en el connector
    if (this.currentAdMetadata) {
      // Usar el connector para establecer metadatos de anuncio
      const adMetadata = {
        ...this.context.metadata,
        advertisementMetadata: this.currentAdMetadata,
      };

      this.context.connector.setMetadata(adMetadata);
      this.stateManager.setCurrentContentMetadata(adMetadata);

      if (__DEV__) {
        this.logger.debug('Ad metadata set in ComScore', {
          adId: params.adId,
          adType: params.adType,
          duration: params.adDuration,
          position: params.adPosition,
          validationPassed: validation.isValid,
          warningCount: validation.warnings.length,
        });
      }
    }

    // Transicionar al estado de anuncio
    this.stateManager.transitionToAdvertisement('ad_begin');
  }

  handleAdEnd(params: AdEndParams): void {
    if (__DEV__) {
      this.logger.info('📺 handleAdEnd', params);
    }

    const adDuration = Date.now() - this.adStartTime;
    const currentState = this.stateManager.getCurrentState();

    if (__DEV__) {
      this.logger.debug('Ad completed', {
        adId: params.adId,
        duration: adDuration,
        completed: params.completed,
        currentState,
        wasInAdBreak: this.isInAdBreak(),
      });
    }

    // Limpiar estado del anuncio
    this.stateManager.setInAd(false);
    this.currentAdMetadata = null;

    // Reset ad offset
    this.stateManager.setCurrentAdOffset(0.0);

    // Restaurar metadatos originales del contenido
    this.context.connector.setMetadata(this.context.metadata);
    this.stateManager.setCurrentContentMetadata(this.context.metadata);

    // Transicionar de vuelta al contenido si no hay más anuncios
    if (!this.currentAdBreakId || params.completed !== false) {
      // Solo transicionar a video si estábamos en un estado de anuncio
      if (StateUtils.isAdState(currentState)) {
        this.stateManager.transitionToVideo('ad_end');
      }
    }

    if (__DEV__) {
      this.logger.debug('Ad end processed, content metadata restored');
    }
  }

  handleAdPause(params: AdPauseParams): void {
    if (__DEV__) {
      this.logger.info('📺 handleAdPause', params);
    }

    const currentState = this.stateManager.getCurrentState();

    if (currentState === ComscoreState.ADVERTISEMENT) {
      this.stateManager.transitionToPaused('ad_pause');

      if (__DEV__) {
        this.logger.debug('Ad paused', {
          adId: params.adId,
          currentState,
        });
      }
    } else {
      this.logger.warn('Cannot pause ad: not in advertisement state', {
        currentState,
        adId: params.adId,
      });
    }
  }

  handleAdResume(params: AdResumeParams): void {
    if (__DEV__) {
      this.logger.info('📺 handleAdResume', params);
    }

    const currentState = this.stateManager.getCurrentState();

    if (currentState === ComscoreState.PAUSED_AD) {
      this.stateManager.transitionToAdvertisement('ad_resume');

      if (__DEV__) {
        this.logger.debug('Ad resumed', {
          adId: params.adId,
          currentState,
        });
      }
    } else {
      this.logger.warn('Cannot resume ad: not in paused ad state', {
        currentState,
        adId: params.adId,
      });
    }
  }

  handleAdSkip(params: AdSkipParams): void {
    if (__DEV__) {
      this.logger.info('📺 handleAdSkip', params);
    }

    const currentState = this.stateManager.getCurrentState();
    const currentTime = Date.now();
    const adDuration = currentTime - this.adStartTime;

    // ComScore necesita saber cuándo se salta un anuncio
    // Esto puede afectar las métricas de completado

    if (this.currentAdMetadata && typeof params.skipPosition === 'number') {
      // Notificar posición donde se saltó
      this.context.connector.startFromPosition(params.skipPosition);

      if (__DEV__) {
        this.logger.debug('Ad skip position notified to ComScore', {
          skipPosition: params.skipPosition,
          adId: params.adId,
        });
      }
    }

    // El skip generalmente lleva a handleAdEnd, pero registramos el evento
    if (__DEV__) {
      this.logger.debug('Ad skipped', {
        adId: params.adId,
        skipPosition: params.skipPosition,
        adDurationWhenSkipped: adDuration,
        currentState,
        hadMetadata: !!this.currentAdMetadata,
      });
    }

    // Actualizar metadatos para indicar que fue saltado
    if (this.currentAdMetadata) {
      const skippedAdMetadata = {
        ...this.context.metadata,
        advertisementMetadata: {
          ...this.currentAdMetadata,
          // Marcar como saltado en metadatos personalizados
          customLabels: {
            adSkipped: 'true',
            skipPosition: params.skipPosition?.toString() || 'unknown',
            adDurationWhenSkipped: adDuration.toString(),
          },
        },
      };

      this.context.connector.update(skippedAdMetadata);
    }
  }

  // Eventos de bloques de anuncios (Ad Breaks)
  handleAdBreakBegin(params: AdBreakBeginParams): void {
    if (__DEV__) {
      this.logger.info('📺 handleAdBreakBegin', params);
    }

    this.adBreakStartTime = Date.now();
    this.currentAdBreakId = params.adBreakId || 'unknown_break';

    if (__DEV__) {
      this.logger.debug('Ad break started', {
        id: this.currentAdBreakId,
        adCount: params.adCount,
        position: params.adBreakPosition,
      });
    }

    // ComScore puede necesitar saber sobre el contexto del ad break
    if (typeof params.adBreakPosition === 'number') {
      this.stateManager.setCurrentAdOffset(params.adBreakPosition);
    }
  }

  handleAdBreakEnd(params: AdBreakEndParams): void {
    if (__DEV__) {
      this.logger.info('📺 handleAdBreakEnd', params);
    }

    const breakDuration = Date.now() - this.adBreakStartTime;

    if (__DEV__) {
      this.logger.debug('Ad break completed', {
        id: this.currentAdBreakId,
        duration: breakDuration,
      });
    }

    // Limpiar estado del ad break
    this.currentAdBreakId = null;
    this.adBreakStartTime = 0;

    // Asegurar que volvemos al contenido
    if (this.stateManager.getInAd()) {
      this.stateManager.setInAd(false);
    }

    // Reset ad offset
    this.stateManager.setCurrentAdOffset(0.0);
  }

  handleContentResume(): void {
    if (__DEV__) {
      this.logger.info('📺 handleContentResume');
    }

    const currentState = this.stateManager.getCurrentState();
    const wasInAdState = StateUtils.isAdState(currentState);

    // Limpiar cualquier estado de anuncio residual
    this.stateManager.setInAd(false);
    this.currentAdMetadata = null;
    this.currentAdBreakId = null;

    // Restaurar metadatos originales del contenido
    this.context.connector.setMetadata(this.context.metadata);
    this.stateManager.setCurrentContentMetadata(this.context.metadata);

    // Transicionar al estado de video si estamos en pausa o anuncio
    if (
      StateUtils.isAdState(currentState) ||
      StateUtils.isPausedState(currentState)
    ) {
      this.stateManager.transitionToVideo('content_resume');
    }

    if (__DEV__) {
      this.logger.debug('Content resumed after ads', {
        previousState: currentState,
        wasInAdState,
        transitionedToVideo:
          StateUtils.isAdState(currentState) ||
          StateUtils.isPausedState(currentState),
        contentMetadataRestored: true,
      });
    }
  }

  // Métodos privados de utilidad
  private createAdMetadata(
    params: AdBeginParams
  ): ComscoreAdvertisementMetadata {
    // Mapear tipo de anuncio del plugin al tipo de ComScore
    let adType: ComscoreAdvertisementType;
    switch (params.adType) {
      case 'preroll':
        adType = ComscoreAdvertisementType.onDemandPreRoll;
        break;
      case 'midroll':
        adType = ComscoreAdvertisementType.onDemandMidRoll;
        break;
      case 'postroll':
        adType = ComscoreAdvertisementType.onDemandPostRoll;
        break;
      default:
        // Si no está especificado, intentar detectar por posición
        if (typeof params.adPosition === 'number') {
          if (params.adPosition === 0) {
            adType = ComscoreAdvertisementType.onDemandPreRoll;
          } else {
            adType = ComscoreAdvertisementType.onDemandMidRoll;
          }
        } else {
          adType = ComscoreAdvertisementType.other;
        }
    }

    // Crear metadatos básicos del anuncio
    const adMetadata: ComscoreAdvertisementMetadata = {
      mediaType: adType,
      length: params.adDuration || 0, // ComScore requiere duración en ms
      uniqueId: params.adId || '0', // Usar "0" si no hay ID disponible
      relatedContentMetadata: this.context.metadata, // Contenido relacionado
    };

    // Agregar metadatos adicionales si están disponibles
    if (params.adPosition !== undefined) {
      adMetadata.customLabels = {
        adPosition: params.adPosition.toString(),
        adBreakId: this.currentAdBreakId || 'unknown',
      };
    }

    if (__DEV__) {
      this.logger.debug('Created ad metadata', {
        adMetadata,
        detectedType: adType,
        originalType: params.adType,
        hasPosition: params.adPosition !== undefined,
        hasDuration: params.adDuration !== undefined,
      });
    }

    return adMetadata;
  }

  // Método para validar parámetros de anuncio
  private validateAdParams(params: AdBeginParams): {
    isValid: boolean;
    errors: string[];
    warnings: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Validaciones recomendadas
    if (!params.adId) {
      warnings.push('adId is recommended for better ad tracking');
    }

    if (!params.adDuration || params.adDuration <= 0) {
      warnings.push(
        'adDuration should be provided and positive for accurate tracking'
      );
    }

    if (
      params.adType &&
      !['preroll', 'midroll', 'postroll'].includes(params.adType)
    ) {
      warnings.push(
        `Unknown adType: ${params.adType}, will be mapped to 'other'`
      );
    }

    // Validaciones de posición
    if (params.adPosition !== undefined && params.adPosition < 0) {
      errors.push('adPosition should not be negative');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  // Métodos de utilidad pública
  getCurrentAdMetadata(): ComscoreAdvertisementMetadata | null {
    return this.currentAdMetadata;
  }

  getCurrentAdBreakId(): string | null {
    return this.currentAdBreakId;
  }

  isInAdBreak(): boolean {
    return this.currentAdBreakId !== null;
  }

  getAdBreakDuration(): number {
    return this.adBreakStartTime > 0 ? Date.now() - this.adBreakStartTime : 0;
  }

  // Método para establecer metadatos de anuncio personalizados
  setAdMetadata(metadata: ComscoreAdvertisementMetadata): void {
    this.currentAdMetadata = metadata;

    const adMetadata = {
      ...this.context.metadata,
      advertisementMetadata: metadata,
    };

    this.context.connector.setMetadata(adMetadata);
    this.stateManager.setCurrentContentMetadata(adMetadata);

    if (__DEV__) {
      this.logger.debug('Custom ad metadata set', {
        metadata,
        hasUniqueId: !!metadata.uniqueId,
        mediaType: metadata.mediaType,
        length: metadata.length,
      });
    }
  }

  // Métodos de validación y utilidad
  validateAdBreakState(): {
    isValid: boolean;
    errors: string[];
    warnings: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];
    const currentState = this.stateManager.getCurrentState();

    // Validar estado consistente
    if (this.stateManager.getInAd() && !StateUtils.isAdState(currentState)) {
      errors.push('InAd flag is true but state is not an ad state');
    }

    if (!this.stateManager.getInAd() && StateUtils.isAdState(currentState)) {
      errors.push('InAd flag is false but state is an ad state');
    }

    // Validar metadatos de anuncio
    if (this.stateManager.getInAd() && !this.currentAdMetadata) {
      warnings.push('In ad but no ad metadata available');
    }

    // Validar ad break
    if (this.isInAdBreak() && !this.stateManager.getInAd()) {
      warnings.push('In ad break but no individual ad is playing');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  // Método para obtener estadísticas de anuncios
  getAdStatistics(): {
    isInAd: boolean;
    isInAdBreak: boolean;
    currentAdDuration?: number;
    currentAdBreakDuration?: number;
    hasAdMetadata: boolean;
    currentAdOffset: number;
    currentState: ComscoreState;
  } {
    const currentState = this.stateManager.getCurrentState();

    return {
      isInAd: this.stateManager.getInAd(),
      isInAdBreak: this.isInAdBreak(),
      currentAdDuration:
        this.adStartTime > 0 ? Date.now() - this.adStartTime : undefined,
      currentAdBreakDuration: this.getAdBreakDuration(),
      hasAdMetadata: !!this.currentAdMetadata,
      currentAdOffset: this.stateManager.getCurrentAdOffset(),
      currentState,
    };
  }

  // Método para forzar limpieza de estado de anuncio
  forceCleanAdState(): void {
    const currentState = this.stateManager.getCurrentState();

    if (__DEV__) {
      this.logger.info('Forcing ad state cleanup', {
        currentState,
        wasInAd: this.stateManager.getInAd(),
        wasInAdBreak: this.isInAdBreak(),
      });
    }

    // Limpiar todo el estado de anuncio
    this.stateManager.setInAd(false);
    this.currentAdMetadata = null;
    this.currentAdBreakId = null;
    this.adBreakStartTime = 0;
    this.adStartTime = 0;
    this.stateManager.setCurrentAdOffset(0.0);

    // Restaurar metadatos originales
    this.context.connector.setMetadata(this.context.metadata);
    this.stateManager.setCurrentContentMetadata(this.context.metadata);

    // Transicionar a video si estábamos en estado de anuncio
    if (StateUtils.isAdState(currentState)) {
      this.stateManager.transitionToVideo('forced_cleanup');
    }
  }

  // Método para exportar snapshot completo para debugging
  exportAdSnapshot(): {
    currentAdMetadata: ComscoreAdvertisementMetadata | null;
    currentAdBreakId: string | null;
    statistics: {
      isInAd: boolean;
      isInAdBreak: boolean;
      currentAdDuration?: number;
      currentAdBreakDuration?: number;
      hasAdMetadata: boolean;
      currentAdOffset: number;
      currentState: ComscoreState;
    };
    validation: {
      isValid: boolean;
      errors: string[];
      warnings: string[];
    };
    timings: {
      adStartTime: number;
      adBreakStartTime: number;
      currentAdDuration?: number;
      currentAdBreakDuration?: number;
    };
  } {
    return {
      currentAdMetadata: this.currentAdMetadata
        ? { ...this.currentAdMetadata }
        : null,
      currentAdBreakId: this.currentAdBreakId,
      statistics: this.getAdStatistics(),
      validation: this.validateAdBreakState(),
      timings: {
        adStartTime: this.adStartTime,
        adBreakStartTime: this.adBreakStartTime,
        currentAdDuration:
          this.adStartTime > 0 ? Date.now() - this.adStartTime : undefined,
        currentAdBreakDuration: this.getAdBreakDuration(),
      },
    };
  }
}
