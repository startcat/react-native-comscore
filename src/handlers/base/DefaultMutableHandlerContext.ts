/*
 *  Implementación del contexto mutable
 *
 */

import { type MutableHandlerContext } from '../types';
import { type IComscoreConnector } from '../../types/ComscoreConnector';
import { type ComscoreMetadata } from '../../types/ComscoreMetadata';
import { type ComscoreConfiguration } from '../../types/ComscoreConfiguration';
import { type IComscoreLogger } from '../../logger/types';

export class DefaultMutableHandlerContext implements MutableHandlerContext {
  public metadata: ComscoreMetadata;
  public readonly connector: IComscoreConnector;
  public readonly configuration: ComscoreConfiguration;
  public readonly logger: IComscoreLogger;
  public readonly instanceId: number;

  constructor(
    connector: IComscoreConnector,
    metadata: ComscoreMetadata,
    configuration: ComscoreConfiguration,
    logger: IComscoreLogger
  ) {
    this.connector = connector;
    this.metadata = metadata;
    this.configuration = configuration;
    this.logger = logger;
    this.instanceId = connector.getInstanceId();
  }

  updateMetadata(newMetadata: ComscoreMetadata): void {
    this.metadata = newMetadata;
    this.logger.debug('HandlerContext', 'Metadata updated', newMetadata);
  }
}
