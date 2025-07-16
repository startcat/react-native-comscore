export enum ComscoreUserConsent {
  denied = '0',
  granted = '1',
  unknown = '-1',
}

export enum ComscoreUsagePropertiesAutoUpdateMode {
  foregroundOnly = 'foregroundOnly',
  foregroundAndBackground = 'foregroundAndBackground',
  disabled = 'disabled',
}

export interface ComscoreConfiguration {
  publisherId: string; // Also known as the c2 value
  applicationName: string;
  userConsent: ComscoreUserConsent;
  usagePropertiesAutoUpdateMode?: ComscoreUsagePropertiesAutoUpdateMode; // Defaults to foregroundOnly if none is specified. If your app has some background experience, use foregroundAndBackground.
  debug?: boolean;
}
