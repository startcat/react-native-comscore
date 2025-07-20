import { type MutableHandlerContext } from '../handlers/types';
import { type ComscoreStateManager } from './ComscoreStateManager';
import { type ComponentLogger } from '../logger/types';
import { type MetadataChangeInfo } from './types';
import {
  type MetadataParams,
  type DurationChangeParams,
} from '../types/AnalyticsPlugin';
import { type ComscoreMetadata } from '../types/ComscoreMetadata';

export class ComscoreMetadataHandler {
  private context: MutableHandlerContext;
  private stateManager: ComscoreStateManager;
  private logger: ComponentLogger;

  // Estado de metadatos
  private currentMetadata: ComscoreMetadata | null = null;
  private metadataHistory: MetadataChangeInfo[] = [];
  private maxHistorySize = 20;

  // Flags para tracking de cambios
  private isMetadataLoaded = false;
  private isDurationKnown = false;
  private lastKnownDuration: number | null = null;

  constructor(
    context: MutableHandlerContext,
    stateManager: ComscoreStateManager
  ) {
    this.context = context;
    this.stateManager = stateManager;
    this.logger = context.logger.forComponent('MetadataHandler');

    // Inicializar con metadatos del contexto
    this.currentMetadata = { ...context.metadata };
  }

  // Evento cuando se cargan los metadatos iniciales
  handleMetadataLoaded(params: MetadataParams): void {
    if (__DEV__) {
      this.logger.info('📄 handleMetadataLoaded', params);
    }

    this.isMetadataLoaded = true;

    // Procesar metadatos cargados
    if (params.metadata) {
      const changeInfo = this.createMetadataChangeInfo(
        this.currentMetadata,
        params.metadata,
        'load'
      );

      this.updateMetadata(params.metadata, changeInfo);

      // Notificar a ComScore sobre los metadatos cargados
      this.context.connector.setMetadata(this.currentMetadata!);
    }

    // Establecer metadatos en el state manager
    this.stateManager.setCurrentContentMetadata(this.currentMetadata);

    // Detectar tipo de contenido basado en metadatos
    this.detectContentType();

    if (__DEV__) {
      this.logger.debug('Metadata loaded and processed', {
        hasMetadata: !!this.currentMetadata,
        contentType: this.getContentType(),
        isLive: this.isLiveContent(),
        metadataFields: Object.keys(this.currentMetadata || {}),
      });
    }
  }

  // Evento cuando se actualizan los metadatos durante la reproducción
  handleMetadataUpdate(params: MetadataParams): void {
    if (__DEV__) {
      this.logger.info('📄 handleMetadataUpdate', params);
    }

    if (params.metadata) {
      const changeInfo = this.createMetadataChangeInfo(
        this.currentMetadata,
        params.metadata,
        'update'
      );

      this.updateMetadata(params.metadata, changeInfo);

      // Actualizar en el connector si hay cambios significativos
      if (this.hasSignificantChanges(changeInfo)) {
        this.context.connector.update(this.currentMetadata!);

        if (__DEV__) {
          this.logger.debug(
            'Significant metadata changes updated in ComScore',
            {
              affectedFields: changeInfo.affectedFields,
              changeType: changeInfo.changeType,
            }
          );
        }
      } else if (__DEV__) {
        this.logger.debug(
          'Metadata update processed but not sent to ComScore (no significant changes)',
          {
            affectedFields: changeInfo.affectedFields,
          }
        );
      }
    }
  }

