/*
 *  Implementación del factory
 *
 */

import { type HandlerContextFactory, type HandlerContext } from '../types';
import { type IComscoreConnector } from '../../types/ComscoreConnector';
import { type ComscoreMetadata } from '../../types/ComscoreMetadata';
import { type ComscoreConfiguration } from '../../types/ComscoreConfiguration';
import { type IComscoreLogger } from '../../logger/types';

export class DefaultHandlerContextFactory implements HandlerContextFactory {
  create(
    connector: IComscoreConnector,
    metadata: ComscoreMetadata,
    configuration: ComscoreConfiguration,
    logger: IComscoreLogger
  ): HandlerContext {
    return {
      connector,
      metadata,
      configuration,
      logger,
      instanceId: connector.getInstanceId(),
    };
  }
}
