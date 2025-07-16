import { type HandlerContext } from '../handlers/types';
import { ComscoreStateManager } from './ComscoreStateManager';
import { type ComponentLogger } from '../logger/types';
import { ComscoreState } from '../types';

export class ComscorePlaybackHandler {
  private context: HandlerContext;
  private stateManager: ComscoreStateManager;
  private logger: ComponentLogger;

  constructor(context: HandlerContext, stateManager: ComscoreStateManager) {
    this.context = context;
    this.stateManager = stateManager;
    this.logger = context.logger.forComponent('PlaybackHandler');
  }

  // Métodos de reproducción existentes
  handlePlay(): void {
    if (__DEV__) {
      this.logger.info('🔄 handlePlay');
    }

    if (this.stateManager.getEnded()) {
      this.handlePlayAfterEnd();
      return;
    }

    if (this.stateManager.getCurrentState() === ComscoreState.VIDEO) {
      this.context.connector.notifyPlay();
    }

    if (this.stateManager.getCurrentState() === ComscoreState.ADVERTISEMENT) {
      this.stateManager.transitionToAdvertisement();
    } else if (this.stateManager.getCurrentAdOffset() < 0.0) {
      if (__DEV__) {
        this.logger.info(
          '🔄 handlePlay - IGNORING PLAYING event after post-roll'
        );
      }
      return;
    } else {
      this.stateManager.transitionToVideo();
    }
  }

  handlePause(): void {
    if (__DEV__) {
      this.logger.info('🔄 handlePause');
    }
    this.stateManager.transitionToPaused();
  }

  handleStop(): void {
    if (__DEV__) {
      this.logger.info('🔄 handleStop');
    }
    this.stateManager.transitionToStopped();
  }

  handleSeek(currentTime?: number, duration?: number): void {
    if (__DEV__) {
      this.logger.info('🔄 handleSeek', { currentTime, duration });
    }

    this.context.connector.notifySeekStart();

    if (typeof currentTime === 'number') {
      if (typeof duration === 'number' && duration > 0) {
        // VOD content
        const newPosition = currentTime * 1000;
        this.context.connector.startFromPosition(newPosition);
      } else if (duration === 0 || isNaN(duration || 0)) {
        // Live content - fallback until DVR offset is implemented
        this.context.connector.startFromPosition(currentTime * 1000);
      }
    }
  }

  handleSeeking(): void {
    if (__DEV__) {
      this.logger.info('🔄 handleSeeking');
    }
    this.context.connector.notifySeekStart();
  }

  handleSeeked(currentTime?: number, duration?: number): void {
    if (__DEV__) {
      this.logger.info('🔄 handleSeeked', { currentTime, duration });
    }

    if (typeof currentTime === 'number') {
      if (typeof duration === 'number' && !isNaN(duration) && duration > 0) {
        // VOD content
        const newPosition = currentTime * 1000;
        this.context.connector.startFromPosition(newPosition);
      } else if (duration === 0 || isNaN(duration || 0)) {
        // Live content - use DVR window offset when available
        // For now, fallback to position-based seeking
        this.context.connector.startFromPosition(currentTime * 1000);
      }
    }
  }

  handleEnd(): void {
    if (__DEV__) {
      this.logger.info('🔄 handleEnd');
    }
    this.stateManager.transitionToStopped();
    this.stateManager.setEnded(true);
  }

  handleBuffering(isBuffering: boolean): void {
    if (__DEV__) {
      this.logger.info('🔄 handleBuffering', isBuffering);
    }

    const currentState = this.stateManager.getCurrentState();
    const inAd = this.stateManager.getInAd();

    if (isBuffering !== this.stateManager.getBuffering()) {
      if (isBuffering) {
        if (
          (currentState === ComscoreState.ADVERTISEMENT && inAd) ||
          (currentState === ComscoreState.VIDEO && !inAd)
        ) {
          this.stateManager.setBuffering(true);
          this.context.connector.notifyBufferStart();
        }
      } else {
        this.stateManager.setBuffering(false);
        this.context.connector.notifyBufferStop();
      }
    }
  }

  handleRateChange(rate: number): void {
    if (__DEV__) {
      this.logger.info('🔄 handleRateChange', rate);
    }
    this.context.connector.notifyChangePlaybackRate(rate);
  }

  handleProgress(currentTime: number, duration?: number): void {
    if (__DEV__) {
      this.logger.debug('🔄 handleProgress', { currentTime, duration });
    }

    // El progreso se puede usar para actualizar métricas internas
    // pero generalmente no requiere notificaciones directas al connector
    // a menos que sea necesario para casos específicos como live streams

    // Opcional: actualizar posición interna para cálculos de DVR en live streams
    if (typeof duration === 'number' && (duration === 0 || isNaN(duration))) {
      // Posible contenido live - podrías actualizar offsets aquí si es necesario
    }
  }

  // Métodos de metadatos y fuente
  handleSourceChange(): void {
    if (__DEV__) {
      this.logger.info('🔄 handleSourceChange');
    }

    // Reset del estado cuando cambia la fuente
    this.stateManager.reset();
    this.stateManager.setCurrentState(ComscoreState.INITIALIZED);
    this.stateManager.setCurrentContentMetadata(null);

    // Crear nueva sesión de reproducción
    this.context.connector.createPlaybackSession();
  }

  handleMetadataLoaded(): void {
    if (__DEV__) {
      this.logger.info('🔄 handleMetadataLoaded');
    }

    // Aquí se podría configurar información específica para live streams
    // como la longitud de la ventana DVR si está disponible

    // Ejemplo para contenido live (comentado porque requiere acceso al player):
    /*
    if (duration === 0 || isNaN(duration)) {
      // Detectar stream live
      if (seekableRanges && seekableRanges.length > 0) {
        const dvrWindowEnd = seekableRanges.end(seekableRanges.length - 1);
        const dvrWindowStart = seekableRanges.start(0);
        const dvrWindowLengthInSeconds = dvrWindowEnd - dvrWindowStart;
        
        if (dvrWindowLengthInSeconds > 0) {
          this.context.connector.setDvrWindowLength(dvrWindowLengthInSeconds * 1000);
        }
      }
    }
    */
  }

  handleDurationChange(duration?: number): void {
    if (__DEV__) {
      this.logger.info('🔄 handleDurationChange', { duration });
    }

    // Manejar cambios en la duración
    // Esto es especialmente importante para contenido live o cuando
    // se cargan metadatos que cambian la duración conocida

    if (typeof duration === 'number') {
      if (duration === 0 || isNaN(duration)) {
        // Posible contenido live
        if (__DEV__) {
          this.logger.info('🔄 handleDurationChange - detected live content');
        }
      } else {
        // Contenido VOD con duración conocida
        if (__DEV__) {
          this.logger.info(
            '🔄 handleDurationChange - VOD content duration:',
            duration
          );
        }
      }
    }
  }

  private handlePlayAfterEnd(): void {
    this.stateManager.setEnded(false);

    if (__DEV__) {
      this.logger.info(
        '🔄 handlePlay - PLAY event to start after an end event, create new session'
      );
    }

    this.context.connector.createPlaybackSession();
    this.stateManager.setCurrentAdOffset(0.0);
    // Set content metadata would be called here
  }
}
