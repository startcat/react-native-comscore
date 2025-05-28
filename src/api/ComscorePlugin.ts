/*
 *  ComScore Streaming Tag
 *  Player Plugin
 *
 */

import type { ComscoreConfiguration } from './types/ComscoreConfiguration';
import type { ComscoreMetadata } from './types/ComscoreMetadata';

import { ComscoreConnector } from './ComscoreConnector';

const TAG = '[ComscorePlugin]';

interface PlayerPlugin {
  name: string;
  version: string;
  onStart: () => void;
  onPlay: () => void;
  onPause: () => void;
  onBuffering?: (value: boolean) => void;
  onSeek?: (value: number) => void;
  onProgress?: (value: number, duration?: number) => void;
  onChangeAudioIndex?: (index: number, label?: string) => void;
  onChangeSubtitleIndex?: (index: number, label?: string) => void;
  onNext?: () => void;
  onPrevious?: () => void;
  onEnd: () => void;
  destroy(): void;
}

export interface ComscorePluginInterface extends PlayerPlugin {
  update(metadata: ComscoreMetadata): void;
  setPersistentLabel(label: string, value: string): void;
  setPersistentLabels(labels: { [key: string]: string }): void;
}

export enum ComscoreState {
  INITIALIZED = 'initialized',
  STOPPED = 'stopped',
  PAUSED_AD = 'paused_ad',
  PAUSED_VIDEO = 'paused_video',
  ADVERTISEMENT = 'advertisement',
  VIDEO = 'video',
}

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
  public version = '0.1.4';

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
    const instanceId = Math.floor(Math.random() * 10000);
    console.log(`${TAG} constructor`, instanceId);
    this.connectorConnector = new ComscoreConnector(
      instanceId,
      ComscoreMetadata,
      ComscoreConfig
    );

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
    this.connectorConnector?.update(metadata);
  }

  setPersistentLabel(label: string, value: string): void {
    this.connectorConnector?.setPersistentLabel(label, value);
  }

  setPersistentLabels(labels: { [key: string]: string }): void {
    this.connectorConnector?.setPersistentLabels(labels);
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
        `${TAG} setMedatata (duration ${this.comscoreMetaData?.length})`
      );
    }

    this.connectorConnector?.setMetadata(this.currentContentMetadata!);
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
        console.log(`
          ${TAG} transition to Paused Video from ${this.comScoreState}`);
      }
      this.comScoreState = ComscoreState.PAUSED_VIDEO;
      this.connectorConnector?.notifyPause();
    } else if (this.comScoreState === ComscoreState.ADVERTISEMENT) {
      if (__DEV__) {
        console.log(`
          ${TAG} transition to Paused Ad from ${this.comScoreState}`);
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
        console.log(`
        ${TAG} transition to Advertisement from ${this.comScoreState}
      `);
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
    // if (comscoreMetaData.length == 0L && !inAd) {
    //   if (BuildConfig.DEBUG) {
    //     Log.i(TAG, "DEBUG: detected stream type LIVE")
    //   }
    //   try {
    //     val seekableRanges = player.seekable
    //     if (seekableRanges.length() > 0) {
    //       val dvrWindowEnd = seekableRanges.getEnd(seekableRanges.length() - 1)
    //       val dvrWindowLengthInSeconds = dvrWindowEnd - seekableRanges.getStart(0)
    //       if (dvrWindowLengthInSeconds > 0) {
    //         if (BuildConfig.DEBUG) {
    //           Log.i(
    //             TAG,
    //             "DEBUG: set DVR window length of $dvrWindowLengthInSeconds"
    //           )
    //         }
    //         streamingAnalytics.setDvrWindowLength(
    //           java.lang.Double.valueOf(
    //             dvrWindowLengthInSeconds * 1000
    //           ).toLong()
    //         )
    //       }
    //     }
    //   } catch (e: Exception) {
    //     if (BuildConfig.DEBUG) {
    //       Log.e(TAG, "No seekable ranges available")
    //     }
    //   }
    // }
  }

  handleDurationChange(): void {
    if (__DEV__) {
      console.log(`${TAG} 🔄 handleDurationChange`);
    }
    // TODO check if durationchange gives content duration when there's a preroll
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
        console.log(`
          ${TAG} 🔄 handlePlay - PLAY event to start after an end event, create new session`);
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
        console.log(`
          ${TAG} 🔄 handlePlay - IGNORING PLAYING event after post-roll`);
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

  handleSeeked(): void {
    if (__DEV__) {
      console.log(`${TAG} 🔄 handleSeeked`);
    }
    // if (BuildConfig.DEBUG) {
    //   Log.i(TAG, "DEBUG: SEEKED to: " + seekedEvent.currentTime)
    // }
    // val currentTime = seekedEvent.currentTime
    // val seekableRanges = player.seekable
    // if (isNaN(player.duration) && seekableRanges.length() > 0) {
    //   val dvrWindowEnd = seekableRanges.getEnd(seekableRanges.length() - 1)
    //   val newDvrWindowOffset =
    //     java.lang.Double.valueOf(dvrWindowEnd - currentTime).toLong() * 1000
    //   if (BuildConfig.DEBUG) {
    //     Log.i(TAG, "DEBUG: new dvrWindowOffset: $newDvrWindowOffset")
    //   }
    //   streamingAnalytics.startFromDvrWindowOffset(newDvrWindowOffset)
    // } else {
    //   val newPosition = java.lang.Double.valueOf(currentTime).toLong() * 1000
    //   if (BuildConfig.DEBUG) {
    //     Log.i(TAG, "DEBUG: new position: $newPosition")
    //     Log.i(TAG, "DEBUG: startFromPosition")
    //   }
    //   streamingAnalytics.startFromPosition(newPosition)
    // }
  }

  handleRateChange(rate: number): void {
    if (__DEV__) {
      console.log(`${TAG} 🔄 handleRateChange`);
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
    // if (currentAdBreak == null && ad?.imaAd != null) {
    //   handleAdBreakBegin(ad.adBreak)
    // }
    // if (BuildConfig.DEBUG) {
    //   Log.i(TAG, "DEBUG: AD_BEGIN event")
    // }
    // currentAdDuration = (ad?.imaAd?.duration ?: 0.0) * 1000
    // setAdMetadata(currentAdDuration, currentAdOffset, ad?.id ?: "");
  }

  handleAdBreakBegin(): void {
    if (__DEV__) {
      console.log(`${TAG} 🔄 handleAdBreakBegin`);
    }
    // this.currentAdBreak = adBreak

    // if (BuildConfig.DEBUG) {
    //   Log.i(TAG, "DEBUG: AD_BREAK_BEGIN event")
    // }
    // currentAdOffset = adBreak?.timeOffset?.toDouble() ?: 0.0
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

  handleError(): void {
    if (__DEV__) {
      console.log(`${TAG} 🔄 handleError`);
    }
    this.transitionToStopped();
  }

  handleContentProtectionError(): void {
    if (__DEV__) {
      console.log(`${TAG} 🔄 handleContentProtectionError`);
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
    this.handleSeeked();
  }

  onProgress(_value: number, _duration?: number): void {}

  onEnd(): void {
    if (__DEV__) {
      console.log(`${TAG} 🎯 onEnd`);
    }
    this.handleEnded();
  }

  destroy(): void {
    if (__DEV__) {
      console.log(`${TAG} destroy`);
    }
    this.connectorConnector?.destroy();
  }
}
