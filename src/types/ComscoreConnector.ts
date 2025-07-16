import type { ComscoreMetadata, ComscoreLabels } from '../types';

export interface IComscoreConnector {
  getInstanceId(): number;
  update(metadata: ComscoreMetadata): void;
  setPersistentLabels(labels: ComscoreLabels): void;
  setPersistentLabel(label: string, value: string): void;
  setMetadata(metadata: ComscoreMetadata): void;
  notifyEnd(): void;
  notifyPause(): void;
  notifyPlay(): void;
  createPlaybackSession(): void;
  setDvrWindowLength(length: number): void;
  notifyBufferStop(): void;
  notifySeekStart(): void;
  startFromDvrWindowOffset(offset: number): void;
  startFromPosition(position: number): void;
  notifyBufferStart(): void;
  notifyChangePlaybackRate(rate: number): void;
  destroy(): void;
}
