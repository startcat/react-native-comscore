/*
 *  ComScore Plugin - Plugin principal con arquitectura de handlers
 *  Orquesta todos los handlers y delega eventos de la interfaz PlayerPlugin
 *
 */

import type { ComscorePluginInterface } from '../types/ComscorePlugin';
import type { ComscoreMetadata } from '../types/ComscoreMetadata';
import type { ComscoreConfiguration } from '../types/ComscoreConfiguration';

import {
  type MetadataParams,
  type DurationChangeParams,
  type StopParams,
  type SeekEndParams,
  type PositionChangeParams,
  type PositionUpdateParams,
  type ProgressParams,
  type PlaybackRateChangeParams,
  type AdBeginParams,
  type AdEndParams,
  type AdBreakBeginParams,
  type AdBreakEndParams,
  type ErrorParams,
  type ContentProtectionErrorParams,
  type NetworkErrorParams,
  type StreamErrorParams,
  type AudioTrackChangeParams,
  type VolumeChangeParams,
  type MuteChangeParams,
  type SubtitleTrackChangeParams,
  type SubtitleShowParams,
  type QualityChangeParams,
  type BitrateChangeParams,
  type ResolutionChangeParams,
} from '../types/AnalyticsPlugin';

import { ComscoreLogger, ComscoreLoggerFactory } from '../logger';
import { ComscoreConnector } from '../api';
import { type ComscorePluginConfig } from './types';

// Import package.json to get version
import packageJson from '../../package.json';

import {
  type MutableHandlerContext,
  ComscoreApplicationHandler,
  ComscorePlaybackHandler,
  ComscoreQualityHandler,
  DefaultMutableHandlerContext,
  StateManagerFactory,
  ComscoreStateManager,
  ComscoreErrorHandler,
  ComscoreMetadataHandler,
  ComscoreAdvertisementHandler,
} from '../handlers';

export class ComscorePlugin implements ComscorePluginInterface {
  // Propiedades requeridas por PlayerPlugin
  public name = 'ComscorePlugin';
  public version = packageJson.version;

  // Dependencias principales
  private context: MutableHandlerContext;
  private logger: ComscoreLogger;
  private stateManager: ComscoreStateManager;
  private config: Required<ComscorePluginConfig>;

  // Handlers implementados
  private playbackHandler!: ComscorePlaybackHandler;
  private applicationHandler!: ComscoreApplicationHandler;
  private advertisementHandler!: ComscoreAdvertisementHandler;
  private errorHandler!: ComscoreErrorHandler;
  private metadataHandler!: ComscoreMetadataHandler;
  private qualityHandler!: ComscoreQualityHandler;

  constructor(
    metadata: ComscoreMetadata,
    configuration: ComscoreConfiguration,
    pluginConfig: ComscorePluginConfig = {}
  ) {
    // Configuración del plugin
    this.config = this.mergeConfig(pluginConfig);

    // Crear logger
    this.logger = ComscoreLoggerFactory.createFromComscoreConfig(
      configuration.debug ?? false
    );

    // Crear conector
    const connector = new ComscoreConnector(configuration, metadata);

    // Crear contexto
    this.context = new DefaultMutableHandlerContext(
      connector,
      metadata,
      configuration,
      this.logger
    );

    // Establecer instanceId en el logger
    this.logger.setInstanceId(this.context.instanceId);

    // Crear StateManager
    this.stateManager = StateManagerFactory.createWithConfig(
      this.context,
      this.config.stateManagerConfig
    );

    // Inicializar handlers implementados
    this.initializeImplementedHandlers();

    // Log de inicialización
    this.logger.info('ComscorePlugin', 'Plugin initialized', {
      version: this.version,
      instanceId: this.context.instanceId,
      enabledHandlers: this.getEnabledHandlerNames(),
    });
  }

  /*
   *  Métodos de ComscorePluginInterface (específicos de ComScore)
   *
   */

  update(metadata: ComscoreMetadata): void {
    this.logger.debug(
      'ComscorePlugin',
      'Updating metadata',
      JSON.stringify(metadata)
    );
    this.context.updateMetadata(metadata);
    this.context.connector.update(metadata);
  }

  setPersistentLabel(label: string, value: string): void {
    this.logger.debug('ComscorePlugin', 'Setting persistent label', {
      label,
      value,
    });
    this.context.connector.setPersistentLabel(label, value);
  }

