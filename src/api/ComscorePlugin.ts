/*
 *  ComScore Streaming Tag
 *  Player Plugin
 *
 */

import {
  type ComscoreConfiguration,
  type ComscoreMetadata,
  type ComscorePluginInterface,
  ComscoreState,
} from './types';

import { ComscoreConnector } from './ComscoreConnector';

const TAG = '[ComscorePlugin]';

/*
 *  Events List
 *
 *    handleSourceChange
 *    handleMetadataLoaded
 *    handleDurationChange
 *    handleBuffering
 *
 *    handlePlay
 *    handlePause
 *    handleSeeking
 *    handleSeeked
 *    handleRateChange
 *    handleEnded
 *
 *    handleAdBegin
 *    handleAdBreakBegin
 *    handleContentResume -> Volvemos de un anuncio
 *
 *    handleError
 *    handleContentProtectionError -> Por hacer
 *
 */

export class ComscorePlugin implements ComscorePluginInterface {
  // Propiedades requeridas por PlayerPlugin
  public name = 'ComscorePlugin';
  public version = '0.1.5'; // Incrementado por la mejora

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
   * Common ComScore methods
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

  /**
   * Expone el instanceId generado automáticamente
   *
   */

  getInstanceId(): number {
    return this.connectorConnector?.getInstanceId() ?? -1;
  }

  /*
   * Metadata methods
   *
   */

  setMedatata(metadata: ComscoreMetadata): void {
    if (__DEV__) {
      console.log(`${TAG} setMedatata`, metadata);
    }
    this.comscoreMetaData = metadata;
    this.currentContentMetadata = null;
  }

  setAdMetadata(): void {
    // TODO: Ads
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
   * State methods
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
   * Metadata & Source events
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
    // TODO: Implementar detección de Live Stream y configuración de DVR window
    // if (comscoreMetaData.length == 0L && !inAd) {
    //   // Detectar stream type LIVE
    //   // Configurar DVR window length si está disponible
    //   this.connectorConnector?.setDvrWindowLength(dvrWindowLengthInSeconds);
    // }
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
   * Playback events
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
      // ✅ Implementar lógica de seek mejorada
      if (typeof duration === 'number' && duration > 0) {
        // VOD content - usar startFromPosition
        const newPosition = currentTime * 1000; // Convertir a milisegundos
        if (__DEV__) {
          console.log(`${TAG} startFromPosition: ${newPosition}ms`);
        }
        this.connectorConnector?.startFromPosition(newPosition);
      } else {
        // Live content - usar DVR window offset
        // TODO: Implementar lógica para calcular offset desde el final del stream
        if (__DEV__) {
          console.log(`${TAG} Live content seek - implementar DVR offset`);
        }
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
   * Ad events
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
   * Errors
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
   * Implementación de PlayerPlugin interface
   *
   */

  onStart(): void {
    if (__DEV__) {
      console.log(`${TAG} 🎯 onStart`);
    }
    this.handleSourceChange();
    this.handleMetadataLoaded();
  }

  onPlay(): void {
    if (__DEV__) {
      console.log(`${TAG} 🎯 onPlay`);
    }
    this.handlePlay();
  }

  onPause(): void {
    if (__DEV__) {
      console.log(`${TAG} 🎯 onPause`);
    }
    this.handlePause();
  }

  onBuffering(value: boolean): void {
    if (__DEV__) {
      console.log(`${TAG} 🎯 onBuffering ${value}`);
    }
    this.handleBuffering(value);
  }

  onSeek(value: number): void {
    if (__DEV__) {
      console.log(`${TAG} 🎯 onSeek ${value}`);
    }
    this.handleSeeking();
    this.handleSeeked(value);
  }

  onProgress(_value: number, _duration?: number): void {
    // Implementación opcional para tracking de progreso
  }

  onEnd(): void {
    if (__DEV__) {
      console.log(`${TAG} 🎯 onEnd`);
    }
    this.handleEnded();
  }

  destroy(): void {
    if (__DEV__) {
      console.log(`${TAG} destroy - Instance ID: ${this.getInstanceId()}`);
    }
    this.connectorConnector?.destroy();
    this.connectorConnector = null;
  }
}
