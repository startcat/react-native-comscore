import type { ComscoreConfiguration } from './types/ComscoreConfiguration';
import type { ComscoreMetadata } from './types/ComscoreMetadata';
import { NativeModules } from 'react-native';

const TAG = '[ComscoreConnector]';

export class ComscoreConnector {
  private instanceId: number;

  constructor(
    instanceId: number,
    comscoreMetadata: ComscoreMetadata,
    comscoreConfig: ComscoreConfiguration
  ) {
    console.log(`${TAG} constructor`, instanceId);
    this.instanceId = instanceId;

    if (!NativeModules.Comscore) {
      console.error('Comscore native module is not available');
      return;
    }

    try {
      NativeModules.Comscore.initializeStreaming(
        this.instanceId,
        comscoreMetadata,
        comscoreConfig
      );
      if (__DEV__) {
        console.log(`${TAG} initialized ✅`, this.instanceId);
      }
    } catch (error) {
      console.error(`${TAG} Error initializing Comscore:`, error);
    }
  }

  update(metadata: ComscoreMetadata): void {
    if (!NativeModules.Comscore) return;
    if (__DEV__) {
      console.log(`${TAG} update`, this.instanceId);
    }
    NativeModules.Comscore.updateStreaming(this.instanceId, metadata);
  }

  setPersistentLabel(label: string, value: string): void {
    if (!NativeModules.Comscore) return;
    if (__DEV__) {
      console.log(`${TAG} setPersistentLabel`, this.instanceId);
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
      console.log(`${TAG} setPersistentLabels`, this.instanceId);
    }
    NativeModules.Comscore.setPersistentLabelsStreaming(
      this.instanceId,
      labels
    );
  }

  setMetadata(metadata: ComscoreMetadata) {
    if (!NativeModules.Comscore) return;
    if (__DEV__) {
      console.log(`${TAG} setMetadata`, this.instanceId);
    }
    NativeModules.Comscore.setMetadata(this.instanceId, metadata);
  }

  notifyEnd() {
    if (!NativeModules.Comscore) return;
    if (__DEV__) {
      console.log(`${TAG} notifyEnd`, this.instanceId);
    }
    NativeModules.Comscore.notifyEnd(this.instanceId);
  }

  notifyPause() {
    if (!NativeModules.Comscore) return;
    if (__DEV__) {
      console.log(`${TAG} notifyPause`, this.instanceId);
    }
    NativeModules.Comscore.notifyPause(this.instanceId);
  }

  notifyPlay() {
    if (!NativeModules.Comscore) return;
    if (__DEV__) {
      console.log(`${TAG} notifyPlay`, this.instanceId);
    }
    NativeModules.Comscore.notifyPlay(this.instanceId);
  }

  createPlaybackSession() {
    if (!NativeModules.Comscore) return;
    if (__DEV__) {
      console.log(`${TAG} createPlaybackSession`, this.instanceId);
    }
    NativeModules.Comscore.createPlaybackSession(this.instanceId);
  }

  setDvrWindowLength(length: number) {
    if (!NativeModules.Comscore) return;
    if (__DEV__) {
      console.log(`${TAG} setPersistentLabels`, this.instanceId);
    }
    NativeModules.Comscore.setDvrWindowLength(this.instanceId, length);
  }

  notifyBufferStop() {
    if (!NativeModules.Comscore) return;
    if (__DEV__) {
      console.log(`${TAG} setPersistentLabels`, this.instanceId);
    }
    NativeModules.Comscore.notifyBufferStop(this.instanceId);
  }

  notifySeekStart() {
    if (!NativeModules.Comscore) return;
    if (__DEV__) {
      console.log(`${TAG} setPersistentLabels`, this.instanceId);
    }
    NativeModules.Comscore.notifySeekStart(this.instanceId);
  }

  startFromDvrWindowOffset(offset: number) {
    if (!NativeModules.Comscore) return;
    if (__DEV__) {
      console.log(`${TAG} setPersistentLabels`, this.instanceId);
    }
    NativeModules.Comscore.startFromDvrWindowOffset(this.instanceId, offset);
  }

  startFromPosition(position: number) {
    if (!NativeModules.Comscore) return;
    if (__DEV__) {
      console.log(`${TAG} setPersistentLabels`, this.instanceId);
    }
    NativeModules.Comscore.startFromPosition(this.instanceId, position);
  }

  notifyBufferStart() {
    if (!NativeModules.Comscore) return;
    if (__DEV__) {
      console.log(`${TAG} setPersistentLabels`, this.instanceId);
    }
    NativeModules.Comscore.notifyBufferStart(this.instanceId);
  }

  notifyChangePlaybackRate(rate: number) {
    if (!NativeModules.Comscore) return;
    if (__DEV__) {
      console.log(`${TAG} setPersistentLabels`, this.instanceId);
    }
    NativeModules.Comscore.notifyChangePlaybackRate(this.instanceId, rate);
  }

  destroy(): void {
    if (!NativeModules.Comscore) return;
    if (__DEV__) {
      console.log(`${TAG} destroy`, this.instanceId);
    }
    NativeModules.Comscore.destroyStreaming(this.instanceId || -1);
  }
}