  setPersistentLabels(labels: { [key: string]: string }): void {
    this.logger.debug('ComscorePlugin', 'Setting persistent labels', labels);
    this.context.connector.setPersistentLabels(labels);
  }

  getInstanceId(): number {
    return this.context.instanceId;
  }

  /*
   * Resetea completamente el estado interno del plugin para poder reutilizarlo.
   * Debe llamarse antes de procesar un nuevo contenido.
   *
   */

  reset(): void {
    this.logger.info('ComscorePlugin', 'Resetting plugin state', {
      instanceId: this.context.instanceId,
    });

    // 1. Notificar fin de sesión actual a ComScore
    if (this.context.connector) {
      this.context.connector.notifyEnd();
    }

    // 2. Resetear StateManager (descongelar estado)
    if (this.stateManager) {
      this.stateManager.reset();
    }

    // 3. Resetear todos los handlers que tienen métodos de reset
    if (this.metadataHandler) {
      this.metadataHandler.resetMetadataState();
    }

    if (this.qualityHandler) {
      this.qualityHandler.resetStatistics();
    }

    if (this.errorHandler) {
      this.errorHandler.resetErrorCounts();
    }

    // 4. Los handlers de playback, application y advertisement no necesitan reset
    // ya que su estado se gestiona a través del StateManager

    this.logger.info('ComscorePlugin', 'Plugin reset completed', {
      instanceId: this.context.instanceId,
    });
  }

  /*
   *  Eventos principales del reproductor (PlayerPlugin)
   *
   */

  onSourceChange?(): void {
    this.logger.info('ComscorePlugin', '🎯 onSourceChange');
    if (this.config.enabledHandlers.playback) {
      this.playbackHandler.handleSourceChange();
    }
  }

  onCreatePlaybackSession?(): void {
    this.logger.info('ComscorePlugin', '🎯 onCreatePlaybackSession');
    this.context.connector.createPlaybackSession();
  }

  onMetadataLoaded?(params: MetadataParams): void {
    this.logger.info(
      'ComscorePlugin',
      '🎯 onMetadataLoaded',
      JSON.stringify(params)
    );
    if (this.config.enabledHandlers.playback) {
      this.playbackHandler.handleMetadataLoaded();
    }
    if (this.config.enabledHandlers.metadata) {
      this.metadataHandler.handleMetadataLoaded(params);
    }
  }

  onMetadataUpdate?(params: MetadataParams): void {
    this.logger.info(
      'ComscorePlugin',
      '🎯 onMetadataUpdate',
      JSON.stringify(params)
    );
    if (this.config.enabledHandlers.metadata && params.metadata) {
      this.metadataHandler.handleMetadataUpdate(params);
    }
  }

  onDurationChange?(params: DurationChangeParams): void {
    this.logger.info('ComscorePlugin', '🎯 onDurationChange', params);
    if (this.config.enabledHandlers.playback) {
      this.playbackHandler.handleDurationChange(params.duration / 1000); // Convertir a segundos
    }
  }

  onPlay?(): void {
    this.logger.info('ComscorePlugin', '🎯 onPlay');
    if (this.config.enabledHandlers.playback) {
      this.playbackHandler.handlePlay();
    }
  }

  onPause?(): void {
    this.logger.info('ComscorePlugin', '🎯 onPause');
    if (this.config.enabledHandlers.playback) {
      this.playbackHandler.handlePause();
    }
  }

  onEnd?(): void {
    this.logger.info('ComscorePlugin', '🎯 onEnd');
    if (this.config.enabledHandlers.playback) {
      this.playbackHandler.handleEnd();
    }
  }

  onStop?(params: StopParams): void {
    this.logger.info('ComscorePlugin', '🎯 onStop', params);
    if (this.config.enabledHandlers.playback) {
      this.playbackHandler.handleStop();
    }
  }

  onBufferStart?(): void {
    this.logger.info('ComscorePlugin', '🎯 onBufferStart');
    if (this.config.enabledHandlers.playback) {
      this.playbackHandler.handleBuffering(true);
    }
  }

  onBufferStop?(): void {
    this.logger.info('ComscorePlugin', '🎯 onBufferStop');
    if (this.config.enabledHandlers.playback) {
      this.playbackHandler.handleBuffering(false);
    }
  }

