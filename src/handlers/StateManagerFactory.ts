/*
 *  Factory para crear StateManager
 *
 */

import { type HandlerContext, type StateManagerConfig } from './types';
import { ComscoreStateManager } from './ComscoreStateManager';

export class StateManagerFactory {
  /*
   * Crea un StateManager con configuración por defecto
   *
   */

  static create(context: HandlerContext): ComscoreStateManager {
    return new ComscoreStateManager(context);
  }

  /*
   * Crea un StateManager con validación de transiciones deshabilitada (para testing)
   *
   */

  static createForTesting(context: HandlerContext): ComscoreStateManager {
    return new ComscoreStateManager(context, {
      validateTransitions: false,
      enableVerboseLogging: true,
    });
  }

  /*
   * Crea un StateManager con configuración específica
   *
   */

  static createWithConfig(
    context: HandlerContext,
    config: StateManagerConfig
  ): ComscoreStateManager {
    return new ComscoreStateManager(context, config);
  }

  /*
   * Crea un StateManager para desarrollo con logs detallados
   *
   */

  static createForDevelopment(context: HandlerContext): ComscoreStateManager {
    return new ComscoreStateManager(context, {
      validateTransitions: true,
      enableVerboseLogging: true,
    });
  }

  /*
   * Crea un StateManager para producción con configuración optimizada
   *
   */

  static createForProduction(context: HandlerContext): ComscoreStateManager {
    return new ComscoreStateManager(context, {
      validateTransitions: false, // Mejor performance en producción
      enableVerboseLogging: false,
    });
  }
}
