/*
 *  ComScore Streaming Tag
 *  Player Plugin
 *
 */

import {
  type ComscoreConfiguration,
  type ComscoreMetadata,
  type ComscorePluginInterface,
  type ComscoreMetadataParams,
  type ComscoreAdMetadataParams,
  type MetadataParams,
  type ComscoreAdvertisementMetadata,
  type DurationChangeParams,
  type StopParams,
  type SeekEndParams,
  type PositionChangeParams,
  type PositionUpdateParams,
  type ProgressParams,
  type PlaybackRateChangeParams,
  type AdBeginParams,
  type AdEndParams,
  type AdPauseParams,
  type AdResumeParams,
  type AdSkipParams,
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
  ComscoreState,
} from './types';

import { ComscoreConnector } from './ComscoreConnector';

const TAG = '[ComscorePlugin]';

export class ComscorePlugin implements ComscorePluginInterface {
  // Propiedades requeridas por PlayerPlugin
  public name = 'ComscorePlugin';
  public version = '0.1.5';

  private connectorConnector: ComscoreConnector | null;
  private comscoreMetaData: ComscoreMetadata | null;
  private currentContentMetadata: ComscoreMetadata | null;
  private comScoreState: ComscoreState;

  private buffering: boolean;
  private ended: boolean;

  // TODO: Ads
  // private currentAdDuration: number;
  private currentAdOffset: number;
  private inAd: boolean;
  // private currentAdBreak: unknown;

  constructor(
    ComscoreMetadata: ComscoreMetadata,
    ComscoreConfig: ComscoreConfiguration
  ) {
    if (__DEV__) {
      console.log(`${TAG} constructor - Creating new ComScore connector`);
    }

    this.connectorConnector = new ComscoreConnector(
      ComscoreConfig,
      ComscoreMetadata
    );

    if (__DEV__) {
      console.log(
        `${TAG} constructor - Instance ID: ${this.connectorConnector.getInstanceId()}`
      );
    }

    this.comscoreMetaData = ComscoreMetadata;
    this.currentContentMetadata = ComscoreMetadata;
    this.comScoreState = ComscoreState.INITIALIZED;
    // this.currentAdDuration = 0.0;
    this.currentAdOffset = 0.0;
    this.buffering = false;
    this.ended = false;
    this.inAd = false;
    // this.currentAdBreak = null;
  }

  /*
   *  Common ComScore methods
   *
   */

  update(metadata: ComscoreMetadata): void {
    if (__DEV__) {
      console.log(`${TAG} update`, metadata);
    }
    this.connectorConnector?.update(metadata);
  }

  setPersistentLabel(label: string, value: string): void {
    if (__DEV__) {
      console.log(`${TAG} setPersistentLabel`, label, value);
    }
    this.connectorConnector?.setPersistentLabel(label, value);
  }

  setPersistentLabels(labels: { [key: string]: string }): void {
    if (__DEV__) {
      console.log(`${TAG} setPersistentLabels`, labels);
    }
    this.connectorConnector?.setPersistentLabels(labels);
  }

  /*
   *  Expone el instanceId generado automáticamente
   *
   */

  getInstanceId(): number {
    return this.connectorConnector?.getInstanceId() ?? -1;
  }

  /*
   *  Metadata methods
   *
   */

  setMedatata(metadata: ComscoreMetadata): void {
    if (__DEV__) {
      console.log(`${TAG} setMedatata`, metadata);
    }
    this.comscoreMetaData = metadata;
    this.currentContentMetadata = null;
  }

  setAdMetadata(adMetadata: ComscoreAdvertisementMetadata): void {
    if (__DEV__) {
      console.log(`${TAG} setAdMetadata`, adMetadata);
    }
  }

  setContentMetadata(): void {
    if (__DEV__) {
      console.log(
        `${TAG} setContentMetadata (duration ${this.comscoreMetaData?.length})`
      );
    }

    if (this.currentContentMetadata) {
      this.connectorConnector?.setMetadata(this.currentContentMetadata);
    }
  }

