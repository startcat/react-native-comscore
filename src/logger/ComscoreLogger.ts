/*
 *  ComScore Logger - Sistema de logging centralizado
 *  Proporciona logging consistente y configurable para todos los componentes
 *
 */

import {
  type ComscoreLoggerConfig,
  type ComponentLogger,
  type IComscoreLogger,
  LogLevel,
} from './types';

import { DefaultComponentLogger } from './DefaultComponentLogger';

export class ComscoreLogger implements IComscoreLogger {
  private config: Required<ComscoreLoggerConfig>;
  private instanceId?: number;

  // Colores para consola (solo en desarrollo)
  private static readonly COLORS = {
    DEBUG: '\x1b[36m', // Cyan
    INFO: '\x1b[32m', // Green
    WARN: '\x1b[33m', // Yellow
    ERROR: '\x1b[31m', // Red
    RESET: '\x1b[0m', // Reset
  };

  private static readonly LEVEL_NAMES = {
    [LogLevel.DEBUG]: 'DEBUG',
    [LogLevel.INFO]: 'INFO',
    [LogLevel.WARN]: 'WARN',
    [LogLevel.ERROR]: 'ERROR',
    [LogLevel.NONE]: 'NONE',
  };

  constructor(config: ComscoreLoggerConfig = {}, instanceId?: number) {
    this.config = {
      enabled: config.enabled ?? __DEV__, // Por defecto habilitado solo en desarrollo
      level: config.level ?? LogLevel.INFO,
      prefix: config.prefix ?? '[ComScore]',
      includeTimestamp: config.includeTimestamp ?? true,
      includeInstanceId: config.includeInstanceId ?? true,
      useColors: config.useColors ?? __DEV__,
      filterComponents: config.filterComponents ?? [],
    };

    this.instanceId = instanceId;
  }

  debug(component: string, message: string, ...args: any[]): void {
    this.log(LogLevel.DEBUG, component, message, ...args);
  }

  info(component: string, message: string, ...args: any[]): void {
    this.log(LogLevel.INFO, component, message, ...args);
  }

  warn(component: string, message: string, ...args: any[]): void {
    this.log(LogLevel.WARN, component, message, ...args);
  }

  error(component: string, message: string, ...args: any[]): void {
    this.log(LogLevel.ERROR, component, message, ...args);
  }

  log(
    level: LogLevel,
    component: string,
    message: string,
    ...args: any[]
  ): void {
    // Verificar si el logging está habilitado
    if (!this.config.enabled || level < this.config.level) {
      return;
    }

    // Filtrar por componentes si está configurado
    if (
      this.config.filterComponents.length > 0 &&
      !this.config.filterComponents.includes(component)
    ) {
      return;
    }

    // Construir el mensaje
    const logMessage = this.buildLogMessage(level, component, message);
    const logMethod = this.getLogMethod(level);

    // Aplicar colores si está habilitado
    const finalMessage = this.config.useColors
      ? this.applyColors(level, logMessage)
      : logMessage;

    // Procesar argumentos para stringify objetos
    // const processedArgs = args.map((arg) => {
    //   // Solo stringify objetos, no primitivos
    //   if (arg !== null && typeof arg === 'object') {
    //     try {
    //       return JSON.stringify(arg, null, 2);
    //     } catch (error) {
    //       // En caso de referencias circulares u otros errores
    //       return '[Object - stringify error]';
    //     }
    //   }
    //   return arg;
    // });

    // Hacer el log
    if (args.length > 0) {
      logMethod(finalMessage, ...args);
    } else {
      logMethod(finalMessage);
    }
  }

  forComponent(componentName: string): ComponentLogger {
    return new DefaultComponentLogger(this, componentName);
  }

  updateConfig(config: Partial<ComscoreLoggerConfig>): void {
    this.config = { ...this.config, ...config };
  }

  setEnabled(enabled: boolean): void {
    this.config.enabled = enabled;
  }

  setLevel(level: LogLevel): void {
    this.config.level = level;
  }

  setInstanceId(instanceId: number): void {
    this.instanceId = instanceId;
  }

  private buildLogMessage(
    level: LogLevel,
    component: string,
    message: string
  ): string {
    const parts: string[] = [];

    // Prefijo principal
    parts.push(this.config.prefix);

    // Timestamp
    if (this.config.includeTimestamp) {
      parts.push(this.formatTimestamp());
    }

    // Instance ID
    if (this.config.includeInstanceId && this.instanceId !== undefined) {
      parts.push(`#${this.instanceId}`);
    }

    // Nivel de log
    parts.push(`[${ComscoreLogger.LEVEL_NAMES[level]}]`);

    // Componente
    parts.push(`[${component}]`);

    // Mensaje
    parts.push(message);

    return parts.join(' ');
  }

  private formatTimestamp(): string {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const seconds = now.getSeconds().toString().padStart(2, '0');
    const ms = now.getMilliseconds().toString().padStart(3, '0');
    return `${hours}:${minutes}:${seconds}.${ms}`;
  }

  private applyColors(level: LogLevel, message: string): string {
    const colorMap = {
      [LogLevel.DEBUG]: ComscoreLogger.COLORS.DEBUG,
      [LogLevel.INFO]: ComscoreLogger.COLORS.INFO,
      [LogLevel.WARN]: ComscoreLogger.COLORS.WARN,
      [LogLevel.ERROR]: ComscoreLogger.COLORS.ERROR,
      [LogLevel.NONE]: '', // No color for NONE level
    };

    const color = colorMap[level];
    return color ? `${color}${message}${ComscoreLogger.COLORS.RESET}` : message;
  }

  private getLogMethod(level: LogLevel): (...args: any[]) => void {
    switch (level) {
      case LogLevel.DEBUG:
      case LogLevel.INFO:
        return console.log;
      case LogLevel.WARN:
        return console.warn;
      case LogLevel.ERROR:
        return console.error;
      default:
        return console.log;
    }
  }
}
