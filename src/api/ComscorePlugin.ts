import type { ComscoreConfiguration } from './types/ComscoreConfiguration';
import type { ComscoreMetadata } from './types/ComscoreMetadata';

import { ComscoreConnector } from './ComscoreConnector';

export class ComscorePlugin {
  private connectorConnector: ComscoreConnector;

  constructor(
    instanceId: number,
    ComscoreMetadata: ComscoreMetadata,
    ComscoreConfig: ComscoreConfiguration
  ) {
    this.connectorConnector = new ComscoreConnector(
      instanceId,
      ComscoreMetadata,
      ComscoreConfig
    );
    console.log('ComscorePlugin constructor', instanceId);
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