  /*
   *  State methods
   *
   */

  transitionToStopped(): void {
    if (this.comScoreState !== ComscoreState.STOPPED) {
      if (__DEV__) {
        console.log(`${TAG} transitionToStopped from ${this.comScoreState}`);
      }
      this.comScoreState = ComscoreState.STOPPED;
      this.connectorConnector?.notifyEnd();
    }
  }

  transitionToPaused(): void {
    if (this.comScoreState === ComscoreState.VIDEO) {
      if (__DEV__) {
        console.log(
          `${TAG} transition to Paused Video from ${this.comScoreState}`
        );
      }
      this.comScoreState = ComscoreState.PAUSED_VIDEO;
      this.connectorConnector?.notifyPause();
    } else if (this.comScoreState === ComscoreState.ADVERTISEMENT) {
      if (__DEV__) {
        console.log(
          `${TAG} transition to Paused Ad from ${this.comScoreState}`
        );
      }
      this.comScoreState = ComscoreState.PAUSED_AD;
      this.connectorConnector?.notifyPause();
    }
  }

  transitionToAdvertisement(): void {
    if (
      this.comScoreState === ComscoreState.PAUSED_AD ||
      this.comScoreState === ComscoreState.INITIALIZED ||
      this.comScoreState === ComscoreState.VIDEO ||
      this.comScoreState === ComscoreState.PAUSED_VIDEO ||
      this.comScoreState === ComscoreState.STOPPED
    ) {
      if (__DEV__) {
        console.log(
          `${TAG} transition to Advertisement from ${this.comScoreState}`
        );
      }
      this.comScoreState = ComscoreState.ADVERTISEMENT;
      this.connectorConnector?.notifyPlay();
    }
  }

  transitionToVideo(): void {
    if (
      this.comScoreState === ComscoreState.PAUSED_VIDEO ||
      this.comScoreState === ComscoreState.ADVERTISEMENT ||
      this.comScoreState === ComscoreState.PAUSED_AD ||
      this.comScoreState === ComscoreState.STOPPED ||
      this.comScoreState === ComscoreState.INITIALIZED
    ) {
      if (__DEV__) {
        console.log(`${TAG} transition to Video from ${this.comScoreState}`);
      }
      this.comScoreState = ComscoreState.VIDEO;
      this.connectorConnector?.notifyPlay();
    }
  }

  /*
   *  Metadata & Source events
   *
   */

  handleSourceChange(): void {
    if (__DEV__) {
      console.log(`${TAG} 🔄 handleSourceChange`);
    }
    this.comScoreState = ComscoreState.INITIALIZED;
    this.currentContentMetadata = null;
    this.connectorConnector?.createPlaybackSession();
  }

  handleMetadataLoaded(): void {
    if (__DEV__) {
      console.log(`${TAG} 🔄 handleMetadataLoaded`);
    }

    // Detectar contenido LIVE y configurar DVR window si aplica
    if (this.comscoreMetaData?.length === 0 && !this.inAd) {
      if (__DEV__) {
        console.log(`${TAG} 🔄 handleMetadataLoaded - Detected LIVE stream`);
      }

      // Para contenido LIVE, establecer metadata si no se ha hecho aún
      this.setContentMetadata();

      // TODO: Implementar detección de DVR window desde el player
      // Si el reproductor proporciona información de seekable ranges:
      // const dvrWindowLengthInSeconds = player.seekable.end - player.seekable.start;
      // if (dvrWindowLengthInSeconds > 0) {
      //   this.connectorConnector?.setDvrWindowLength(dvrWindowLengthInSeconds * 1000);
      // }
    } else {
      // Contenido VOD - establecer metadata
      if (__DEV__) {
        console.log(`${TAG} 🔄 handleMetadataLoaded - Detected VOD content`);
      }
      this.setContentMetadata();
    }
  }