  // Evento cuando cambia la duración del contenido
  handleDurationChange(params: DurationChangeParams): void {
    if (__DEV__) {
      this.logger.info('📄 handleDurationChange', params);
    }

    const previousDuration = this.lastKnownDuration;
    this.lastKnownDuration = params.duration;

    // Determinar si es contenido live o VOD basado en la duración
    const wasLive = this.isLiveContentByDuration(previousDuration);
    const isNowLive = this.isLiveContentByDuration(params.duration);

    if (wasLive !== isNowLive) {
      if (__DEV__) {
        this.logger.info('Content type changed', {
          from: wasLive ? 'live' : 'vod',
          to: isNowLive ? 'live' : 'vod',
          previousDuration,
          newDuration: params.duration,
        });
      }

      // Actualizar metadatos para reflejar el cambio de tipo
      this.updateContentTypeMetadata(isNowLive);
    }

    // Crear nueva sesión si cambió significativamente la duración
    if (
      this.shouldCreateNewSessionForDurationChange(
        previousDuration,
        params.duration
      )
    ) {
      if (__DEV__) {
        this.logger.info(
          'Creating new session due to significant duration change',
          {
            previousDuration,
            newDuration: params.duration,
            wasLive,
            isNowLive,
          }
        );
      }
      this.context.connector.createPlaybackSession();
    }

    // Actualizar flags de estado
    this.isDurationKnown = !isNaN(params.duration) && params.duration > 0;

    // Registrar el cambio en metadatos
    if (this.currentMetadata) {
      const updatedMetadata = {
        ...this.currentMetadata,
        length: params.duration * 1000, // ComScore usa milisegundos
      };

      const changeInfo = this.createMetadataChangeInfo(
        this.currentMetadata,
        updatedMetadata,
        'duration_change'
      );

      this.updateMetadata(updatedMetadata, changeInfo);

      // Siempre notificar cambios de duración a ComScore
      this.context.connector.update(this.currentMetadata);
    }

    // Configurar DVR window para contenido live si es aplicable
    if (isNowLive) {
      this.configureDvrWindowIfNeeded();
    }
  }

  // Métodos privados
  private createMetadataChangeInfo(
    previous: ComscoreMetadata | null,
    current: ComscoreMetadata,
    changeType: MetadataChangeInfo['changeType']
  ): MetadataChangeInfo {
    const affectedFields = this.findAffectedFields(previous, current);

    return {
      previousMetadata: previous ? { ...previous } : null,
      newMetadata: { ...current },
      changeType,
      timestamp: Date.now(),
      affectedFields,
    };
  }

  private findAffectedFields(
    previous: ComscoreMetadata | null,
    current: ComscoreMetadata
  ): string[] {
    if (!previous) {
      return Object.keys(current);
    }

    const affected: string[] = [];
    const allKeys = new Set([
      ...Object.keys(previous),
      ...Object.keys(current),
    ]);

    for (const key of allKeys) {
      if (
        previous[key as keyof ComscoreMetadata] !==
        current[key as keyof ComscoreMetadata]
      ) {
        affected.push(key);
      }
    }

    return affected;
  }

  private updateMetadata(
    metadata: ComscoreMetadata,
    changeInfo: MetadataChangeInfo
  ): void {
    this.currentMetadata = { ...metadata };

    // Agregar al historial
    this.addToMetadataHistory(changeInfo);

    // Actualizar en el state manager
    this.stateManager.setCurrentContentMetadata(this.currentMetadata);

    if (__DEV__) {
      this.logger.debug('Metadata updated', {
        changeType: changeInfo.changeType,
        affectedFields: changeInfo.affectedFields,
        hasSignificantChanges: this.hasSignificantChanges(changeInfo),
      });
    }
  }

  private addToMetadataHistory(changeInfo: MetadataChangeInfo): void {
    this.metadataHistory.push(changeInfo);

    // Mantener solo los cambios más recientes
    if (this.metadataHistory.length > this.maxHistorySize) {
      this.metadataHistory.shift();
    }
  }

  private hasSignificantChanges(changeInfo: MetadataChangeInfo): boolean {
    // Definir qué cambios son significativos para ComScore
    const significantFields = [
      'uniqueId',
      'programTitle',
      'length',
      'publisherName',
      'programTitle',
      'episodeTitle',
      'contentId',
      'publisherBrandName',
      'stationTitle',
    ];

    const hasSignificantFieldChange = changeInfo.affectedFields.some((field) =>
      significantFields.includes(field)
    );

    // Los cambios de tipo (load, complete_change) siempre son significativos
    const isSignificantChangeType =
      changeInfo.changeType === 'load' ||
      changeInfo.changeType === 'complete_change';

    // Los cambios de duración siempre son significativos
    const hasDurationChange = changeInfo.changeType === 'duration_change';

    return (
      hasSignificantFieldChange || isSignificantChangeType || hasDurationChange
    );
  }

