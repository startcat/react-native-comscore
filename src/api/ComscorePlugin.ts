import type { ComscoreConfiguration } from './types/ComscoreConfiguration';
import type { ComscoreMetadata } from './types/ComscoreMetadata';

import { ComscoreConnector } from './ComscoreConnector';

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
}
