import { type ComscoreMetadata } from './ComscoreMetadata';

export interface PlayerPlugin {
  name: string;
  version: string;
  onStart: () => void;
  onPlay: () => void;
  onPause: () => void;
  onBuffering?: (value: boolean) => void;
  onSeek?: (value: number) => void;
  onProgress?: (value: number, duration?: number) => void;
  onChangeAudioIndex?: (index: number, label?: string) => void;
  onChangeSubtitleIndex?: (index: number, label?: string) => void;
  onNext?: () => void;
  onPrevious?: () => void;
  onEnd: () => void;
  destroy(): void;
}

export interface ComscorePluginInterface extends PlayerPlugin {
  update(metadata: ComscoreMetadata): void;
  setPersistentLabel(label: string, value: string): void;
  setPersistentLabels(labels: { [key: string]: string }): void;
  getInstanceId(): number;
}

export enum ComscoreState {
  INITIALIZED = 'initialized',
  STOPPED = 'stopped',
  PAUSED_AD = 'paused_ad',
  PAUSED_VIDEO = 'paused_video',
  ADVERTISEMENT = 'advertisement',
  VIDEO = 'video',
}
