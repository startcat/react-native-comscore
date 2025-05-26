import type { ComscoreConfiguration } from '../types/ComscoreConfiguration';
import type { ComscoreMetadata } from '../types/ComscoreMetadata';
import { NativeModules } from 'react-native';

export class ComscoreConnectorAdapter {
  constructor(
    private instanceId: number,
    comscoreMetadata: ComscoreMetadata,
    comscoreConfig: ComscoreConfiguration
  ) {
    NativeModules.ComscoreModule.initialize(
      this.instanceId,
      comscoreMetadata,
      comscoreConfig
    );
  }

  update(metadata: ComscoreMetadata): void {
    NativeModules.ComscoreModule.updateStreaming(this.instanceId, metadata);
  }

  setPersistentLabel(label: string, value: string): void {
    NativeModules.ComscoreModule.setPersistentLabelStreaming(
      this.instanceId,
      label,
      value
    );
  }

  setPersistentLabels(labels: { [key: string]: string }): void {
    NativeModules.ComscoreModule.setPersistentLabelsStreaming(
      this.instanceId,
      labels
    );
  }

  destroy(): void {
    NativeModules.ComscoreModule.destroyStreaming(this.instanceId || -1);
  }
}
