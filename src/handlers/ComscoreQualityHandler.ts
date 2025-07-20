import {
  type HandlerContext,
  type QualityInfo,
  type AudioInfo,
  type VolumeInfo,
  type SubtitleInfo,
} from './types';
import { type ComscoreStateManager } from './ComscoreStateManager';
import { type ComponentLogger } from '../logger/types';
import {
  type QualityChangeParams,
  type BitrateChangeParams,
  type ResolutionChangeParams,
  type AudioTrackChangeParams,
  type VolumeChangeParams,
  type MuteChangeParams,
  type SubtitleTrackChangeParams,
  type SubtitleShowParams,
} from '../types/AnalyticsPlugin';

export class ComscoreQualityHandler {
  private context: HandlerContext;
  private stateManager: ComscoreStateManager;
  private logger: ComponentLogger;

  // Estado actual de calidad y configuración
  private currentQuality: QualityInfo | null = null;
  private currentAudio: AudioInfo | null = null;
  private currentVolume: VolumeInfo = {
    volume: 1.0,
    muted: false,
    timestamp: Date.now(),
  };
  private currentSubtitle: SubtitleInfo | null = null;

  // Historial para análisis
  private qualityHistory: QualityInfo[] = [];
  private bitrateHistory: { bitrate: number; timestamp: number }[] = [];
  private maxHistorySize = 50;

  // Contadores y estadísticas
  private qualityChangeCount = 0;
  private bitrateChangeCount = 0;
  private audioTrackChangeCount = 0;
  private subtitleChangeCount = 0;

  // Configuración de umbral para cambios significativos
  private readonly SIGNIFICANT_BITRATE_CHANGE_THRESHOLD = 0.2; // 20%
  private readonly SIGNIFICANT_VOLUME_CHANGE_THRESHOLD = 0.1; // 10%

  constructor(context: HandlerContext, stateManager: ComscoreStateManager) {
    this.context = context;
    this.stateManager = stateManager;
    this.logger = context.logger.forComponent('QualityHandler');
  }

  // Eventos de calidad de video
  handleQualityChange(params: QualityChangeParams): void {
    if (__DEV__) {
      this.logger.info('📺 handleQualityChange', params);
    }

    const qualityInfo: QualityInfo = {
      quality: params.quality,
      width: params.width,
      height: params.height,
      bitrate: params.bitrate,
      timestamp: Date.now(),
    };

    // Actualizar estado actual
    this.currentQuality = qualityInfo;
    this.qualityChangeCount++;

    // Agregar al historial
    this.addToQualityHistory(qualityInfo);

    // Actualizar metadatos de ComScore si es un cambio significativo
    if (this.isSignificantQualityChange(qualityInfo)) {
      this.updateQualityMetadata(qualityInfo);
    }

    if (__DEV__) {
      this.logger.debug('Quality change processed', {
        quality: params.quality,
        resolution:
          params.width && params.height
            ? `${params.width}x${params.height}`
            : 'unknown',
        bitrate: params.bitrate,
        isSignificant: this.isSignificantQualityChange(qualityInfo),
      });
    }
  }

  handleBitrateChange(params: BitrateChangeParams): void {
    if (__DEV__) {
      this.logger.info('📊 handleBitrateChange', params);
    }

    const bitrateInfo = {
      bitrate: params.bitrate,
      timestamp: Date.now(),
    };

    this.bitrateChangeCount++;
    this.addToBitrateHistory(bitrateInfo);

    // Actualizar calidad actual si existe
    if (this.currentQuality) {
      this.currentQuality = {
        ...this.currentQuality,
        bitrate: params.bitrate,
        timestamp: Date.now(),
      };
    }

    // Verificar si es un cambio significativo de bitrate
    if (this.isSignificantBitrateChange(params)) {
      if (__DEV__) {
        this.logger.debug('Significant bitrate change detected', {
          newBitrate: params.bitrate,
          previousBitrate: params.previousBitrate,
          adaptive: params.adaptive,
        });
      }

      // Notificar a ComScore sobre cambios significativos actualizando metadatos
      this.updateBitrateMetadata(params);
    }
  }

