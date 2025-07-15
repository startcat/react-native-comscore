import type { ComscoreConfiguration } from './ComscoreConfiguration';
import type { ComscoreMetadata } from './ComscoreMetadata';

export interface ComscoreLabels {
  [key: string]: string;
}

export interface ComscoreModule {
  // Basic Analytics (Global)
  trackView(view: string): void;
  trackEvent(action: string, category: string): void;
  updatePersistentLabels(
    publisherId: string,
    fpid: string,
    fpit: string,
    fpdm: string,
    fpdt: string
  ): void;
  setPersistentLabel(
    publisherId: string,
    labelName: string,
    labelValue: string
  ): void;
  notifyUxActive(): void;
  notifyUxInactive(): void;

  // Streaming Analytics (Por instancias)
  initializeStreaming(
    tag: number,
    comscoreMetadata: ComscoreMetadata,
    comscoreConfig: ComscoreConfiguration
  ): void;
  updateStreaming(tag: number, comscoreMetadata: ComscoreMetadata): void;
  setPersistentLabelsStreaming(tag: number, labels: ComscoreLabels): void;
  setPersistentLabelStreaming(tag: number, label: string, value: string): void;
  setMetadata(tag: number, metadata: ComscoreMetadata): void;

  // Streaming Playback Events
  notifyEnd(tag: number): void;
  notifyPause(tag: number): void;
  notifyPlay(tag: number): void;
  createPlaybackSession(tag: number): void;
  setDvrWindowLength(tag: number, length: number): void;
  notifyBufferStop(tag: number): void;
  notifySeekStart(tag: number): void;
  startFromDvrWindowOffset(tag: number, offset: number): void;
  startFromPosition(tag: number, position: number): void;
  notifyBufferStart(tag: number): void;
  notifyChangePlaybackRate(tag: number, rate: number): void;
  destroyStreaming(tag: number): void;
}
