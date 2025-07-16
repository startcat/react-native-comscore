/*
 *  Utilidades para trabajar con el contexto
 *
 */

import { type HandlerContext, type MutableHandlerContext } from '../types';

export class HandlerContextUtils {
  /*
   * Valida que el contexto tenga todas las dependencias necesarias
   *
   */

  static validate(context: HandlerContext): boolean {
    return !!(
      context.connector &&
      context.metadata &&
      context.configuration &&
      context.logger &&
      typeof context.instanceId === 'number'
    );
  }

  /*
   * Crea un contexto inmutable a partir de uno mutable
   *
   */

  static freeze(context: MutableHandlerContext): HandlerContext {
    return {
      connector: context.connector,
      metadata: { ...context.metadata }, // shallow copy
      configuration: context.configuration,
      logger: context.logger,
      instanceId: context.instanceId,
    };
  }

  /*
   * Verifica si el contexto está configurado para debug
   *
   */

  static isDebugEnabled(context: HandlerContext): boolean {
    return context.configuration.debug === true;
  }

  /*
   * Verifica si el contexto permite tracking en background
   *
   */

  static allowsBackgroundTracking(context: HandlerContext): boolean {
    return (
      context.configuration.usagePropertiesAutoUpdateMode ===
      'foregroundAndBackground'
    );
  }

  /*
   * Verifica si el tracking automático está deshabilitado
   *
   */

  static isAutoTrackingDisabled(context: HandlerContext): boolean {
    return context.configuration.usagePropertiesAutoUpdateMode === 'disabled';
  }

  /*
   * Obtiene un identificador único para logs que incluye el instanceId
   *
   */

  static getLogIdentifier(
    context: HandlerContext,
    handlerName: string
  ): string {
    return `[${handlerName}:${context.instanceId}]`;
  }
}
