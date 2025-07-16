/*
 *  ComScore State Manager - Gestión centralizada de estados
 *  Maneja todas las transiciones de estado y variables de control del plugin
 *
 */

import { ComscoreState, type ComscoreMetadata } from '../types';
import { type ComponentLogger } from '../logger/types';
import { type HandlerContext } from '../handlers/types';
import {
  type StateManagerConfig,
  type StateChangeListener,
  type IComscoreStateManager,
  type StateSnapshot,
} from './types/StateManager';

export class ComscoreStateManager implements IComscoreStateManager {
  private context: HandlerContext;
  private logger: ComponentLogger;
  private config: Required<StateManagerConfig>;

  // Estado principal
  private currentState: ComscoreState;
  private currentContentMetadata: ComscoreMetadata | null;

  // Variables de control
  private buffering: boolean;
  private ended: boolean;
  private inAd: boolean;
  private currentAdOffset: number;

  // Listeners
  private stateChangeListeners: StateChangeListener[];

  // Transiciones válidas - define qué transiciones están permitidas
  private static readonly VALID_TRANSITIONS: Record<
    ComscoreState,
    ComscoreState[]
  > = {
    [ComscoreState.INITIALIZED]: [
      ComscoreState.VIDEO,
      ComscoreState.ADVERTISEMENT,
      ComscoreState.STOPPED,
    ],
    [ComscoreState.STOPPED]: [
      ComscoreState.INITIALIZED,
      ComscoreState.VIDEO,
      ComscoreState.ADVERTISEMENT,
    ],
    [ComscoreState.VIDEO]: [
      ComscoreState.PAUSED_VIDEO,
      ComscoreState.ADVERTISEMENT,
      ComscoreState.STOPPED,
    ],
    [ComscoreState.PAUSED_VIDEO]: [
      ComscoreState.VIDEO,
      ComscoreState.ADVERTISEMENT,
      ComscoreState.STOPPED,
    ],
    [ComscoreState.ADVERTISEMENT]: [
      ComscoreState.PAUSED_AD,
      ComscoreState.VIDEO,
      ComscoreState.STOPPED,
    ],
    [ComscoreState.PAUSED_AD]: [
      ComscoreState.ADVERTISEMENT,
      ComscoreState.VIDEO,
      ComscoreState.STOPPED,
    ],
  };

  constructor(context: HandlerContext, config: StateManagerConfig = {}) {
    this.context = context;
    this.logger = context.logger.forComponent('StateManager');

    this.config = {
      validateTransitions: config.validateTransitions ?? true,
      enableVerboseLogging:
        config.enableVerboseLogging ?? !!context.configuration.debug,
      stateChangeListeners: config.stateChangeListeners ?? [],
    };

    // Inicializar estado
    this.currentState = ComscoreState.INITIALIZED;
    this.currentContentMetadata = context.metadata;
    this.buffering = false;
    this.ended = false;
    this.inAd = false;
    this.currentAdOffset = 0.0;
    this.stateChangeListeners = [...this.config.stateChangeListeners];

    this.logger.debug('StateManager initialized', {
      initialState: this.currentState,
      instanceId: context.instanceId,
    });
  }

  /*
   *  Getters y Setters de estado
   *
   */

  getCurrentState(): ComscoreState {
    return this.currentState;
  }

  setCurrentState(state: ComscoreState, reason?: string): void {
    if (this.currentState !== state) {
      const previousState = this.currentState;
      this.currentState = state;

      this.logger.info('State set directly', {
        from: previousState,
        to: state,
        reason: reason || 'direct_set',
      });

      this.notifyStateChange(previousState, state, reason);
    }
  }

  getCurrentContentMetadata(): ComscoreMetadata | null {
    return this.currentContentMetadata;
  }

  setCurrentContentMetadata(metadata: ComscoreMetadata | null): void {
    this.currentContentMetadata = metadata;

    if (this.config.enableVerboseLogging) {
      this.logger.debug('Content metadata updated', metadata);
    }

    // Si hay metadatos, establecerlos en el conector
    if (metadata) {
      this.context.connector.setMetadata(metadata);
    }
  }

  getBuffering(): boolean {
    return this.buffering;
  }

  setBuffering(buffering: boolean): void {
    if (this.buffering !== buffering) {
      const previous = this.buffering;
      this.buffering = buffering;

      if (this.config.enableVerboseLogging) {
        this.logger.debug('Buffering state changed', {
          previous,
          current: buffering,
        });
      }
    }
  }

  getEnded(): boolean {
    return this.ended;
  }

  setEnded(ended: boolean): void {
    if (this.ended !== ended) {
      const previous = this.ended;
      this.ended = ended;

      if (this.config.enableVerboseLogging) {
        this.logger.debug('Ended state changed', { previous, current: ended });
      }
    }
  }

  getInAd(): boolean {
    return this.inAd;
  }

  setInAd(inAd: boolean): void {
    if (this.inAd !== inAd) {
      const previous = this.inAd;
      this.inAd = inAd;

      if (this.config.enableVerboseLogging) {
        this.logger.debug('InAd state changed', { previous, current: inAd });
      }
    }
  }

  getCurrentAdOffset(): number {
    return this.currentAdOffset;
  }

  setCurrentAdOffset(offset: number): void {
    if (this.currentAdOffset !== offset) {
      const previous = this.currentAdOffset;
      this.currentAdOffset = offset;

      if (this.config.enableVerboseLogging) {
        this.logger.debug('Ad offset changed', { previous, current: offset });
      }
    }
  }