  handleResolutionChange(params: ResolutionChangeParams): void {
    if (__DEV__) {
      this.logger.info('📐 handleResolutionChange', params);
    }

    // Actualizar calidad actual con nueva resolución
    if (this.currentQuality) {
      this.currentQuality = {
        ...this.currentQuality,
        width: params.width,
        height: params.height,
        timestamp: Date.now(),
      };
    } else {
      this.currentQuality = {
        quality: `${params.width}x${params.height}`,
        width: params.width,
        height: params.height,
        timestamp: Date.now(),
      };
    }

    if (__DEV__) {
      this.logger.debug('Resolution updated', {
        from:
          params.previousWidth && params.previousHeight
            ? `${params.previousWidth}x${params.previousHeight}`
            : 'unknown',
        to: `${params.width}x${params.height}`,
      });
    }
  }

  // Eventos de audio
  handleAudioTrackChange(params: AudioTrackChangeParams): void {
    if (__DEV__) {
      this.logger.info('🔊 handleAudioTrackChange', params);
    }

    const audioInfo: AudioInfo = {
      trackIndex: params.trackIndex,
      trackLabel: params.trackLabel,
      language: params.language,
      timestamp: Date.now(),
    };

    this.currentAudio = audioInfo;
    this.audioTrackChangeCount++;

    // ComScore puede necesitar saber sobre cambios de idioma
    if (
      params.language &&
      params.language !== this.getPreviousAudioLanguage()
    ) {
      this.updateAudioMetadata(audioInfo);
    }

    if (__DEV__) {
      this.logger.debug('Audio track changed', {
        trackIndex: params.trackIndex,
        language: params.language,
        label: params.trackLabel,
      });
    }
  }

  // Nuevo método para manejar cambios de velocidad de reproducción
  handlePlaybackRateChange(rate: number): void {
    if (__DEV__) {
      this.logger.info('⚡ handlePlaybackRateChange', rate);
    }

    // ComScore tiene un método específico para esto
    this.context.connector.notifyChangePlaybackRate(rate);

    if (__DEV__) {
      this.logger.debug('Playback rate change notified to ComScore', { rate });
    }
  }

  handleVolumeChange(params: VolumeChangeParams): void {
    if (__DEV__) {
      this.logger.debug('🔈 handleVolumeChange', params);
    }

    const previousVolume = this.currentVolume.volume;

    this.currentVolume = {
      volume: params.volume,
      muted: this.currentVolume.muted, // Mantener estado de mute
      timestamp: Date.now(),
    };

    // Solo log si es un cambio significativo
    if (this.isSignificantVolumeChange(previousVolume, params.volume)) {
      if (__DEV__) {
        this.logger.info('Significant volume change', {
          from: previousVolume,
          to: params.volume,
        });
      }
    }
  }

  handleMuteChange(params: MuteChangeParams): void {
    if (__DEV__) {
      this.logger.info('🔇 handleMuteChange', params);
    }

    this.currentVolume = {
      ...this.currentVolume,
      muted: params.muted,
      timestamp: Date.now(),
    };

    if (__DEV__) {
      this.logger.debug('Mute state changed', {
        muted: params.muted,
        volume: this.currentVolume.volume,
      });
    }
  }

  // Eventos de subtítulos
  handleSubtitleTrackChange(params: SubtitleTrackChangeParams): void {
    if (__DEV__) {
      this.logger.info('📝 handleSubtitleTrackChange', params);
    }

    const subtitleInfo: SubtitleInfo = {
      trackIndex: params.trackIndex,
      trackLabel: params.trackLabel,
      language: params.language,
      visible: true, // Asumir visible cuando se cambia
      timestamp: Date.now(),
    };

    this.currentSubtitle = subtitleInfo;
    this.subtitleChangeCount++;

    // ComScore puede necesitar saber sobre cambios de idioma de subtítulos
    if (
      params.language &&
      params.language !== this.getPreviousSubtitleLanguage()
    ) {
      this.updateSubtitleMetadata(subtitleInfo);
    }

    if (__DEV__) {
      this.logger.debug('Subtitle track changed', {
        trackIndex: params.trackIndex,
        language: params.language,
        label: params.trackLabel,
      });
    }
  }

