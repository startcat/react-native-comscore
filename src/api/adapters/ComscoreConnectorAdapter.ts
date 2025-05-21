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
    NativeModules.ComscoreModule.update(this.instanceId, metadata);
  }

  setPersistentLabel(label: string, value: string): void {
    NativeModules.ComscoreModule.setPersistentLabel(
      this.instanceId,
      label,
      value
    );
  }

  setPersistentLabels(labels: { [key: string]: string }): void {
    NativeModules.ComscoreModule.setPersistentLabels(this.instanceId, labels);
  }

  destroy(): void {
    NativeModules.ComscoreModule.destroy(this.instanceId || -1);
  }
}
