import type { ComscoreConfiguration, ComscoreMetadata } from '../types';
import { NativeModules } from 'react-native';

const TAG = '[ComscoreConnectorAdapter]';

export class ComscoreConnectorAdapter {
  constructor(
    private instanceId: number,
    comscoreMetadata: ComscoreMetadata,
    comscoreConfig: ComscoreConfiguration
  ) {
    if (!NativeModules.Comscore) {
      console.warn(`${TAG} ComScore native module not available`);
      return;
    }

    if (__DEV__) {
      console.log(
        `${TAG} Initializing instance ${this.instanceId}`,
        comscoreConfig,
        comscoreMetadata
      );
    }

    NativeModules.Comscore.initializeStreaming(
      this.instanceId,
      comscoreMetadata,
      comscoreConfig
    );
  }

  // MARK: - Configuration & Metadata

  update(metadata: ComscoreMetadata): void {
    if (!NativeModules.Comscore) return;

    if (__DEV__) {
      console.log(`${TAG} update`, this.instanceId, metadata);
    }

    NativeModules.Comscore.updateStreaming(this.instanceId, metadata);
  }

  setMetadata(metadata: ComscoreMetadata): void {
    if (!NativeModules.Comscore) return;

    if (__DEV__) {
      console.log(`${TAG} setMetadata`, this.instanceId, metadata);
    }

    NativeModules.Comscore.setMetadata(this.instanceId, metadata);
  }

  // MARK: - Persistent Labels

  setPersistentLabel(label: string, value: string): void {
    if (!NativeModules.Comscore) return;

    if (__DEV__) {
      console.log(`${TAG} setPersistentLabel`, this.instanceId, label, value);
    }

    NativeModules.Comscore.setPersistentLabelStreaming(
      this.instanceId,
      label,
      value
    );
  }

  setPersistentLabels(labels: { [key: string]: string }): void {
    if (!NativeModules.Comscore) return;

    if (__DEV__) {
      console.log(`${TAG} setPersistentLabels`, this.instanceId, labels);
    }

    NativeModules.Comscore.setPersistentLabelsStreaming(
      this.instanceId,
      labels
    );
  }

  // MARK: - Playback Events (NUEVOS - antes no estaban)

  /**
   * Notifica el inicio/reanudación de la reproducción
   */
  notifyPlay(): void {
    if (!NativeModules.Comscore) return;

    if (__DEV__) {
      console.log(`${TAG} notifyPlay`, this.instanceId);
    }

    NativeModules.Comscore.notifyPlay(this.instanceId);
  }

  /**
   * Notifica la pausa de la reproducción
   */
  notifyPause(): void {
    if (!NativeModules.Comscore) return;

    if (__DEV__) {
      console.log(`${TAG} notifyPause`, this.instanceId);
    }

    NativeModules.Comscore.notifyPause(this.instanceId);
  }

  /**
   * Notifica el final de la reproducción
   */
  notifyEnd(): void {
    if (!NativeModules.Comscore) return;

    if (__DEV__) {
      console.log(`${TAG} notifyEnd`, this.instanceId);
    }

    NativeModules.Comscore.notifyEnd(this.instanceId);
  }

  /**
   * Crea una nueva sesión de reproducción
   */
  createPlaybackSession(): void {
    if (!NativeModules.Comscore) return;

    if (__DEV__) {
      console.log(`${TAG} createPlaybackSession`, this.instanceId);
    }

    NativeModules.Comscore.createPlaybackSession(this.instanceId);
  }

  // MARK: - Buffering Events (NUEVOS)

  /**
   * Notifica el inicio del buffering
   */
  notifyBufferStart(): void {
    if (!NativeModules.Comscore) return;

    if (__DEV__) {
      console.log(`${TAG} notifyBufferStart`, this.instanceId);
    }

    NativeModules.Comscore.notifyBufferStart(this.instanceId);
  }

  /**
   * Notifica el final del buffering
   */
  notifyBufferStop(): void {
    if (!NativeModules.Comscore) return;

    if (__DEV__) {
      console.log(`${TAG} notifyBufferStop`, this.instanceId);
    }

    NativeModules.Comscore.notifyBufferStop(this.instanceId);
  }

  // MARK: - Seeking Events (NUEVOS)

  /**
   * Notifica el inicio de una operación de seek
   */
  notifySeekStart(): void {
    if (!NativeModules.Comscore) return;

    if (__DEV__) {
      console.log(`${TAG} notifySeekStart`, this.instanceId);
    }

    NativeModules.Comscore.notifySeekStart(this.instanceId);
  }

  /**
   * Inicia la reproducción desde una posición específica
   */
  startFromPosition(position: number): void {
    if (!NativeModules.Comscore) return;

    if (__DEV__) {
      console.log(`${TAG} startFromPosition`, this.instanceId, position);
    }

    NativeModules.Comscore.startFromPosition(this.instanceId, position);
  }

  /**
   * Inicia la reproducción desde un offset específico en la ventana DVR
   */
  startFromDvrWindowOffset(offset: number): void {
    if (!NativeModules.Comscore) return;

    if (__DEV__) {
      console.log(`${TAG} startFromDvrWindowOffset`, this.instanceId, offset);
    }

    NativeModules.Comscore.startFromDvrWindowOffset(this.instanceId, offset);
  }

  // MARK: - Live Streaming (NUEVOS)

  /**
   * Establece la longitud de la ventana DVR (para contenido en vivo)
   */
  setDvrWindowLength(length: number): void {
    if (!NativeModules.Comscore) return;

    if (__DEV__) {
      console.log(`${TAG} setDvrWindowLength`, this.instanceId, length);
    }

    NativeModules.Comscore.setDvrWindowLength(this.instanceId, length);
  }

  // MARK: - Playback Rate (NUEVO)

  /**
   * Notifica un cambio en la velocidad de reproducción
   */
  notifyChangePlaybackRate(rate: number): void {
    if (!NativeModules.Comscore) return;

    if (__DEV__) {
      console.log(`${TAG} notifyChangePlaybackRate`, this.instanceId, rate);
    }

    NativeModules.Comscore.notifyChangePlaybackRate(this.instanceId, rate);
  }

  // MARK: - Lifecycle

  /**
   * Obtiene el ID de esta instancia
   */
  getInstanceId(): number {
    return this.instanceId;
  }

  /**
   * Destruye esta instancia del conector y libera recursos
   */
  destroy(): void {
    if (!NativeModules.Comscore) return;

    if (__DEV__) {
      console.log(`${TAG} destroy`, this.instanceId);
    }

    NativeModules.Comscore.destroyStreaming(this.instanceId || -1);
  }
}