  // Método público para obtener diferencias entre metadatos
  getMetadataDiff(otherMetadata: ComscoreMetadata): {
    added: string[];
    removed: string[];
    changed: string[];
  } {
    if (!this.currentMetadata) {
      return {
        added: Object.keys(otherMetadata),
        removed: [],
        changed: [],
      };
    }

    const currentKeys = Object.keys(this.currentMetadata);
    const otherKeys = Object.keys(otherMetadata);

    const added = otherKeys.filter((key) => !currentKeys.includes(key));
    const removed = currentKeys.filter((key) => !otherKeys.includes(key));
    const changed = currentKeys.filter(
      (key) =>
        otherKeys.includes(key) &&
        this.currentMetadata![key as keyof ComscoreMetadata] !==
          otherMetadata[key as keyof ComscoreMetadata]
    );

    return { added, removed, changed };
  }

  // Método para verificar si los metadatos están completos para ComScore
  areMetadataComplete(): {
    isComplete: boolean;
    missingRequired: string[];
    missingRecommended: string[];
  } {
    const missingRequired: string[] = [];
    const missingRecommended: string[] = [];

    if (!this.currentMetadata) {
      return {
        isComplete: false,
        missingRequired: ['all metadata'],
        missingRecommended: [],
      };
    }

    // Campos requeridos por ComScore
    if (!this.currentMetadata.uniqueId) missingRequired.push('uniqueId');

    // Campos recomendados para mejor tracking
    if (!this.currentMetadata.programTitle)
      missingRecommended.push('programTitle');
    if (!this.currentMetadata.publisherName)
      missingRecommended.push('publisherName');
    if (typeof this.currentMetadata.length !== 'number')
      missingRecommended.push('length');

    return {
      isComplete: missingRequired.length === 0,
      missingRequired,
      missingRecommended,
    };
  }

  // Método para manejar cambios en el contexto (cuando se actualiza desde el exterior)
  handleContextMetadataChange(): void {
    const contextMetadata = this.context.metadata;

    if (
      !this.currentMetadata ||
      JSON.stringify(this.currentMetadata) !== JSON.stringify(contextMetadata)
    ) {
      if (__DEV__) {
        this.logger.info('Context metadata changed, updating handler state');
      }

      const changeInfo = this.createMetadataChangeInfo(
        this.currentMetadata,
        contextMetadata,
        'update'
      );

      this.updateMetadata(contextMetadata, changeInfo);

      // Sincronizar con ComScore si hay cambios significativos
      if (this.hasSignificantChanges(changeInfo)) {
        this.context.connector.update(this.currentMetadata!);
      }
    }
  }

  // Método para exportar metadatos para debugging
  exportMetadataSnapshot(): {
    current: ComscoreMetadata | null;
    history: MetadataChangeInfo[];
    statistics: {
      changesCount: number;
      lastChangeTime?: number;
      isLoaded: boolean;
      isDurationKnown: boolean;
      contentType: string;
      significantChanges: number;
      currentMetadataSize: number;
      hasCustomDimensions: boolean;
    };
    validation: {
      isComplete: boolean;
      missingRequired: string[];
      missingRecommended: string[];
    };
  } {
    return {
      current: this.currentMetadata ? { ...this.currentMetadata } : null,
      history: [...this.metadataHistory],
      statistics: this.getMetadataStatistics(),
      validation: this.areMetadataComplete(),
    };
  }

  // Método público para configurar la ventana DVR manualmente
  setDvrWindow(windowLengthInSeconds: number): void {
    if (!this.isLiveContent()) {
      this.logger.warn('DVR window can only be set for live content');
      return;
    }

    const windowLengthMs = windowLengthInSeconds * 1000;

    try {
      this.context.connector.setDvrWindowLength(windowLengthMs);

      if (__DEV__) {
        this.logger.info('DVR window manually configured', {
          windowLengthSeconds: windowLengthInSeconds,
          windowLengthMs,
        });
      }
    } catch (error) {
      this.logger.error('Failed to set DVR window length', error);
    }
  }