  onSeekStart?(): void {
    this.logger.info('ComscorePlugin', '🎯 onSeekStart');
    if (this.config.enabledHandlers.playback) {
      this.playbackHandler.handleSeeking();
    }
  }

  onSeekEnd?(params: SeekEndParams): void {
    this.logger.info('ComscorePlugin', '🎯 onSeekEnd', params);
    if (this.config.enabledHandlers.playback) {
      this.playbackHandler.handleSeeked(
        params.position / 1000,
        params.duration ? params.duration / 1000 : undefined
      );
    }
  }

  onPositionChange?(params: PositionChangeParams): void {
    // Este evento es muy frecuente, solo log en verbose mode
    if (this.config.loggerConfig.enableVerboseLogging) {
      this.logger.debug('ComscorePlugin', '🎯 onPositionChange', params);
    }
    // ComScore maneja esto internamente, no necesita implementación específica
  }

  onPositionUpdate?(params: PositionUpdateParams): void {
    // Este evento es muy frecuente, solo log en verbose mode
    if (this.config.loggerConfig.enableVerboseLogging) {
      this.logger.debug('ComscorePlugin', '🎯 onPositionUpdate', params);
    }
    // ComScore maneja esto internamente, no necesita implementación específica
  }

  onProgress?(params: ProgressParams): void {
    // Log cada 10 segundos para evitar spam
    if (params.position % 10000 === 0) {
      this.logger.debug('ComscorePlugin', '🎯 onProgress', {
        position: params.position / 1000,
        duration: params.duration ? params.duration / 1000 : 'unknown',
      });
    }

    if (this.config.enabledHandlers.playback) {
      this.playbackHandler.handleProgress(
        params.position / 1000,
        params.duration ? params.duration / 1000 : undefined
      );
    }
  }

  onPlaybackRateChange?(params: PlaybackRateChangeParams): void {
    this.logger.info('ComscorePlugin', '🎯 onPlaybackRateChange', params);
    if (this.config.enabledHandlers.playback) {
      this.playbackHandler.handleRateChange(params.rate);
    }
  }

  /*
   *  Eventos de publicidad (por implementar)
   *
   */

  onAdBegin?(params: AdBeginParams): void {
    this.logger.info('ComscorePlugin', '🎯 onAdBegin', params);
    if (this.config.enabledHandlers.advertisement) {
      this.advertisementHandler.handleAdBegin(params);
    }
  }

  onAdEnd?(params: AdEndParams): void {
    this.logger.info('ComscorePlugin', '🎯 onAdEnd', params);
    if (this.config.enabledHandlers.advertisement) {
      this.advertisementHandler.handleAdEnd(params);
    }
  }

  onAdBreakBegin?(params: AdBreakBeginParams): void {
    this.logger.info('ComscorePlugin', '🎯 onAdBreakBegin', params);
    if (this.config.enabledHandlers.advertisement) {
      this.advertisementHandler.handleAdBreakBegin(params);
    }
  }

  onAdBreakEnd?(params: AdBreakEndParams): void {
    this.logger.info('ComscorePlugin', '🎯 onAdBreakEnd', params);
    if (this.config.enabledHandlers.advertisement) {
      this.advertisementHandler.handleAdBreakEnd(params);
    }
  }

  onContentResume?(): void {
    this.logger.info('ComscorePlugin', '🎯 onContentResume');
    if (this.config.enabledHandlers.advertisement) {
      this.advertisementHandler.handleContentResume();
    }
  }

  /*
   *  Eventos de errores (por implementar)
   *
   */

  onError?(params: ErrorParams): void {
    this.logger.error('ComscorePlugin', '🎯 onError', params);
    if (this.config.enabledHandlers.errors) {
      this.errorHandler.handleError(params);
    }
  }

  onContentProtectionError?(params: ContentProtectionErrorParams): void {
    this.logger.error('ComscorePlugin', '🎯 onContentProtectionError', params);
    if (this.config.enabledHandlers.errors) {
      this.errorHandler.handleContentProtectionError(params);
    }
  }

  onNetworkError?(params: NetworkErrorParams): void {
    this.logger.error('ComscorePlugin', '🎯 onNetworkError', params);
    if (this.config.enabledHandlers.errors) {
      this.errorHandler.handleNetworkError(params);
    }
  }

