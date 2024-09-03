import { NativeModules, Platform } from 'react-native';

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

export function multiply(a: number, b: number): Promise<number> {
  return Comscore.multiply(a, b);
}

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
) {
  Comscore.updatePersistentLabels(publisherId, fpid, fpit, fpdm, fpdt);
}
