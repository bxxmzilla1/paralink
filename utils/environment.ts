/**
 * Environment Detection Utilities
 * Detects OS, browser type, and in-app browser status
 * Used to determine appropriate routing behavior
 */

export enum OSType {
  ANDROID = 'ANDROID',
  IOS = 'IOS',
  DESKTOP = 'DESKTOP',
  UNKNOWN = 'UNKNOWN'
}

export enum BrowserType {
  REAL_BROWSER = 'REAL_BROWSER', // Safari, Chrome, Firefox, etc.
  IN_APP = 'IN_APP' // TikTok, Instagram, etc.
}

export interface EnvironmentInfo {
  os: OSType;
  browserType: BrowserType;
  isInAppBrowser: boolean;
  appName: string; // e.g., 'TikTok', 'Instagram', or 'Web'
}

// Regex to detect in-app browsers from user agent
// Covers: Instagram, Facebook, Messenger, TikTok, Threads, Snapchat, Twitter/X, and others
const IN_APP_REGEX = /(TikTok|Instagram|Twitter|Snapchat|Reddit|Telegram|Facebook|FBAV|FBAN|Messenger|Threads|Line|WhatsApp|LinkedIn|Twitch|musical_ly)/i;

/**
 * Detects the current environment (OS, browser type, in-app status)
 */
export const detectEnvironment = (): EnvironmentInfo => {
  const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
  
  // Detect OS
  let os: OSType = OSType.UNKNOWN;
  if (/android/i.test(userAgent)) {
    os = OSType.ANDROID;
  } else if (/iPad|iPhone|iPod/.test(userAgent) && !(window as any).MSStream) {
    os = OSType.IOS;
  } else {
    os = OSType.DESKTOP;
  }

  // Detect in-app browser
  const isInAppBrowser = IN_APP_REGEX.test(userAgent);
  const appMatch = userAgent.match(IN_APP_REGEX);
  const appName = appMatch ? appMatch[0] : 'Web';

  const browserType = isInAppBrowser ? BrowserType.IN_APP : BrowserType.REAL_BROWSER;

  return {
    os,
    browserType,
    isInAppBrowser,
    appName
  };
};

/**
 * Checks if the user is in a real browser (Safari, Chrome, etc.)
 */
export const isRealBrowser = (): boolean => {
  const env = detectEnvironment();
  return env.browserType === BrowserType.REAL_BROWSER;
};

/**
 * Checks if the user is in an in-app browser
 */
export const isInAppBrowser = (): boolean => {
  const env = detectEnvironment();
  return env.isInAppBrowser;
};

/**
 * Checks if the user is on iOS
 */
export const isIOS = (): boolean => {
  const env = detectEnvironment();
  return env.os === OSType.IOS;
};

/**
 * Checks if the user is on Android
 */
export const isAndroid = (): boolean => {
  const env = detectEnvironment();
  return env.os === OSType.ANDROID;
};