  onStreamError?(params: StreamErrorParams): void {
    this.logger.error('ComscorePlugin', '🎯 onStreamError', params);
    if (this.config.enabledHandlers.errors) {
      this.errorHandler.handleStreamError(params);
    }
  }

  /*
   *  Eventos de audio y subtítulos (por implementar)
   *
   */

  onAudioTrackChange?(params: AudioTrackChangeParams): void {
    this.logger.info('ComscorePlugin', '🎯 onAudioTrackChange', params);
    if (this.config.enabledHandlers.quality) {
      this.qualityHandler.handleAudioTrackChange(params);
    }
  }

  onVolumeChange?(params: VolumeChangeParams): void {
    this.logger.debug('ComscorePlugin', '🎯 onVolumeChange', params);
    if (this.config.enabledHandlers.quality) {
      this.qualityHandler.handleVolumeChange(params);
    }
  }

  onMuteChange?(params: MuteChangeParams): void {
    this.logger.info('ComscorePlugin', '🎯 onMuteChange', params);
    if (this.config.enabledHandlers.quality) {
      this.qualityHandler.handleMuteChange(params);
    }
  }

  onSubtitleTrackChange?(params: SubtitleTrackChangeParams): void {
    this.logger.info('ComscorePlugin', '🎯 onSubtitleTrackChange', params);
    if (this.config.enabledHandlers.quality) {
      this.qualityHandler.handleSubtitleTrackChange(params);
    }
  }

  onSubtitleShow?(params: SubtitleShowParams): void {
    this.logger.debug('ComscorePlugin', '🎯 onSubtitleShow', params);
    if (this.config.enabledHandlers.quality) {
      this.qualityHandler.handleSubtitleShow(params);
    }
  }

  onSubtitleHide?(): void {
    this.logger.debug('ComscorePlugin', '🎯 onSubtitleHide');
    if (this.config.enabledHandlers.quality) {
      this.qualityHandler.handleSubtitleHide();
    }
  }

  /*
   *  Eventos de calidad (por implementar)
   *
   */

  onQualityChange?(params: QualityChangeParams): void {
    this.logger.info('ComscorePlugin', '🎯 onQualityChange', params);
    if (this.config.enabledHandlers.quality) {
      this.qualityHandler.handleQualityChange(params);
    }
  }

  onBitrateChange?(params: BitrateChangeParams): void {
    this.logger.info('ComscorePlugin', '🎯 onBitrateChange', params);
    if (this.config.enabledHandlers.quality) {
      this.qualityHandler.handleBitrateChange(params);
    }
  }

  onResolutionChange?(params: ResolutionChangeParams): void {
    this.logger.info('ComscorePlugin', '🎯 onResolutionChange', params);
    if (this.config.enabledHandlers.quality) {
      this.qualityHandler.handleResolutionChange(params);
    }
  }

  /*
   *  Eventos específicos de estado de aplicación
   *
   */

  onApplicationForeground?(): void {
    this.logger.info('ComscorePlugin', '🎯 onApplicationForeground');
    if (this.config.enabledHandlers.application) {
      this.applicationHandler.handleApplicationForeground();
    }
  }

  onApplicationBackground?(): void {
    this.logger.info('ComscorePlugin', '🎯 onApplicationBackground');
    if (this.config.enabledHandlers.application) {
      this.applicationHandler.handleApplicationBackground();
    }
  }

  onApplicationActive?(): void {
    this.logger.info('ComscorePlugin', '🎯 onApplicationActive');
    if (this.config.enabledHandlers.application) {
      this.applicationHandler.handleApplicationActive();
    }
  }

  onApplicationInactive?(): void {
    this.logger.info('ComscorePlugin', '🎯 onApplicationInactive');
    if (this.config.enabledHandlers.application) {
      this.applicationHandler.handleApplicationInactive();
    }
  }

  /*
   *  Eventos específicos de ComScore (por implementar)
   *
   */

  onSetContentMetadata?(params: { metadata: ComscoreMetadata }): void {
    this.logger.info(
      'ComscorePlugin',
      '🎯 onSetContentMetadata',
      JSON.stringify(params)
    );
    this.update(params.metadata);
  }

  onSetAdvertisementMetadata?(params: any): void {
    this.logger.info(
      'ComscorePlugin',
      '🎯 onSetAdvertisementMetadata',
      JSON.stringify(params)
    );
    // TODO: Implementar cuando tengamos AdvertisementHandler
  }

