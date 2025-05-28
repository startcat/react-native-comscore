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
  // private comScoreState: ComscoreState;

  // private buffering: boolean;
  // private ended: boolean;

  // TODO: Ads
  // private currentAdDuration: number;
  // private currentAdOffset: number;
  // private inAd: boolean;
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
    // this.comScoreState = ComscoreState.INITIALIZED;
    // this.currentAdDuration = 0.0;
    // this.currentAdOffset = 0.0;
    // this.buffering = false;
    // this.ended = false;
    // this.inAd = false;
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

    // if (this.comscoreMetaData === null) {
    //   this.buildContentMetadata()
    // }
    this.connectorConnector?.setMetadata(this.currentContentMetadata!);
  }

  buildContentMetadata(): void {}
  transitionToStopped(): void {}
  transitionToPaused(): void {}
  transitionToAdvertisement(): void {
    // TODO: Ads
  }
  transitionToVideo(): void {}

  handleSourceChange(): void {}
  handleMetadataLoaded(): void {}
  handleDurationChange(): void {}
  handlePlay(): void {}
  handlePlaying(): void {}
  handlePause(): void {}
  handleSeeking(): void {}
  handleSeeked(): void {}
  handleWaiting(): void {}
  handleRateChange(): void {}
  handleError(): void {}
  handleContentProtectionError(): void {}
  handleEnded(): void {}
  handleAdBreakBegin(): void {}
  handleAdBegin(): void {}
  handleContentResume(): void {}
}