  handleDurationChange(duration?: number): void {
    if (__DEV__) {
      console.log(`${TAG} 🔄 handleDurationChange`, duration);
    }
    // TODO: Verificar si durationchange da la duración del contenido cuando hay preroll
    if (duration && this.comscoreMetaData) {
      // Actualizar metadatos con nueva duración
      const updatedMetadata = {
        ...this.comscoreMetaData,
        length: duration * 1000, // Convertir a milisegundos
      };
      this.update(updatedMetadata);
    }
  }

  handleBuffering(isBuffering: boolean): void {
    if (__DEV__) {
      console.log(`${TAG} 🔄 handleBuffering ${isBuffering}`);
    }
    if (isBuffering !== this.buffering) {
      if (isBuffering) {
        if (
          (this.comScoreState === ComscoreState.ADVERTISEMENT && this.inAd) ||
          (this.comScoreState === ComscoreState.VIDEO && !this.inAd)
        ) {
          this.buffering = true;
          this.connectorConnector?.notifyBufferStart();
        }
      } else {
        this.buffering = false;
        this.connectorConnector?.notifyBufferStop();
      }
    }
  }

  /*
   *  Playback events
   *
   */

  handlePlay(): void {
    if (__DEV__) {
      console.log(`${TAG} 🔄 handlePlay`);
    }

    if (this.ended) {
      // Create new session when replaying an asset
      this.ended = false;

      if (__DEV__) {
        console.log(
          `${TAG} 🔄 handlePlay - PLAY event to start after an end event, create new session`
        );
      }

      this.connectorConnector?.createPlaybackSession();
      this.currentAdOffset = 0.0; // Set to default value
      this.setContentMetadata();
    }

    if (this.comScoreState === ComscoreState.VIDEO) {
      this.connectorConnector?.notifyPlay();
    }

    if (this.comScoreState === ComscoreState.ADVERTISEMENT) {
      this.transitionToAdvertisement();
    } else if (this.currentAdOffset < 0.0) {
      if (__DEV__) {
        console.log(
          `${TAG} 🔄 handlePlay - IGNORING PLAYING event after post-roll`
        );
      }
      return; // last played ad was a post-roll so there's no real content coming, return and report nothing
    } else {
      this.transitionToVideo(); // will set content metadata and notify play if not done already
    }
  }

  handlePause(): void {
    if (__DEV__) {
      console.log(`${TAG} 🔄 handlePause`);
    }
    this.transitionToPaused();
  }

  handleSeeking(): void {
    if (__DEV__) {
      console.log(`${TAG} 🔄 handleSeeking`);
    }
    this.connectorConnector?.notifySeekStart();
  }

  handleSeeked(currentTime?: number, duration?: number): void {
    if (__DEV__) {
      console.log(`${TAG} 🔄 handleSeeked`, { currentTime, duration });
    }

    if (typeof currentTime === 'number') {
      if (typeof duration === 'number' && duration > 0) {
        // VOD content - usar startFromPosition
        const newPosition = currentTime * 1000; // Convertir a milisegundos
        if (__DEV__) {
          console.log(
            `${TAG} 🔄 handleSeeked - VOD: startFromPosition ${newPosition}ms`
          );
        }
        this.connectorConnector?.startFromPosition(newPosition);
      } else if (duration === 0 || isNaN(duration || 0)) {
        // Live content - usar DVR window offset
        // TODO: Implementar lógica para calcular offset desde el final del stream
        // Para contenido LIVE necesitamos calcular el offset desde el final del stream
        // const dvrWindowOffset = (seekableEnd - currentTime) * 1000;
        if (__DEV__) {
          console.log(
            `${TAG} 🔄 handleSeeked - LIVE: Need DVR offset calculation`
          );
          console.log(
            `${TAG} 🔄 handleSeeked - Using position as fallback: ${currentTime * 1000}ms`
          );
        }
        // Fallback: usar startFromPosition hasta implementar DVR offset
        this.connectorConnector?.startFromPosition(currentTime * 1000);
        // this.connectorConnector?.startFromDvrWindowOffset(dvrOffset);
      }
    }
  }

