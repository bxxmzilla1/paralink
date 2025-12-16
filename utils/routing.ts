/**
 * Routing Utilities
 * Handles platform-specific link opening strategies
 */

import { detectEnvironment, OSType, isRealBrowser } from './environment';

/**
 * Generates an Android Intent URL to open in Chrome
 */
export const generateAndroidIntent = (destination: string): string => {
  const cleanDest = destination.trim();
  const encodedDest = encodeURIComponent(cleanDest);
  const schemeUrl = cleanDest.replace(/^https?:\/\//, '');
  
  return `intent://${schemeUrl}#Intent;scheme=https;package=com.android.chrome;S.browser_fallback_url=${encodedDest};end;`;
};

/**
 * Determines if the browser transition confirmation should be shown
 * Returns true if user is in an in-app browser and needs to transition
 */
export const shouldShowBrowserTransition = (): boolean => {
  const env = detectEnvironment();
  
  // Skip if already in a real browser
  if (isRealBrowser()) {
    return false;
  }
  
  // Show transition for in-app browsers
  return env.isInAppBrowser;
};

/**
 * Attempts to open a URL in the system browser
 * This function should only be called after user interaction (button tap)
 */
export const openInSystemBrowser = (url: string): void => {
  const env = detectEnvironment();
  
  if (env.os === OSType.ANDROID && env.isInAppBrowser) {
    // Android: Use intent to open in Chrome
    const intent = generateAndroidIntent(url);
    window.location.href = intent;
    
    // Fallback after delay
    setTimeout(() => {
      window.open(url, '_blank');
    }, 2500);
  } else if (env.os === OSType.IOS) {
    // iOS: Use _system target (requires user interaction)
    window.open(url, '_system');
  } else {
    // Desktop or other: standard open
    window.open(url, '_blank');
  }
};

/**
 * Redirects immediately (for real browsers)
 */
export const redirectImmediately = (url: string): void => {
  window.location.href = url;
};
