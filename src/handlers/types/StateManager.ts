/*
 *  Interfaz para callbacks de cambio de estado
 *
 */

import { ComscoreState, type ComscoreMetadata } from '../../types';

export interface StateChangeListener {
  onStateChanged(
    fromState: ComscoreState,
    toState: ComscoreState,
    reason?: string
  ): void;
}

/*
 *  Configuración del StateManager
 *
 */

export interface StateManagerConfig {
  validateTransitions?: boolean;
  enableVerboseLogging?: boolean;
  stateChangeListeners?: StateChangeListener[];
}

/*
 *  Interfaz del StateManager
 *
 */

export interface IComscoreStateManager {
  // Estado actual
  getCurrentState(): ComscoreState;
  setCurrentState(state: ComscoreState, reason?: string): void;

  // Metadatos de contenido
  getCurrentContentMetadata(): ComscoreMetadata | null;
  setCurrentContentMetadata(metadata: ComscoreMetadata | null): void;

  // Variables de control
  getBuffering(): boolean;
  setBuffering(buffering: boolean): void;

  getEnded(): boolean;
  setEnded(ended: boolean): void;

  getInAd(): boolean;
  setInAd(inAd: boolean): void;

  getCurrentAdOffset(): number;
  setCurrentAdOffset(offset: number): void;

  // Transiciones de estado
  transitionToStopped(reason?: string): void;
  transitionToPaused(reason?: string): void;
  transitionToAdvertisement(reason?: string): void;
  transitionToVideo(reason?: string): void;

  // Utilidades
  canTransitionTo(targetState: ComscoreState): boolean;
  reset(): void;

  // Listeners
  addStateChangeListener(listener: StateChangeListener): void;
  removeStateChangeListener(listener: StateChangeListener): void;
}

/*
 *  Tipos auxiliares
 *
 */

export interface StateSnapshot {
  currentState: ComscoreState;
  currentContentMetadata: ComscoreMetadata | null;
  buffering: boolean;
  ended: boolean;
  inAd: boolean;
  currentAdOffset: number;
  instanceId: number;
  timestamp: number;
}
