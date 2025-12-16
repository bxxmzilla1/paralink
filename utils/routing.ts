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
 * Checks if the current in-app browser is Instagram or Facebook (including Messenger/Threads)
 */
const isInstagramOrFacebook = (appName: string): boolean => {
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
 */
export const openInSystemBrowser = (url: string): void => {
  const env = detectEnvironment();
  
  if (env.os === OSType.ANDROID && env.isInAppBrowser) {
    // Android: Use intent to open in Chrome
    // DO NOT MODIFY - Android behavior must remain unchanged
    const intent = generateAndroidIntent(url);
    window.location.href = intent;
    
    // Fallback after delay
    setTimeout(() => {
      window.open(url, '_blank');
    }, 2500);
  } else if (env.os === OSType.IOS && env.isInAppBrowser && isInstagramOrFacebook(env.appName)) {
    // iOS + Instagram/Facebook: Use dynamically created anchor with target="_self"
    // This allows Instagram/Facebook to control navigation and show native "You're leaving" dialog
    // Preferred path: target="_self" for top-level navigation
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.target = '_self'; // Preferred: allows IG/FB to control navigation
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
  } else if (env.os === OSType.IOS && env.isInAppBrowser) {
    // iOS + other in-app browsers: Use dynamically created anchor with target="_blank"
    // Fallback behavior for non-IG/FB in-app browsers
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.target = '_blank';
    anchor.rel = 'noopener noreferrer';
    anchor.style.display = 'none';
    
    // Append to body temporarily
    document.body.appendChild(anchor);
    
    // Trigger click (must be inside user gesture handler)
    anchor.click();
    
    // Clean up after a short delay
    setTimeout(() => {
      if (document.body.contains(anchor)) {
        document.body.removeChild(anchor);
      }
    }, 100);
  } else if (env.os === OSType.IOS) {
    // iOS in real browser: standard open
    window.open(url, '_blank', 'noopener,noreferrer');
  } else {
    // Desktop or other: standard open
    window.open(url, '_blank', 'noopener,noreferrer');
  }
};

/**
 * Redirects immediately (for real browsers)
 */
export const redirectImmediately = (url: string): void => {
  window.location.href = url;
};
