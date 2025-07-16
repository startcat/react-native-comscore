import type { ComscoreMetadata } from '../../types';

export interface IComscoreConnectorAdapter {
  // Configuration & Metadata
  update(metadata: ComscoreMetadata): void;
  setMetadata(metadata: ComscoreMetadata): void;

  // Persistent Labels
  setPersistentLabel(label: string, value: string): void;
  setPersistentLabels(labels: { [key: string]: string }): void;

  // Playbook Events
  notifyPlay(): void;
  notifyPause(): void;
  notifyEnd(): void;
  createPlaybackSession(): void;

  // Buffering Events
  notifyBufferStart(): void;
  notifyBufferStop(): void;

  // Seeking Events
  notifySeekStart(): void;
  startFromPosition(position: number): void;
  startFromDvrWindowOffset(offset: number): void;

  // Live Streaming
  setDvrWindowLength(length: number): void;

  // Playback Rate
  notifyChangePlaybackRate(rate: number): void;

  // Lifecycle
  getInstanceId(): number;
  destroy(): void;
}
