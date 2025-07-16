/*
 *  Handler Context - Contexto compartido entre todos los handlers
 *  Contiene las dependencias comunes que necesitan todos los handlers
 *
 */

import { type IComscoreConnector } from '../../types/ComscoreConnector';
import { type ComscoreMetadata } from '../../types/ComscoreMetadata';
import { type ComscoreConfiguration } from '../../types/ComscoreConfiguration';
import { type IComscoreLogger } from '../../logger/types';

export * from './StateManager';

export interface BaseHandler {
  readonly name: string;
}

export interface HandlerContext {
  readonly connector: IComscoreConnector;
  readonly metadata: ComscoreMetadata;
  readonly configuration: ComscoreConfiguration;
  readonly logger: IComscoreLogger;
  readonly instanceId: number;
}

/*
 *  Factory para crear el contexto
 *
 */

export interface HandlerContextFactory {
  create(
    connector: IComscoreConnector,
    metadata: ComscoreMetadata,
    configuration: ComscoreConfiguration,
    logger: IComscoreLogger
  ): HandlerContext;
}

/*
 *  Contexto mutable para casos donde necesitamos actualizar metadatos
 *
 */

export interface MutableHandlerContext
  extends Omit<HandlerContext, 'metadata'> {
  metadata: ComscoreMetadata;
  updateMetadata(newMetadata: ComscoreMetadata): void;
}
