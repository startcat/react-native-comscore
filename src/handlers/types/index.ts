/*
 *  Handler Context - Contexto compartido entre todos los handlers
 *  Contiene las dependencias comunes que necesitan todos los handlers
 *
 */

import { type IComscoreConnector } from '../../types/ComscoreConnector';
import { type ComscoreMetadata } from '../../types/ComscoreMetadata';
import { type ComscoreConfiguration } from '../../types/ComscoreConfiguration';
import { type IComscoreLogger } from '../../logger/types';
import { type ComscoreState } from '../../types';

export * from './StateManager';

export interface QualityInfo {
  quality: string;
  width?: number;
  height?: number;
  bitrate?: number;
  timestamp: number;
}

export interface AudioInfo {
  trackIndex: number;
  trackLabel?: string;
  language?: string;
  timestamp: number;
}

export interface VolumeInfo {
  volume: number;
  muted: boolean;
  timestamp: number;
}

export interface SubtitleInfo {
  trackIndex: number;
  trackLabel?: string;
  language?: string;
  visible: boolean;
  timestamp: number;
}

export interface ComscoreErrorInfo {
  errorCode: string | number;
  errorMessage: string;
  errorType: string;
  isFatal: boolean;
  timestamp: number;
  currentState: ComscoreState;
  sessionContext?: any;
}

export interface MetadataChangeInfo {
  previousMetadata: ComscoreMetadata | null;
  newMetadata: ComscoreMetadata;
  changeType: 'update' | 'load' | 'duration_change' | 'complete_change';
  timestamp: number;
  affectedFields: string[];
}

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