  handleSubtitleShow(params: SubtitleShowParams): void {
    if (__DEV__) {
      this.logger.info('👁️ handleSubtitleShow', params);
    }

    if (this.currentSubtitle) {
      this.currentSubtitle = {
        ...this.currentSubtitle,
        visible: true,
        timestamp: Date.now(),
      };

      // Actualizar metadatos para reflejar que los subtítulos están visibles
      this.updateSubtitleVisibility(true);
    }
  }

  handleSubtitleHide(): void {
    if (__DEV__) {
      this.logger.info('🙈 handleSubtitleHide');
    }

    if (this.currentSubtitle) {
      this.currentSubtitle = {
        ...this.currentSubtitle,
        visible: false,
        timestamp: Date.now(),
      };

      // Actualizar metadatos para reflejar que los subtítulos están ocultos
      this.updateSubtitleVisibility(false);
    }
  }

  // Métodos privados de utilidad
  private addToQualityHistory(qualityInfo: QualityInfo): void {
    this.qualityHistory.push(qualityInfo);

    if (this.qualityHistory.length > this.maxHistorySize) {
      this.qualityHistory.shift();
    }
  }

  private addToBitrateHistory(bitrateInfo: {
    bitrate: number;
    timestamp: number;
  }): void {
    this.bitrateHistory.push(bitrateInfo);

    if (this.bitrateHistory.length > this.maxHistorySize) {
      this.bitrateHistory.shift();
    }
  }

  private isSignificantQualityChange(qualityInfo: QualityInfo): boolean {
    if (!this.qualityHistory.length) return true;

    const lastQuality = this.qualityHistory[this.qualityHistory.length - 1];

    // Cambio significativo si cambia la etiqueta de calidad o resolución
    return (
      qualityInfo.quality !== lastQuality?.quality ||
      qualityInfo.width !== lastQuality?.width ||
      qualityInfo.height !== lastQuality?.height
    );
  }

  private isSignificantBitrateChange(params: BitrateChangeParams): boolean {
    if (typeof params.previousBitrate !== 'number') return true;

    const change =
      Math.abs(params.bitrate - params.previousBitrate) /
      params.previousBitrate;
    return change >= this.SIGNIFICANT_BITRATE_CHANGE_THRESHOLD;
  }

  private isSignificantVolumeChange(
    previous: number,
    current: number
  ): boolean {
    const change = Math.abs(current - previous);
    return change >= this.SIGNIFICANT_VOLUME_CHANGE_THRESHOLD;
  }

  private getPreviousAudioLanguage(): string | undefined {
    // Buscar en historial o estado previo
    return this.currentAudio?.language;
  }

  private getPreviousSubtitleLanguage(): string | undefined {
    // Buscar en historial o estado previo
    return this.currentSubtitle?.language;
  }

  private updateQualityMetadata(qualityInfo: QualityInfo): void {
    // Actualizar metadatos de ComScore con información de calidad significativa
    const currentMetadata = this.stateManager.getCurrentContentMetadata();
    if (currentMetadata) {
      const updatedMetadata = {
        ...currentMetadata,
        // Agregar información de calidad a los metadatos
        customLabels: {
          ...currentMetadata.customLabels,
          currentQuality: qualityInfo.quality,
          ...(qualityInfo.bitrate && {
            currentBitrate: qualityInfo.bitrate.toString(),
          }),
          ...(qualityInfo.width &&
            qualityInfo.height && {
              currentResolution: `${qualityInfo.width}x${qualityInfo.height}`,
            }),
        },
      };

      // Usar el connector para actualizar metadatos
      this.context.connector.update(updatedMetadata);
      this.stateManager.setCurrentContentMetadata(updatedMetadata);

      if (__DEV__) {
        this.logger.debug('Quality metadata updated in ComScore', {
          quality: qualityInfo.quality,
          bitrate: qualityInfo.bitrate,
          resolution: updatedMetadata.customLabels?.currentResolution,
        });
      }
    }
  }

