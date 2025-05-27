import type { ComscoreConfiguration } from './types/ComscoreConfiguration';
import type { ComscoreMetadata } from './types/ComscoreMetadata';
import { NativeModules } from 'react-native';

export class ComscoreConnector {
  private instanceId: number;

  constructor(
    instanceId: number,
    comscoreMetadata: ComscoreMetadata,
    comscoreConfig: ComscoreConfiguration
  ) {
    console.log('ComscoreConnector constructor', instanceId);
    this.instanceId = instanceId;

    if (!NativeModules.Comscore) {
      console.error('Comscore native module is not available');
      return;
    }

    try {
      NativeModules.Comscore.initializeStreaming(
        this.instanceId,
        comscoreMetadata,
        comscoreConfig
      );
    } catch (error) {
      console.error('Error initializing Comscore:', error);
    }
  }

  /**
   * Sets/updates Comscore metadata on the Comscore video analytics.
   * @param metadata object of key value pairs
   */
  update(metadata: ComscoreMetadata): void {
    if (!NativeModules.Comscore) return;
    NativeModules.Comscore.updateStreaming(this.instanceId, metadata);
  }

  /**
   * Set a persistent label on the ComScore PublisherConfiguration
   */
  setPersistentLabel(label: string, value: string): void {
    if (!NativeModules.Comscore) return;
    NativeModules.Comscore.setPersistentLabelStreaming(
      this.instanceId,
      label,
      value
    );
  }

  /**
   * Set persistent labels on the ComScore PublisherConfiguration
   * @param labels object of key value pairs
   */
  setPersistentLabels(labels: { [key: string]: string }): void {
    if (!NativeModules.Comscore) return;
    NativeModules.Comscore.setPersistentLabelsStreaming(
      this.instanceId,
      labels
    );
  }

  /**
   * Destroy ComScoreStreamingAnalytics and unregister it from player
   */
  destroy(): void {
    if (!NativeModules.Comscore) return;
    NativeModules.Comscore.destroyStreaming(this.instanceId || -1);
  }
}
