/*
 *  Factory para crear loggers
 *
 */

import { LogLevel } from './types';
import { ComscoreLogger } from './ComscoreLogger';

export class ComscoreLoggerFactory {
  /*
   * Crea un logger básico para desarrollo
   *
   */

  static createDevelopmentLogger(instanceId?: number): ComscoreLogger {
    return new ComscoreLogger(
      {
        enabled: true,
        level: LogLevel.DEBUG,
        useColors: true,
        includeTimestamp: true,
        includeInstanceId: true,
      },
      instanceId
    );
  }

  /*
   * Crea un logger básico para producción
   *
   */

  static createProductionLogger(instanceId?: number): ComscoreLogger {
    return new ComscoreLogger(
      {
        enabled: false, // Deshabilitado por defecto en producción
        level: LogLevel.ERROR,
        useColors: false,
        includeTimestamp: false,
        includeInstanceId: true,
      },
      instanceId
    );
  }

  /*
   * Crea un logger basado en la configuración de ComScore
   *
   */

  static createFromComscoreConfig(
    debugEnabled: boolean,
    instanceId?: number
  ): ComscoreLogger {
    return debugEnabled
      ? ComscoreLoggerFactory.createDevelopmentLogger(instanceId)
      : ComscoreLoggerFactory.createProductionLogger(instanceId);
  }
}
