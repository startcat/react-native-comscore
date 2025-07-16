import { type HandlerContext } from '../handlers/types';
import { type ComscoreStateManager } from './ComscoreStateManager';
import { type ComponentLogger } from '../logger/types';
import { ComscoreState } from '../types';

export class ComscoreApplicationHandler {
  private context: HandlerContext;
  private stateManager: ComscoreStateManager;
  private logger: ComponentLogger;

  private isApplicationInForeground = true;
  private isApplicationActive = true;
  private stateBeforeApplicationPause: ComscoreState | null = null;

  constructor(context: HandlerContext, stateManager: ComscoreStateManager) {
    this.context = context;
    this.stateManager = stateManager;
    this.logger = context.logger.forComponent('ApplicationHandler');
  }

  handleApplicationForeground(): void {
    if (__DEV__) {
      this.logger.info('🎯 handleApplicationForeground');
    }

    this.isApplicationInForeground = true;
    this.handleApplicationStateChange();
  }

  handleApplicationBackground(): void {
    if (__DEV__) {
      this.logger.info('🎯 handleApplicationBackground');
    }

    this.isApplicationInForeground = false;
    this.handleApplicationStateChange();
  }

  handleApplicationActive(): void {
    if (__DEV__) {
      this.logger.info('🎯 handleApplicationActive');
    }

    this.isApplicationActive = true;
    this.handleApplicationStateChange();
  }

  handleApplicationInactive(): void {
    if (__DEV__) {
      this.logger.info('🎯 handleApplicationInactive');
    }

    this.isApplicationActive = false;
    this.handleApplicationStateChange();
  }

  private shouldTrackInCurrentApplicationState(): boolean {
    if (
      this.context.configuration.usagePropertiesAutoUpdateMode ===
      'foregroundAndBackground'
    ) {
      return this.isApplicationActive;
    }

    if (
      this.context.configuration.usagePropertiesAutoUpdateMode === 'disabled'
    ) {
      return false;
    }

    return this.isApplicationInForeground && this.isApplicationActive;
  }

  private handleApplicationStateChange(): void {
    const shouldTrack = this.shouldTrackInCurrentApplicationState();
    const currentState = this.stateManager.getCurrentState();

    if (__DEV__) {
      this.logger.debug(
        `handleApplicationStateChange - Should track: ${shouldTrack}`
      );
      this.logger.debug(
        `Current state: ${currentState}, Previous state: ${this.stateBeforeApplicationPause}`
      );
    }

    if (!shouldTrack) {
      if (
        currentState === ComscoreState.VIDEO ||
        currentState === ComscoreState.ADVERTISEMENT
      ) {
        if (__DEV__) {
          this.logger.debug('Pausing tracking due to application state change');
        }
        this.stateBeforeApplicationPause = currentState;
        this.stateManager.transitionToPaused();
      }
    } else {
      if (this.stateBeforeApplicationPause !== null) {
        if (__DEV__) {
          this.logger.debug(
            'Resuming tracking due to application state change'
          );
        }

        if (
          this.stateBeforeApplicationPause === ComscoreState.VIDEO &&
          !this.stateManager.getInAd()
        ) {
          this.stateManager.transitionToVideo();
        } else if (
          this.stateBeforeApplicationPause === ComscoreState.ADVERTISEMENT &&
          this.stateManager.getInAd()
        ) {
          this.stateManager.transitionToAdvertisement();
        }

        this.stateBeforeApplicationPause = null;
      }
    }
  }
}
