/*
 *  Configuración opcional del plugin
 *
 */

export interface ComscorePluginConfig {
  /*
   * Habilitar handlers específicos (todos habilitados por defecto)
   *
   */

  enabledHandlers?: {
    playback?: boolean;
    application?: boolean;
    advertisement?: boolean;
    metadata?: boolean;
    quality?: boolean;
    errors?: boolean;
  };

  /*
   * Configuración específica del logger
   *
   */

  loggerConfig?: {
    enableVerboseLogging?: boolean;
    filterComponents?: string[];
  };

  /*
   * Configuración del StateManager
   *
   */

  stateManagerConfig?: {
    validateTransitions?: boolean;
    enableVerboseLogging?: boolean;
  };
}