  handleRateChange(rate: number): void {
    if (__DEV__) {
      console.log(`${TAG} 🔄 handleRateChange`, rate);
    }
    this.connectorConnector?.notifyChangePlaybackRate(rate);
  }

  handleEnded(): void {
    if (__DEV__) {
      console.log(`${TAG} 🔄 handleEnded`);
    }
    this.transitionToStopped();
    this.ended = true;
  }

  /*
   *  Ad events
   *
   */

  handleAdBegin(): void {
    if (__DEV__) {
      console.log(`${TAG} 🔄 handleAdBegin`);
    }
    // TODO: Implementar metadata de anuncios
    // if (currentAdBreak == null && ad?.imaAd != null) {
    //   handleAdBreakBegin(ad.adBreak)
    // }
    // currentAdDuration = (ad?.imaAd?.duration ?: 0.0) * 1000
    // setAdMetadata(currentAdDuration, currentAdOffset, ad?.id ?: "");
  }

  handleAdBreakBegin(adOffset?: number): void {
    if (__DEV__) {
      console.log(`${TAG} 🔄 handleAdBreakBegin`, { adOffset });
    }

    if (typeof adOffset === 'number') {
      this.currentAdOffset = adOffset;
    }

    this.inAd = true;
    this.transitionToAdvertisement();
  }

  handleContentResume(): void {
    if (__DEV__) {
      console.log(`${TAG} 🔄 handleContentResume`);
    }
    this.inAd = false;
    this.transitionToVideo();
  }

  /*
   *  Errors
   *
   */

  handleError(error?: any): void {
    if (__DEV__) {
      console.log(`${TAG} 🔄 handleError`, error);
    }
    this.transitionToStopped();
  }

  handleContentProtectionError(error?: any): void {
    if (__DEV__) {
      console.log(`${TAG} 🔄 handleContentProtectionError`, error);
    }
    this.transitionToStopped();
  }

  /*
   *  Implementación de PlayerPlugin interface (eventos principales)
   *
   */

  onSourceChange?(): void {
    if (__DEV__) {
      console.log(`${TAG} 🎯 onSourceChange`);
    }
    this.handleSourceChange();
  }

  onCreatePlaybackSession?(): void {
    if (__DEV__) {
      console.log(`${TAG} 🎯 onCreatePlaybackSession`);
    }
    this.connectorConnector?.createPlaybackSession();
  }

  onMetadataLoaded?(params: MetadataParams): void {
    if (__DEV__) {
      console.log(`${TAG} 🎯 onMetadataLoaded`, params);
    }
    this.handleMetadataLoaded();
  }

  onMetadataUpdate?(params: MetadataParams): void {
    if (__DEV__) {
      console.log(`${TAG} 🎯 onMetadataUpdate`, params);
    }
    // Actualizar metadatos si están disponibles
    if (params.metadata) {
      this.update(params.metadata);
    }
  }

  onDurationChange?(params: DurationChangeParams): void {
    if (__DEV__) {
      console.log(`${TAG} 🎯 onDurationChange`, params);
    }
    this.handleDurationChange(params.duration / 1000); // Convertir de ms a segundos
  }

  onPlay?(): void {
    if (__DEV__) {
      console.log(`${TAG} 🎯 onPlay`);
    }
    this.handlePlay();
  }

  onPause?(): void {
    if (__DEV__) {
      console.log(`${TAG} 🎯 onPause`);
    }
    this.handlePause();
  }

  onEnd?(): void {
    if (__DEV__) {
      console.log(`${TAG} 🎯 onEnd`);
    }
    this.handleEnded();
  }

  onStop?(params: StopParams): void {
    if (__DEV__) {
      console.log(`${TAG} 🎯 onStop`, params);
    }
    this.transitionToStopped();
  }

