import { NativeModules } from 'react-native';
import type {
  ComscoreConfiguration,
  ComscoreMetadata,
  ComscoreLabels,
} from './types';

const TAG = '[ComscoreConnector]';

export class ComscoreConnector {
  private instanceId: number;
  private static instanceCounter = 0;

  constructor(
    configuration: ComscoreConfiguration,
    metadata: ComscoreMetadata
  ) {
    // Generar un ID único para esta instancia
    this.instanceId = ++ComscoreConnector.instanceCounter;

    if (__DEV__) {
      console.log(`${TAG} Creating new instance with ID: ${this.instanceId}`);
    }

    // Inicializar la instancia nativa
    this.initializeStreaming(configuration, metadata);
  }

  /*
   *  Obtiene el ID de esta instancia del conector
   *
   */

  getInstanceId(): number {
    return this.instanceId;
  }

  // MARK: - Initialization & Configuration

  private initializeStreaming(
    configuration: ComscoreConfiguration,
    metadata: ComscoreMetadata
  ): void {
    if (!NativeModules.Comscore) return;

    if (__DEV__) {
      console.log(
        `${TAG} initializeStreaming`,
        this.instanceId,
        configuration,
        metadata
      );
    }

    NativeModules.Comscore.initializeStreaming(
      this.instanceId,
      metadata,
      configuration
    );
  }

  /*
   *  Actualiza los metadatos del contenido
   *
   */

  update(metadata: ComscoreMetadata): void {
    if (!NativeModules.Comscore) return;

    if (__DEV__) {
      console.log(`${TAG} update`, this.instanceId, metadata);
    }

    NativeModules.Comscore.updateStreaming(this.instanceId, metadata);
  }

  /*
   *  Establece múltiples etiquetas persistentes
   *
   */

  setPersistentLabels(labels: ComscoreLabels): void {
    if (!NativeModules.Comscore) return;

    if (__DEV__) {
      console.log(`${TAG} setPersistentLabels`, this.instanceId, labels);
    }

    NativeModules.Comscore.setPersistentLabelsStreaming(
      this.instanceId,
      labels
    );
  }

  /*
   *  Establece una etiqueta persistente individual
   *
   */

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

  /*
   *  Actualiza los metadatos de contenido
   *
   */

  setMetadata(metadata: ComscoreMetadata): void {
    if (!NativeModules.Comscore) return;

    if (__DEV__) {
      console.log(`${TAG} setMetadata`, this.instanceId, metadata);
    }

    NativeModules.Comscore.setMetadata(this.instanceId, metadata);
  }

  // MARK: - Playback Events

  /*
   *  Notifica el final de la reproducción
   *
   */

  notifyEnd(): void {
    if (!NativeModules.Comscore) return;

    if (__DEV__) {
      console.log(`${TAG} notifyEnd`, this.instanceId);
    }

    NativeModules.Comscore.notifyEnd(this.instanceId);
  }

  /*
   *  Notifica la pausa de la reproducción
   *
   */

  notifyPause(): void {
    if (!NativeModules.Comscore) return;

    if (__DEV__) {
      console.log(`${TAG} notifyPause`, this.instanceId);
    }

    NativeModules.Comscore.notifyPause(this.instanceId);
  }

  /*
   *  Notifica el inicio/reanudación de la reproducción
   *
   */

  notifyPlay(): void {
    if (!NativeModules.Comscore) return;

    if (__DEV__) {
      console.log(`${TAG} notifyPlay`, this.instanceId);
    }

    NativeModules.Comscore.notifyPlay(this.instanceId);
  }

  /*
   *  Crea una nueva sesión de reproducción
   *
   */

  createPlaybackSession(): void {
    if (!NativeModules.Comscore) return;

    if (__DEV__) {
      console.log(`${TAG} createPlaybackSession`, this.instanceId);
    }

    NativeModules.Comscore.createPlaybackSession(this.instanceId);
  }

  /*
   *  Establece la longitud de la ventana DVR (para contenido en vivo)
   *
   */

  setDvrWindowLength(length: number): void {
    if (!NativeModules.Comscore) return;

    if (__DEV__) {
      console.log(`${TAG} setDvrWindowLength`, this.instanceId, length);
    }

    NativeModules.Comscore.setDvrWindowLength(this.instanceId, length);
  }

  /*
   *  Notifica el final del buffering
   *
   */

  notifyBufferStop(): void {
    if (!NativeModules.Comscore) return;

    if (__DEV__) {
      console.log(`${TAG} notifyBufferStop`, this.instanceId);
    }

    NativeModules.Comscore.notifyBufferStop(this.instanceId);
  }

  /*
   *  Notifica el inicio de una operación de seek
   *
   */

  notifySeekStart(): void {
    if (!NativeModules.Comscore) return;

    if (__DEV__) {
      console.log(`${TAG} notifySeekStart`, this.instanceId);
    }

    NativeModules.Comscore.notifySeekStart(this.instanceId);
  }

  /*
   *  Inicia la reproducción desde un offset específico en la ventana DVR
   *
   */

  startFromDvrWindowOffset(offset: number): void {
    if (!NativeModules.Comscore) return;

    if (__DEV__) {
      console.log(`${TAG} startFromDvrWindowOffset`, this.instanceId, offset);
    }

    NativeModules.Comscore.startFromDvrWindowOffset(this.instanceId, offset);
  }

  /*
   *  Inicia la reproducción desde una posición específica
   *
   */

  startFromPosition(position: number): void {
    if (!NativeModules.Comscore) return;

    if (__DEV__) {
      console.log(`${TAG} startFromPosition`, this.instanceId, position);
    }

    NativeModules.Comscore.startFromPosition(this.instanceId, position);
  }

  /*
   *  Notifica el inicio del buffering
   *
   */

  notifyBufferStart(): void {
    if (!NativeModules.Comscore) return;

    if (__DEV__) {
      console.log(`${TAG} notifyBufferStart`, this.instanceId);
    }

    NativeModules.Comscore.notifyBufferStart(this.instanceId);
  }

  /*
   *  Notifica un cambio en la velocidad de reproducción
   *
   */

  notifyChangePlaybackRate(rate: number): void {
    if (!NativeModules.Comscore) return;

    if (__DEV__) {
      console.log(`${TAG} notifyChangePlaybackRate`, this.instanceId, rate);
    }

    NativeModules.Comscore.notifyChangePlaybackRate(this.instanceId, rate);
  }

  // MARK: - Lifecycle

  /*
   *  Destruye esta instancia del conector y libera recursos
   *
   */

  destroy(): void {
    if (!NativeModules.Comscore) return;

    if (__DEV__) {
      console.log(`${TAG} destroy`, this.instanceId);
    }

    NativeModules.Comscore.destroyStreaming(this.instanceId);
  }
}

export default ComscoreConnector;
