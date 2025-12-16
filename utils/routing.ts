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
 * Opens a URL using a dynamically created anchor element
 * This method reliably triggers native "You're leaving the app" dialogs
 * on both iOS and Android in-app browsers
 */
const openWithAnchorElement = (url: string): void => {
  // Create anchor element
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.target = '_blank';
  anchor.rel = 'noopener noreferrer';
  
  // Append to body (required for reliable behavior)
  anchor.style.display = 'none';
  document.body.appendChild(anchor);
  
  // Trigger click (must be in user gesture handler - no delays)
  anchor.click();
  
  // Clean up after a short delay
  setTimeout(() => {
    if (document.body.contains(anchor)) {
      document.body.removeChild(anchor);
    }
  }, 100);
};

/**
 * Attempts to open a URL in the system browser
 * This function should only be called after user interaction (button tap)
 * 
 * For in-app browsers: Uses anchor element method to reliably trigger
 * native "You're leaving the app" dialogs on both iOS and Android
 */
export const openInSystemBrowser = (url: string): void => {
  const env = detectEnvironment();
  
  if (env.isInAppBrowser) {
    // ALL in-app browsers (iOS and Android): Use anchor element method
    // This reliably triggers native dialogs and system browser transitions
    // Works for: Instagram, Facebook, Messenger, TikTok, Threads, Snapchat, Twitter/X, etc.
    openWithAnchorElement(url);
  } else if (env.os === OSType.IOS) {
    // iOS in real browser: use anchor element for consistency
    openWithAnchorElement(url);
  } else {
    // Desktop or other real browsers: standard open
    window.open(url, '_blank', 'noopener,noreferrer');
  }
};

/**
 * Redirects immediately (for real browsers)
 */
export const redirectImmediately = (url: string): void => {
  window.location.href = url;
};
