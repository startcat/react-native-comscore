/*
 *  Implementación del logger específico para componente
 *
 */

import { type ComponentLogger, type IComscoreLogger, LogLevel } from './types';

export class DefaultComponentLogger implements ComponentLogger {
  constructor(
    private logger: IComscoreLogger,
    private componentName: string
  ) {}

  debug(message: string, ...args: any[]): void {
    this.logger.debug(this.componentName, message, ...args);
  }

  info(message: string, ...args: any[]): void {
    this.logger.info(this.componentName, message, ...args);
  }

  warn(message: string, ...args: any[]): void {
    this.logger.warn(this.componentName, message, ...args);
  }

  error(message: string, ...args: any[]): void {
    this.logger.error(this.componentName, message, ...args);
  }

  log(level: LogLevel, message: string, ...args: any[]): void {
    this.logger.log(level, this.componentName, message, ...args);
  }
}