  onBufferStart?(): void {
    if (__DEV__) {
      console.log(`${TAG} 🎯 onBufferStart`);
    }
    this.handleBuffering(true);
  }

  onBufferStop?(): void {
    if (__DEV__) {
      console.log(`${TAG} 🎯 onBufferStop`);
    }
    this.handleBuffering(false);
  }

  onSeekStart?(): void {
    if (__DEV__) {
      console.log(`${TAG} 🎯 onSeekStart`);
    }
    this.handleSeeking();
  }

  onSeekEnd?(params: SeekEndParams): void {
    if (__DEV__) {
      console.log(`${TAG} 🎯 onSeekEnd`, params);
    }
    this.handleSeeked(
      params.position / 1000,
      params.duration ? params.duration / 1000 : undefined
    );
  }

  onPositionChange?(params: PositionChangeParams): void {
    if (__DEV__) {
      console.log(`${TAG} 🎯 onPositionChange`, params);
    }
    // Evento de cambio de posición - no necesita implementación específica por ahora
    // ComScore maneja esto internamente
  }

  onPositionUpdate?(params: PositionUpdateParams): void {
    if (__DEV__) {
      console.log(`${TAG} 🎯 onPositionUpdate`, params);
    }
    // Evento de actualización de posición - no necesita implementación específica por ahora
    // ComScore maneja esto internamente
  }

  onProgress?(params: ProgressParams): void {
    // Tracking opcional de progreso - ComScore no requiere notificaciones constantes de progreso
    // pero puede ser útil para validación y debugging
    if (__DEV__ && params.position % 10000 === 0) {
      // Log cada 10 segundos para evitar spam
      console.log(
        `${TAG} 🎯 onProgress - Position: ${params.position / 1000}s, Duration: ${params.duration ? params.duration / 1000 : 'unknown'}s`
      );
    }

    // Verificar si hemos pasado de pre-roll a contenido principal
    if (
      this.inAd &&
      this.currentAdOffset >= 0 &&
      params.position > this.currentAdOffset
    ) {
      if (__DEV__) {
        console.log(
          `${TAG} 🎯 onProgress - Potentially transitioning from pre-roll to content`
        );
      }
    }

    // Actualizar metadata de duración si es necesario y ha cambiado
    if (
      params.duration &&
      params.duration > 0 &&
      this.comscoreMetaData?.length !== params.duration
    ) {
      if (__DEV__) {
        console.log(
          `${TAG} 🎯 onProgress - Duration changed, updating metadata`
        );
      }
      this.handleDurationChange(params.duration / 1000);
    }
  }

  onPlaybackRateChange?(params: PlaybackRateChangeParams): void {
    if (__DEV__) {
      console.log(`${TAG} 🎯 onPlaybackRateChange`, params);
    }
    this.handleRateChange(params.rate);
  }

  /*
   *  Implementación de eventos de publicidad
   *
   */

  onAdBegin?(params: AdBeginParams): void {
    if (__DEV__) {
      console.log(`${TAG} 🎯 onAdBegin`, params);
    }
    this.handleAdBegin();
  }

  onAdEnd?(params: AdEndParams): void {
    if (__DEV__) {
      console.log(`${TAG} 🎯 onAdEnd`, params);
    }
    // TODO: Implementar lógica de final de anuncio
  }

  onAdPause?(params: AdPauseParams): void {
    if (__DEV__) {
      console.log(`${TAG} 🎯 onAdPause`, params);
    }
    this.transitionToPaused();
  }

  onAdResume?(params: AdResumeParams): void {
    if (__DEV__) {
      console.log(`${TAG} 🎯 onAdResume`, params);
    }
    this.transitionToAdvertisement();
  }

  onAdSkip?(params: AdSkipParams): void {
    if (__DEV__) {
      console.log(`${TAG} 🎯 onAdSkip`, params);
    }
    // TODO: Implementar lógica de skip de anuncio
  }