  private updateBitrateMetadata(params: BitrateChangeParams): void {
    // Actualizar metadatos con información de bitrate para ComScore
    const currentMetadata = this.stateManager.getCurrentContentMetadata();
    if (currentMetadata) {
      const updatedMetadata = {
        ...currentMetadata,
        customLabels: {
          ...currentMetadata.customLabels,
          currentBitrate: params.bitrate.toString(),
          ...(params.adaptive && {
            bitrateAdaptive: params.adaptive.toString(),
          }),
        },
      };

      this.context.connector.update(updatedMetadata);
      this.stateManager.setCurrentContentMetadata(updatedMetadata);

      if (__DEV__) {
        this.logger.debug('Bitrate metadata updated in ComScore', {
          bitrate: params.bitrate,
          adaptive: params.adaptive,
        });
      }
    }
  }

  private updateAudioMetadata(audioInfo: AudioInfo): void {
    // Actualizar metadatos con información de audio para ComScore
    const currentMetadata = this.stateManager.getCurrentContentMetadata();
    if (currentMetadata) {
      const updatedMetadata = {
        ...currentMetadata,
        customLabels: {
          ...currentMetadata.customLabels,
          ...(audioInfo.language && { audioLanguage: audioInfo.language }),
          ...(audioInfo.trackLabel && {
            audioTrackLabel: audioInfo.trackLabel,
          }),
        },
      };

      this.context.connector.update(updatedMetadata);
      this.stateManager.setCurrentContentMetadata(updatedMetadata);

      if (__DEV__) {
        this.logger.debug('Audio metadata updated in ComScore', {
          language: audioInfo.language,
          trackLabel: audioInfo.trackLabel,
        });
      }
    }
  }

  private updateSubtitleMetadata(subtitleInfo: SubtitleInfo): void {
    // Actualizar metadatos con información de subtítulos para ComScore
    const currentMetadata = this.stateManager.getCurrentContentMetadata();
    if (currentMetadata) {
      const updatedMetadata = {
        ...currentMetadata,
        customLabels: {
          ...currentMetadata.customLabels,
          ...(subtitleInfo.language && {
            subtitleLanguage: subtitleInfo.language,
          }),
          ...(subtitleInfo.trackLabel && {
            subtitleTrackLabel: subtitleInfo.trackLabel,
          }),
          subtitlesEnabled: subtitleInfo.visible.toString(),
        },
      };

      this.context.connector.update(updatedMetadata);
      this.stateManager.setCurrentContentMetadata(updatedMetadata);

      if (__DEV__) {
        this.logger.debug('Subtitle metadata updated in ComScore', {
          language: subtitleInfo.language,
          trackLabel: subtitleInfo.trackLabel,
          visible: subtitleInfo.visible,
        });
      }
    }
  }

  private updateSubtitleVisibility(visible: boolean): void {
    // Actualizar solo la visibilidad de subtítulos en ComScore
    const currentMetadata = this.stateManager.getCurrentContentMetadata();
    if (currentMetadata) {
      const updatedMetadata = {
        ...currentMetadata,
        customLabels: {
          ...currentMetadata.customLabels,
          subtitlesEnabled: visible.toString(),
        },
      };

      this.context.connector.update(updatedMetadata);
      this.stateManager.setCurrentContentMetadata(updatedMetadata);

      if (__DEV__) {
        this.logger.debug('Subtitle visibility updated in ComScore', {
          visible,
        });
      }
    }
  }

  // Métodos públicos de consulta
  getCurrentQuality(): QualityInfo | null {
    return this.currentQuality ? { ...this.currentQuality } : null;
  }

