import type { ComscoreConfiguration } from '../types/ComscoreConfiguration';
import type { ComscoreMetadata } from '../types/ComscoreMetadata';
import { NativeModules } from 'react-native';

export class ComscoreConnectorAdapter {
  constructor(
    private instanceId: number,
    comscoreMetadata: ComscoreMetadata,
    comscoreConfig: ComscoreConfiguration
  ) {
    NativeModules.Comscore.initializeStreaming(
      this.instanceId,
      comscoreMetadata,
      comscoreConfig
    );
  }

  update(metadata: ComscoreMetadata): void {
    NativeModules.Comscore.updateStreaming(this.instanceId, metadata);
  }

  setPersistentLabel(label: string, value: string): void {
    NativeModules.Comscore.setPersistentLabelStreaming(
      this.instanceId,
      label,
      value
    );
  }

  setPersistentLabels(labels: { [key: string]: string }): void {
    NativeModules.Comscore.setPersistentLabelsStreaming(
      this.instanceId,
      labels
    );
  }

  destroy(): void {
    NativeModules.Comscore.destroyStreaming(this.instanceId || -1);
  }
}