  onAdBreakBegin?(params: AdBreakBeginParams): void {
    if (__DEV__) {
      console.log(`${TAG} 🎯 onAdBreakBegin`, params);
    }
    this.handleAdBreakBegin(params.adBreakPosition);
  }

  onAdBreakEnd?(params: AdBreakEndParams): void {
    if (__DEV__) {
      console.log(`${TAG} 🎯 onAdBreakEnd`, params);
    }
    this.handleContentResume();
  }

  onContentResume?(): void {
    if (__DEV__) {
      console.log(`${TAG} 🎯 onContentResume`);
    }
    this.handleContentResume();
  }

  /*
   *  Implementación de eventos de errores
   *
   */

  onError?(params: ErrorParams): void {
    if (__DEV__) {
      console.log(`${TAG} 🎯 onError`, params);
    }
    this.handleError(params);
  }

  onContentProtectionError?(params: ContentProtectionErrorParams): void {
    if (__DEV__) {
      console.log(`${TAG} 🎯 onContentProtectionError`, params);
    }
    this.handleContentProtectionError(params);
  }

  onNetworkError?(params: NetworkErrorParams): void {
    if (__DEV__) {
      console.log(`${TAG} 🎯 onNetworkError`, params);
    }
    this.handleError(params);
  }

  onStreamError?(params: StreamErrorParams): void {
    if (__DEV__) {
      console.log(`${TAG} 🎯 onStreamError`, params);
    }
    this.handleError(params);
  }

  /*
   *  Implementación de eventos de audio y subtítulos
   *
   */

  onAudioTrackChange?(params: AudioTrackChangeParams): void {
    if (__DEV__) {
      console.log(`${TAG} 🎯 onAudioTrackChange`, params);
    }
    // TODO: Implementar lógica de cambio de pista de audio si es necesario para ComScore
  }

  onVolumeChange?(params: VolumeChangeParams): void {
    if (__DEV__) {
      console.log(`${TAG} 🎯 onVolumeChange`, params);
    }
    // TODO: Implementar lógica de cambio de volumen si es necesario para ComScore
  }

  onMuteChange?(params: MuteChangeParams): void {
    if (__DEV__) {
      console.log(`${TAG} 🎯 onMuteChange`, params);
    }
    // TODO: Implementar lógica de cambio de mute si es necesario para ComScore
  }

  onSubtitleTrackChange?(params: SubtitleTrackChangeParams): void {
    if (__DEV__) {
      console.log(`${TAG} 🎯 onSubtitleTrackChange`, params);
    }
    // TODO: Implementar lógica de cambio de subtítulos si es necesario para ComScore
  }

  onSubtitleShow?(params: SubtitleShowParams): void {
    if (__DEV__) {
      console.log(`${TAG} 🎯 onSubtitleShow`, params);
    }
    // TODO: Implementar lógica de mostrar subtítulos si es necesario para ComScore
  }

  onSubtitleHide?(): void {
    if (__DEV__) {
      console.log(`${TAG} 🎯 onSubtitleHide`);
    }
    // TODO: Implementar lógica de ocultar subtítulos si es necesario para ComScore
  }

  /*
   *  Implementación de eventos de calidad
   *
   */

  onQualityChange?(params: QualityChangeParams): void {
    if (__DEV__) {
      console.log(`${TAG} 🎯 onQualityChange`, params);
    }
    // TODO: Implementar lógica de cambio de calidad si es necesario para ComScore
  }

  onBitrateChange?(params: BitrateChangeParams): void {
    if (__DEV__) {
      console.log(`${TAG} 🎯 onBitrateChange`, params);
    }
    // TODO: Implementar lógica de cambio de bitrate si es necesario para ComScore
  }

  onResolutionChange?(params: ResolutionChangeParams): void {
    if (__DEV__) {
      console.log(`${TAG} 🎯 onResolutionChange`, params);
    }
    // TODO: Implementar lógica de cambio de resolución si es necesario para ComScore
  }

