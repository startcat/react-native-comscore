import type { ComscoreConfiguration } from './types/ComscoreConfiguration';
import type { ComscoreMetadata } from './types/ComscoreMetadata';

import { ComscoreConnector } from './ComscoreConnector';

const TAG = '[ComscorePlugin]';

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
 *    onSourceChange
 *    onLoadedMetadata
 *    onDurationChange
 *    onPlay
 *    onPlaying
 *    onPause
 *    onSeeking
 *    onSeeked
 *    onWaiting
 *    onRateChange
 *    onError
 *    onContentProtectionError
 *    onEnded
 *    onAdStarted
 *    onContentResume
 *
 */

export class ComscorePlugin {
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

  update(metadata: ComscoreMetadata): void {
    this.connectorConnector?.update(metadata);
  }

  setPersistentLabel(label: string, value: string): void {
    this.connectorConnector?.setPersistentLabel(label, value);
  }

  setPersistentLabels(labels: { [key: string]: string }): void {
    this.connectorConnector?.setPersistentLabels(labels);
  }

  destroy(): void {
    this.connectorConnector?.destroy();
  }

  // Funciones internas del plugin

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

  handleSourceChange(): void {
    if (__DEV__) {
      console.log(`${TAG} 🎯 handleSourceChange`);
    }
    this.comScoreState = ComscoreState.INITIALIZED;
    this.currentContentMetadata = null;
    this.connectorConnector?.createPlaybackSession();
  }

  handleMetadataLoaded(): void {
    if (__DEV__) {
      console.log(`${TAG} 🎯 handleMetadataLoaded`);
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
    // TODO check if durationchange gives content duration when there's a preroll
  }

  handlePlay(): void {
    if (__DEV__) {
      console.log(`${TAG} 🎯 handlePlay`);
    }

    if (this.ended) {
      // Create new session when replaying an asset
      this.ended = false;

      if (__DEV__) {
        console.log(`
          ${TAG} 🎯 handlePlay - PLAY event to start after an end event, create new session`);
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
          ${TAG} 🎯 handlePlay - IGNORING PLAYING event after post-roll`);
      }
      return; // last played ad was a post-roll so there's no real content coming, return and report nothing
    } else {
      this.transitionToVideo(); // will set content metadata and notify play if not done already
    }
  }

  handleBuffering(isBuffering: boolean): void {
    if (__DEV__) {
      console.log(`${TAG} 🎯 handleBuffering ${isBuffering}`);
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

  handlePause(): void {
    if (__DEV__) {
      console.log(`${TAG} 🎯 handlePause`);
    }
    this.transitionToPaused();
  }

  handleSeeking(): void {
    if (__DEV__) {
      console.log(`${TAG} 🎯 handleSeeking`);
    }
    this.connectorConnector?.notifySeekStart();
  }

  handleSeeked(): void {
    if (__DEV__) {
      console.log(`${TAG} 🎯 handleSeeked`);
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
      console.log(`${TAG} 🎯 handleRateChange`);
    }
    this.connectorConnector?.notifyChangePlaybackRate(rate);
  }

  handleError(): void {
    if (__DEV__) {
      console.log(`${TAG} 🎯 handleError`);
    }
    this.transitionToStopped();
  }

  handleEnded(): void {
    if (__DEV__) {
      console.log(`${TAG} 🎯 handleEnded`);
    }
    this.transitionToStopped();
    this.ended = true;
  }

  handleAdBreakBegin(): void {
    if (__DEV__) {
      console.log(`${TAG} 🎯 handleAdBreakBegin`);
    }
    // this.currentAdBreak = adBreak

    // if (BuildConfig.DEBUG) {
    //   Log.i(TAG, "DEBUG: AD_BREAK_BEGIN event")
    // }
    // currentAdOffset = adBreak?.timeOffset?.toDouble() ?: 0.0
    this.inAd = true;
    this.transitionToAdvertisement();
  }

  handleAdBegin(): void {
    if (__DEV__) {
      console.log(`${TAG} 🎯 handleAdBegin`);
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

  handleContentResume(): void {
    if (__DEV__) {
      console.log(`${TAG} 🎯 handleContentResume`);
    }
    this.inAd = false;
    this.transitionToVideo();
  }

  handleContentProtectionError(): void {
    // TODO: DRM errors
  }
}