  /*
   *  Eventos de DVR (por implementar)
   *
   */

  onStartFromPosition?(params: { position: number }): void {
    this.logger.info('ComscorePlugin', '🎯 onStartFromPosition', params);
    this.context.connector.startFromPosition(params.position);
  }

  onStartFromDvrWindowOffset?(params: { offset: number }): void {
    this.logger.info('ComscorePlugin', '🎯 onStartFromDvrWindowOffset', params);
    this.context.connector.startFromDvrWindowOffset(params.offset);
  }

  onSetDvrWindowLength?(params: { length: number }): void {
    this.logger.info('ComscorePlugin', '🎯 onSetDvrWindowLength', params);
    this.context.connector.setDvrWindowLength(params.length);
  }

  /*
   *  Limpieza
   *
   */

  destroy(): void {
    this.logger.info('ComscorePlugin', 'Destroying plugin', {
      instanceId: this.context.instanceId,
    });

    // Limpiar handlers
    // No necesitamos hacer nada específico ya que no mantienen estado persistente

    // Destruir conector
    this.context.connector?.destroy();

    this.logger.info('ComscorePlugin', 'Plugin destroyed');
  }

  /*
   *  Métodos privados
   *
   */

  private initializeImplementedHandlers(): void {
    // Inicializar handlers que ya están implementados
    if (this.config.enabledHandlers.playback) {
      this.playbackHandler = new ComscorePlaybackHandler(
        this.context,
        this.stateManager
      );
      this.logger.debug('ComscorePlugin', 'PlaybackHandler initialized');
    }

    if (this.config.enabledHandlers.application) {
      this.applicationHandler = new ComscoreApplicationHandler(
        this.context,
        this.stateManager
      );
      this.logger.debug('ComscorePlugin', 'ApplicationHandler initialized');
    }

    if (this.config.enabledHandlers.advertisement) {
      this.advertisementHandler = new ComscoreAdvertisementHandler(
        this.context,
        this.stateManager
      );
      this.logger.debug('ComscorePlugin', 'AdvertisementHandler initialized');
    }
    if (this.config.enabledHandlers.errors) {
      this.errorHandler = new ComscoreErrorHandler(
        this.context,
        this.stateManager
      );
      this.logger.debug('ComscorePlugin', 'ErrorHandler initialized');
    }
    if (this.config.enabledHandlers.metadata) {
      this.metadataHandler = new ComscoreMetadataHandler(
        this.context,
        this.stateManager
      );
      this.logger.debug('ComscorePlugin', 'MetadataHandler initialized');
    }
    if (this.config.enabledHandlers.quality) {
      this.qualityHandler = new ComscoreQualityHandler(
        this.context,
        this.stateManager
      );
      this.logger.debug('ComscorePlugin', 'QualityHandler initialized');
    }
  }

  private mergeConfig(
    pluginConfig: ComscorePluginConfig
  ): Required<ComscorePluginConfig> {
    return {
      enabledHandlers: {
        playback: true,
        application: true,
        advertisement: true,
        metadata: true,
        quality: true,
        errors: true,
        ...pluginConfig.enabledHandlers,
      },
      loggerConfig: {
        enableVerboseLogging: true,
        filterComponents: [],
        ...pluginConfig.loggerConfig,
      },
      stateManagerConfig: {
        validateTransitions: true,
        enableVerboseLogging: true,
        ...pluginConfig.stateManagerConfig,
      },
    };
  }

  private getEnabledHandlerNames(): string[] {
    const enabled = [];
    if (this.config.enabledHandlers.playback) enabled.push('playback');
    if (this.config.enabledHandlers.application) enabled.push('application');
    if (this.config.enabledHandlers.advertisement)
      enabled.push('advertisement');
    if (this.config.enabledHandlers.metadata) enabled.push('metadata');
    if (this.config.enabledHandlers.quality) enabled.push('quality');
    if (this.config.enabledHandlers.errors) enabled.push('errors');
    return enabled;
  }

  /*
   *  Métodos de debugging público
   *
   */

  public getStateSnapshot() {
    return this.stateManager.getStateSnapshot();
  }

  public logCurrentState(): void {
    this.stateManager.logCurrentState();
  }

  public getEnabledHandlers(): string[] {
    return this.getEnabledHandlerNames();
  }
}