  /*
   *  Eventos específicos de ComScore
   *
   */

  onSetContentMetadata?(params: ComscoreMetadataParams): void {
    if (__DEV__) {
      console.log(`${TAG} 🎯 onSetContentMetadata`, params);
    }
    this.update(params.metadata);
  }

  onSetAdvertisementMetadata?(params: ComscoreAdMetadataParams): void {
    if (__DEV__) {
      console.log(`${TAG} 🎯 onSetAdvertisementMetadata`, params);
    }
    // TODO: Implementar lógica de metadatos de anuncio
  }

  /*
   *  Eventos específicos de DVR (solo para ComScore)
   *
   */

  onStartFromPosition?(params: { position: number }): void {
    if (__DEV__) {
      console.log(`${TAG} 🎯 onStartFromPosition`, params);
    }
    this.connectorConnector?.startFromPosition(params.position);
  }

  onStartFromDvrWindowOffset?(params: { offset: number }): void {
    if (__DEV__) {
      console.log(`${TAG} 🎯 onStartFromDvrWindowOffset`, params);
    }
    this.connectorConnector?.startFromDvrWindowOffset(params.offset);
  }

  onSetDvrWindowLength?(params: { length: number }): void {
    if (__DEV__) {
      console.log(`${TAG} 🎯 onSetDvrWindowLength`, params);
    }
    this.connectorConnector?.setDvrWindowLength(params.length);
  }

  onDvrWindowOffsetChange?(params: {
    offset: number;
    previousOffset?: number;
  }): void {
    if (__DEV__) {
      console.log(`${TAG} 🎯 onDvrWindowOffsetChange`, params);
    }
    // TODO: Implementar lógica de cambio de offset de DVR si es necesario
  }

  /*
   *  Eventos específicos de etiquetas persistentes (solo para ComScore)
   *
   */

  onSetPersistentLabel?(params: { label: string; value: string }): void {
    if (__DEV__) {
      console.log(`${TAG} 🎯 onSetPersistentLabel`, params);
    }
    this.setPersistentLabel(params.label, params.value);
  }

  onSetPersistentLabels?(params: { labels: { [key: string]: string } }): void {
    if (__DEV__) {
      console.log(`${TAG} 🎯 onSetPersistentLabels`, params);
    }
    this.setPersistentLabels(params.labels);
  }

  onUpdateConfiguration?(params: {
    config: Partial<ComscoreConfiguration>;
  }): void {
    if (__DEV__) {
      console.log(`${TAG} 🎯 onUpdateConfiguration`, params);
    }
    // TODO: Implementar lógica de actualización de configuración
  }

  /*
   *  Eventos específicos de estado de aplicación (solo para ComScore)
   *
   */

  onApplicationForeground?(): void {
    if (__DEV__) {
      console.log(`${TAG} 🎯 onApplicationForeground`);
    }
    // TODO: Implementar lógica de foreground si es necesario
  }

  onApplicationBackground?(): void {
    if (__DEV__) {
      console.log(`${TAG} 🎯 onApplicationBackground`);
    }
    // TODO: Implementar lógica de background si es necesario
  }

  onApplicationActive?(): void {
    if (__DEV__) {
      console.log(`${TAG} 🎯 onApplicationActive`);
    }
    // TODO: Implementar lógica de aplicación activa si es necesario
  }

  onApplicationInactive?(): void {
    if (__DEV__) {
      console.log(`${TAG} 🎯 onApplicationInactive`);
    }
    // TODO: Implementar lógica de aplicación inactiva si es necesario
  }

  /*
   *  Limpieza
   *
   */

  destroy(): void {
    if (__DEV__) {
      console.log(`${TAG} destroy - Instance ID: ${this.getInstanceId()}`);
    }
    this.connectorConnector?.destroy();
    this.connectorConnector = null;
  }
}
