/*
 *  Niveles de log disponibles
 *
 */

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  NONE = 4, // Desactiva todos los logs
}

export interface ComscoreLoggerConfig {
  enabled?: boolean;
  level?: LogLevel;
  prefix?: string;
  includeTimestamp?: boolean;
  includeInstanceId?: boolean;

  /*
   * Colores para diferentes niveles (solo en desarrollo)
   *
   */

  useColors?: boolean;

  /*
   * Componentes específicos para filtrar logs
   * Si se especifica, solo se mostrarán logs de estos componentes
   *
   */

  filterComponents?: string[];
}

export interface IComscoreLogger {
  debug(component: string, message: string, ...args: any[]): void;
  info(component: string, message: string, ...args: any[]): void;
  warn(component: string, message: string, ...args: any[]): void;
  error(component: string, message: string, ...args: any[]): void;
  log(
    level: LogLevel,
    component: string,
    message: string,
    ...args: any[]
  ): void;
  forComponent(componentName: string): ComponentLogger;
  updateConfig(config: Partial<ComscoreLoggerConfig>): void;
  setEnabled(enabled: boolean): void;
  setLevel(level: LogLevel): void;
}

/*
 *  Logger específico para un componente
 *
 */

export interface ComponentLogger {
  debug(message: string, ...args: any[]): void;
  info(message: string, ...args: any[]): void;
  warn(message: string, ...args: any[]): void;
  error(message: string, ...args: any[]): void;
  log(level: LogLevel, message: string, ...args: any[]): void;
}
