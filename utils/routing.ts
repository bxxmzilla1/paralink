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
 * Checks if the current in-app browser is a Meta app (Instagram, Facebook, Messenger, Threads)
 */
const isMetaApp = (appName: string): boolean => {
  const normalized = appName.toLowerCase();
  return normalized === 'instagram' || 
         normalized === 'facebook' || 
         normalized === 'fbav' || 
         normalized === 'fban' ||
         normalized.includes('messenger') ||
         normalized.includes('threads');
};

/**
 * Attempts to open a URL in the system browser
 * This function should only be called after user interaction (button tap)
 * 
 * STABILITY: Platform-specific behavior - do not unify or experiment
 */
export const openInSystemBrowser = (url: string): void => {
  const env = detectEnvironment();
  
  // ANDROID: Intent-based navigation for ALL in-app browsers
  // CRITICAL: Must use intent:// to force Chrome, never rely on anchor-only
  if (env.os === OSType.ANDROID && env.isInAppBrowser) {
    const intent = generateAndroidIntent(url);
    window.location.href = intent;
    
    // Fallback after delay
    setTimeout(() => {
      window.open(url, '_blank');
    }, 2500);
    return;
  }
  
  // iOS: Anchor-based navigation only (no window.location.href, no window.open for in-app)
  if (env.os === OSType.IOS && env.isInAppBrowser) {
    // Create anchor element dynamically
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.target = '_blank';
    anchor.rel = 'noopener noreferrer';
    anchor.style.display = 'none';
    
    // Append to body temporarily
    document.body.appendChild(anchor);
    
    // Trigger click directly inside user gesture handler (no delays)
    anchor.click();
    
    // Clean up after a short delay
    setTimeout(() => {
      if (document.body.contains(anchor)) {
        document.body.removeChild(anchor);
      }
    }, 100);
    return;
  }
  
  // Real browsers: standard window.open
  if (env.os === OSType.IOS) {
    // iOS in real browser
    window.open(url, '_blank', 'noopener,noreferrer');
  } else {
    // Desktop or other
    window.open(url, '_blank', 'noopener,noreferrer');
  }
};

/**
 * Redirects immediately (for real browsers)
 */
export const redirectImmediately = (url: string): void => {
  window.location.href = url;
};