  private detectContentType(): void {
    if (!this.currentMetadata) return;

    const isLive = this.isLiveContent();
    const contentType = this.getContentType();

    if (__DEV__) {
      this.logger.debug('Content type detected', {
        isLive,
        contentType,
        duration: this.lastKnownDuration,
        uniqueId: this.currentMetadata.uniqueId,
      });
    }

    // Notificar tipo de contenido a ComScore via metadatos
    if (this.currentMetadata) {
      const typeMetadata = {
        ...this.currentMetadata,
        customLabels: {
          ...this.currentMetadata.customLabels,
          detectedContentType: contentType,
          isLiveStream: isLive.toString(),
          durationKnown: this.isDurationKnown.toString(),
        },
      };

      this.context.connector.update(typeMetadata);
      this.stateManager.setCurrentContentMetadata(typeMetadata);
      this.currentMetadata = typeMetadata;
    }

    // Configurar ComScore basado en el tipo de contenido
    if (isLive) {
      this.configureDvrWindowIfNeeded();
    }
  }

  private isLiveContentByDuration(duration: number | null): boolean {
    if (duration === null) return false;
    return duration === 0 || isNaN(duration);
  }

  private configureDvrWindowIfNeeded(): void {
    // Para contenido live, configurar DVR window si está disponible
    // Esto se haría típicamente cuando se conoce la ventana DVR disponible
    if (__DEV__) {
      this.logger.debug(
        'Live content detected, DVR window configuration may be needed'
      );
    }

    // Nota: Aquí se configuraría la ventana DVR si la información estuviera disponible
    // Por ejemplo: this.context.connector.setDvrWindowLength(windowLengthInMs);
  }

  private updateContentTypeMetadata(isLive: boolean): void {
    if (!this.currentMetadata) return;

    // Actualizar metadatos basados en el tipo de contenido
    const updatedMetadata = {
      ...this.currentMetadata,
      customLabels: {
        ...this.currentMetadata.customLabels,
        contentType: isLive ? 'live' : 'vod',
        isLiveStream: isLive.toString(),
        lastContentTypeChange: Date.now().toString(),
      },
    };

    const changeInfo = this.createMetadataChangeInfo(
      this.currentMetadata,
      updatedMetadata,
      'complete_change'
    );

    this.updateMetadata(updatedMetadata, changeInfo);

    // Notificar al connector sobre el cambio significativo
    this.context.connector.update(this.currentMetadata);

    if (__DEV__) {
      this.logger.debug('Content type metadata updated in ComScore', {
        contentType: isLive ? 'live' : 'vod',
        isLive,
        hasSignificantChanges: this.hasSignificantChanges(changeInfo),
      });
    }
  }

  private shouldCreateNewSessionForDurationChange(
    previousDuration: number | null,
    newDuration: number
  ): boolean {
    // Crear nueva sesión si:
    // 1. Cambió de live a VOD o viceversa
    // 2. La duración cambió significativamente (más del 10%)

    if (previousDuration === null) return false;

    const wasLive = previousDuration === 0 || isNaN(previousDuration);
    const isNowLive = newDuration === 0 || isNaN(newDuration);

    if (wasLive !== isNowLive) {
      return true;
    }

    // Para contenido VOD, verificar cambio significativo
    if (!wasLive && !isNowLive) {
      const change =
        Math.abs(newDuration - previousDuration) / previousDuration;
      return change > 0.1; // Más del 10% de cambio
    }

    return false;
  }

  // Métodos públicos de utilidad
  getCurrentMetadata(): ComscoreMetadata | null {
    return this.currentMetadata ? { ...this.currentMetadata } : null;
  }

  isLiveContent(): boolean {
    return (
      this.lastKnownDuration === 0 ||
      isNaN(this.lastKnownDuration || 0) ||
      this.lastKnownDuration === null
    );
  }

  getContentType(): 'live' | 'vod' | 'unknown' {
    if (this.lastKnownDuration === null) return 'unknown';
    return this.isLiveContent() ? 'live' : 'vod';
  }

  getDuration(): number | null {
    return this.lastKnownDuration;
  }

  isMetadataLoadedFlag(): boolean {
    return this.isMetadataLoaded;
  }

  isDurationKnownFlag(): boolean {
    return this.isDurationKnown;
  }

  getMetadataHistory(): MetadataChangeInfo[] {
    return [...this.metadataHistory]; // Retornar copia
  }

