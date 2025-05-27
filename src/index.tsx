import { NativeModules, Platform } from 'react-native';
import { type ComscoreMetadata } from './api/types/ComscoreMetadata';

export { ComscoreConnector } from './api/ComscoreConnector';
export { ComscorePlugin } from './api/ComscorePlugin';
export * from './api/types/ComscoreConfiguration';
export * from './api/types/ComscoreMetadata';

const LINKING_ERROR =
  `The package 'react-native-comscore' doesn't seem to be linked. Make sure: \n\n` +
  Platform.select({ ios: "- You have run 'pod install'\n", default: '' }) +
  '- You rebuilt the app after installing the package\n' +
  '- You are not using Expo Go\n';

const Comscore = NativeModules.Comscore
  ? NativeModules.Comscore
  : new Proxy(
      {},
      {
        get() {
          throw new Error(LINKING_ERROR);
        },
      }
    );

export function trackView(view: string): void {
  Comscore.trackView(view);
}

export function trackEvent(action: string, category: string): void {
  Comscore.trackEvent(action, category);
}

export function updatePersistentLabels(
  publisherId: String,
  fpid: String,
  fpit: String,
  fpdm: String,
  fpdt: String
): void {
  Comscore.updatePersistentLabels(publisherId, fpid, fpit, fpdm, fpdt);
}

export function setPersistentLabel(
  publisherId: String,
  labelName: String,
  labelValue: String
): void {
  Comscore.setPersistentLabel(publisherId, labelName, labelValue);
}

export function notifyUxActive(): void {
  Comscore.notifyUxActive();
}

export function notifyUxInactive(): void {
  Comscore.notifyUxInactive();
}

export function update(metadata: ComscoreMetadata): void {
  Comscore.update(metadata);
}