  /*
   *  Transiciones de estado principales
   *
   */

  transitionToStopped(reason?: string): void {
    if (this.currentState !== ComscoreState.STOPPED) {
      this.performTransition(ComscoreState.STOPPED, reason);
      this.context.connector.notifyEnd();
    }
  }

  transitionToPaused(reason?: string): void {
    let targetState: ComscoreState;

    if (this.currentState === ComscoreState.VIDEO) {
      targetState = ComscoreState.PAUSED_VIDEO;
    } else if (this.currentState === ComscoreState.ADVERTISEMENT) {
      targetState = ComscoreState.PAUSED_AD;
    } else {
      this.logger.warn('Cannot pause from current state', {
        currentState: this.currentState,
        reason,
      });
      return;
    }

    this.performTransition(targetState, reason);
    this.context.connector.notifyPause();
  }

  transitionToAdvertisement(reason?: string): void {
    const validFromStates = [
      ComscoreState.PAUSED_AD,
      ComscoreState.INITIALIZED,
      ComscoreState.VIDEO,
      ComscoreState.PAUSED_VIDEO,
      ComscoreState.STOPPED,
    ];

    if (validFromStates.includes(this.currentState)) {
      this.performTransition(ComscoreState.ADVERTISEMENT, reason);
      this.context.connector.notifyPlay();
    } else {
      this.logger.warn('Invalid transition to advertisement', {
        currentState: this.currentState,
        reason,
      });
    }
  }

  transitionToVideo(reason?: string): void {
    const validFromStates = [
      ComscoreState.PAUSED_VIDEO,
      ComscoreState.ADVERTISEMENT,
      ComscoreState.PAUSED_AD,
      ComscoreState.STOPPED,
      ComscoreState.INITIALIZED,
    ];

    if (validFromStates.includes(this.currentState)) {
      this.performTransition(ComscoreState.VIDEO, reason);
      this.context.connector.notifyPlay();
    } else {
      this.logger.warn('Invalid transition to video', {
        currentState: this.currentState,
        reason,
      });
    }
  }

  /*
   *  Utilidades
   *
   */

  canTransitionTo(targetState: ComscoreState): boolean {
    if (!this.config.validateTransitions) {
      return true;
    }

    const validTransitions =
      ComscoreStateManager.VALID_TRANSITIONS[this.currentState];

    return validTransitions?.includes(targetState) ?? false;
  }

  reset(): void {
    this.logger.info('Resetting state manager');

    const previousState = this.currentState;
    this.currentState = ComscoreState.INITIALIZED;
    this.currentContentMetadata = this.context.metadata; // Restaurar metadatos originales
    this.buffering = false;
    this.ended = false;
    this.inAd = false;
    this.currentAdOffset = 0.0;

    this.notifyStateChange(previousState, this.currentState, 'reset');
  }

  /*
   *  Gestión de listeners
   *
   */

  addStateChangeListener(listener: StateChangeListener): void {
    if (!this.stateChangeListeners.includes(listener)) {
      this.stateChangeListeners.push(listener);
      this.logger.debug('State change listener added');
    }
  }

  removeStateChangeListener(listener: StateChangeListener): void {
    const index = this.stateChangeListeners.indexOf(listener);
    if (index > -1) {
      this.stateChangeListeners.splice(index, 1);
      this.logger.debug('State change listener removed');
    }
  }

  /*
   *  Métodos privados
   *
   */

  private performTransition(targetState: ComscoreState, reason?: string): void {
    const fromState = this.currentState;

    // Validar transición si está habilitado
    if (this.config.validateTransitions && !this.canTransitionTo(targetState)) {
      this.logger.error('Invalid state transition attempted', {
        from: fromState,
        to: targetState,
        reason,
      });
      return;
    }

    // Realizar la transición
    this.currentState = targetState;

    // Log de la transición
    this.logger.info('State transition', {
      from: fromState,
      to: targetState,
      reason: reason || 'unspecified',
    });

    // Notificar a listeners
    this.notifyStateChange(fromState, targetState, reason);
  }

  private notifyStateChange(
    fromState: ComscoreState,
    toState: ComscoreState,
    reason?: string
  ): void {
    this.stateChangeListeners.forEach((listener) => {
      try {
        listener.onStateChanged(fromState, toState, reason);
      } catch (error) {
        this.logger.error('Error notifying state change listener', error);
      }
    });
  }

  /*
   *  Métodos de debugging y diagnóstico
   *
   */

  getStateSnapshot(): StateSnapshot {
    return {
      currentState: this.currentState,
      currentContentMetadata: this.currentContentMetadata,
      buffering: this.buffering,
      ended: this.ended,
      inAd: this.inAd,
      currentAdOffset: this.currentAdOffset,
      instanceId: this.context.instanceId,
      timestamp: Date.now(),
    };
  }

  logCurrentState(): void {
    this.logger.info('Current state snapshot', this.getStateSnapshot());
  }

  isInPlayingState(): boolean {
    return (
      this.currentState === ComscoreState.VIDEO ||
      this.currentState === ComscoreState.ADVERTISEMENT
    );
  }

  isInPausedState(): boolean {
    return (
      this.currentState === ComscoreState.PAUSED_VIDEO ||
      this.currentState === ComscoreState.PAUSED_AD
    );
  }

  isInActiveState(): boolean {
    return this.isInPlayingState() || this.isInPausedState();
  }
}