  getCurrentAudio(): AudioInfo | null {
    return this.currentAudio ? { ...this.currentAudio } : null;
  }

  getCurrentVolume(): VolumeInfo {
    return { ...this.currentVolume };
  }

  getCurrentSubtitle(): SubtitleInfo | null {
    return this.currentSubtitle ? { ...this.currentSubtitle } : null;
  }

  getQualityHistory(): QualityInfo[] {
    return [...this.qualityHistory];
  }

  getBitrateHistory(): { bitrate: number; timestamp: number }[] {
    return [...this.bitrateHistory];
  }

  // Estadísticas y métricas
  getQualityStatistics(): {
    currentQuality?: string;
    currentBitrate?: number;
    currentResolution?: string;
    qualityChanges: number;
    bitrateChanges: number;
    audioTrackChanges: number;
    subtitleChanges: number;
    averageBitrate?: number;
    currentVolume: number;
    isMuted: boolean;
    hasSubtitles: boolean;
    subtitleLanguage?: string;
    audioLanguage?: string;
  } {
    const averageBitrate =
      this.bitrateHistory.length > 0
        ? this.bitrateHistory.reduce((sum, item) => sum + item.bitrate, 0) /
          this.bitrateHistory.length
        : undefined;

    const currentResolution =
      this.currentQuality?.width && this.currentQuality?.height
        ? `${this.currentQuality.width}x${this.currentQuality.height}`
        : undefined;

    return {
      currentQuality: this.currentQuality?.quality,
      currentBitrate: this.currentQuality?.bitrate,
      currentResolution,
      qualityChanges: this.qualityChangeCount,
      bitrateChanges: this.bitrateChangeCount,
      audioTrackChanges: this.audioTrackChangeCount,
      subtitleChanges: this.subtitleChangeCount,
      averageBitrate,
      currentVolume: this.currentVolume.volume,
      isMuted: this.currentVolume.muted,
      hasSubtitles: this.currentSubtitle !== null,
      subtitleLanguage: this.currentSubtitle?.language,
      audioLanguage: this.currentAudio?.language,
    };
  }

  // Método para resetear estadísticas
  resetStatistics(): void {
    this.qualityChangeCount = 0;
    this.bitrateChangeCount = 0;
    this.audioTrackChangeCount = 0;
    this.subtitleChangeCount = 0;
    this.qualityHistory = [];
    this.bitrateHistory = [];

    if (__DEV__) {
      this.logger.debug('Quality statistics reset');
    }
  }

  // Método para obtener la calidad promedio en un período
  getAverageQualityInPeriod(minutes: number): {
    averageBitrate?: number;
    mostCommonQuality?: string;
    qualityChanges: number;
  } {
    const periodStart = Date.now() - minutes * 60 * 1000;

    const recentQualities = this.qualityHistory.filter(
      (q) => q.timestamp >= periodStart
    );
    const recentBitrates = this.bitrateHistory.filter(
      (b) => b.timestamp >= periodStart
    );

    const averageBitrate =
      recentBitrates.length > 0
        ? recentBitrates.reduce((sum, item) => sum + item.bitrate, 0) /
          recentBitrates.length
        : undefined;

    // Encontrar la calidad más común
    const qualityCounts = recentQualities.reduce(
      (counts, quality) => {
        counts[quality.quality] = (counts[quality.quality] || 0) + 1;
        return counts;
      },
      {} as Record<string, number>
    );

    const mostCommonQuality = Object.entries(qualityCounts).sort(
      ([, a], [, b]) => b - a
    )[0]?.[0];

    return {
      averageBitrate,
      mostCommonQuality,
      qualityChanges: recentQualities.length,
    };
  }

  // Método público para manejar cambios de velocidad de reproducción
  // (Este método debe ser llamado desde el plugin principal)
  handlePlaybackRateChangeFromPlugin(rate: number): void {
    this.handlePlaybackRateChange(rate);
  }
}
