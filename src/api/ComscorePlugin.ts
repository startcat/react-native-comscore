import type { ComscoreConfiguration } from './types/ComscoreConfiguration';
import type { ComscoreMetadata } from './types/ComscoreMetadata';

import { ComscoreConnector } from './ComscoreConnector';

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
  private connectorConnector: ComscoreConnector;

  constructor(
    ComscoreMetadata: ComscoreMetadata,
    ComscoreConfig: ComscoreConfiguration
  ) {
    const instanceId = Math.floor(Math.random() * 10000);
    console.log('ComscorePlugin constructor', instanceId);
    this.connectorConnector = new ComscoreConnector(
      instanceId,
      ComscoreMetadata,
      ComscoreConfig
    );
  }

  update(metadata: ComscoreMetadata): void {
    this.connectorConnector.update(metadata);
  }

  setPersistentLabel(label: string, value: string): void {
    this.connectorConnector.setPersistentLabel(label, value);
  }

  setPersistentLabels(labels: { [key: string]: string }): void {
    this.connectorConnector.setPersistentLabels(labels);
  }

  destroy(): void {
    this.connectorConnector.destroy();
  }

  // Funciones internas del plugin

  setMedatata(metadata: ComscoreMetadata): void {
    this.connectorConnector.update(metadata);
  }

  setAdMetadata(): void {}
  setContentMetadata(): void {}
  buildContentMetadata(): void {}
  transitionToStopped(): void {}
  transitionToPaused(): void {}
  transitionToAdvertisement(): void {}
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