  // Método para actualizar metadatos manualmente
  updateMetadataManually(metadata: Partial<ComscoreMetadata>): void {
    if (!this.currentMetadata) {
      this.logger.warn('Cannot update metadata: no current metadata available');
      return;
    }

    const updatedMetadata = {
      ...this.currentMetadata,
      ...metadata,
    };

    const changeInfo = this.createMetadataChangeInfo(
      this.currentMetadata,
      updatedMetadata,
      'update'
    );

    this.updateMetadata(updatedMetadata, changeInfo);

    // Siempre notificar al connector para actualizaciones manuales
    this.context.connector.update(this.currentMetadata);

    // También actualizar el contexto si es necesario
    if (this.hasSignificantChanges(changeInfo)) {
      this.context.updateMetadata(this.currentMetadata);
    }

    if (__DEV__) {
      this.logger.info('Metadata manually updated', {
        updatedFields: Object.keys(metadata),
        hasSignificantChanges: this.hasSignificantChanges(changeInfo),
        newMetadataKeys: Object.keys(this.currentMetadata),
      });
    }
  }

  // Método para reiniciar el estado de metadatos
  resetMetadataState(): void {
    this.isMetadataLoaded = false;
    this.isDurationKnown = false;
    this.lastKnownDuration = null;
    this.metadataHistory = [];

    // Restaurar metadatos originales del contexto
    this.currentMetadata = { ...this.context.metadata };
    this.stateManager.setCurrentContentMetadata(this.currentMetadata);

    if (__DEV__) {
      this.logger.debug('Metadata state reset');
    }
  }

  // Método para obtener estadísticas de metadatos
  getMetadataStatistics(): {
    changesCount: number;
    lastChangeTime?: number;
    isLoaded: boolean;
    isDurationKnown: boolean;
    contentType: string;
    significantChanges: number;
    currentMetadataSize: number;
    hasCustomDimensions: boolean;
  } {
    const significantChanges = this.metadataHistory.filter((change) =>
      this.hasSignificantChanges(change)
    ).length;

    const lastChange = this.metadataHistory[this.metadataHistory.length - 1];
    const currentMetadataSize = this.currentMetadata
      ? Object.keys(this.currentMetadata).length
      : 0;
    const hasCustomDimensions = !!(
      this.currentMetadata?.customLabels &&
      Object.keys(this.currentMetadata.customLabels).length > 0
    );

    return {
      changesCount: this.metadataHistory.length,
      lastChangeTime: lastChange?.timestamp,
      isLoaded: this.isMetadataLoaded,
      isDurationKnown: this.isDurationKnown,
      contentType: this.getContentType(),
      significantChanges,
      currentMetadataSize,
      hasCustomDimensions,
    };
  }

  // Método para validar metadatos antes de enviar a ComScore
  private validateMetadata(metadata: ComscoreMetadata): {
    isValid: boolean;
    errors: string[];
    warnings: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Validaciones requeridas por ComScore
    if (!metadata.uniqueId) {
      errors.push('uniqueId is required');
    }

    if (!metadata.programTitle) {
      warnings.push('programTitle is recommended for better tracking');
    }

    if (typeof metadata.length !== 'number' || metadata.length < 0) {
      warnings.push('length should be a positive number in milliseconds');
    }

    // Validaciones específicas para live vs VOD
    const isLive = this.isLiveContent();
    if (isLive && metadata.length > 0) {
      warnings.push('Live content should have length = 0 or NaN');
    }

    if (!isLive && (!metadata.length || metadata.length <= 0)) {
      warnings.push('VOD content should have a positive length');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  // Método para forzar sincronización con ComScore
  forceSync(): void {
    if (!this.currentMetadata) {
      this.logger.warn('Cannot force sync: no metadata available');
      return;
    }

    const validation = this.validateMetadata(this.currentMetadata);

    if (!validation.isValid) {
      this.logger.error('Cannot sync invalid metadata', {
        errors: validation.errors,
        warnings: validation.warnings,
      });
      return;
    }

    if (__DEV__ && validation.warnings.length > 0) {
      this.logger.warn('Syncing metadata with warnings', {
        warnings: validation.warnings,
      });
    }

    this.context.connector.update(this.currentMetadata);

    if (__DEV__) {
      this.logger.info('Forced metadata sync completed', {
        metadataKeys: Object.keys(this.currentMetadata),
        contentType: this.getContentType(),
      });
    }
  }
}
