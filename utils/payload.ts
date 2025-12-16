/**
 * Payload Encoding/Decoding Utilities
 * Stateless link data encoding for URL-based routing
 */

export interface LinkItem {
  title: string;
  url: string;
}

export interface LinkPayload {
  mode: 'direct' | 'bio';
  // Direct Mode
  url?: string;
  title?: string;
  // Bio Mode
  profileName?: string;
  links?: LinkItem[];
}

/**
 * Encodes a LinkPayload to a base64 string for URL embedding
 */
export const encodePayload = (data: LinkPayload): string => {
  try {
    const json = JSON.stringify(data);
    return btoa(json);
  } catch (e) {
    console.error('Encoding failed', e);
    return '';
  }
};

/**
 * Decodes a base64 string back to a LinkPayload
 * Handles URL-encoded base64 strings (decodeURIComponent + atob)
 * URLSearchParams.get() may already decode the value, but we handle both cases
 */
export const decodePayload = (base64: string): LinkPayload | null => {
  if (!base64 || typeof base64 !== 'string') {
    return null;
  }
  
  // Try decoding directly first (URLSearchParams may have already decoded it)
  try {
    const json = atob(base64);
    return JSON.parse(json);
  } catch (e1) {
    // If that fails, try URL-decoding first (in case it's still URL-encoded)
    try {
      const urlDecoded = decodeURIComponent(base64);
      const json = atob(urlDecoded);
      return JSON.parse(json);
    } catch (e2) {
      // Both attempts failed
      // Only log in development
      if (import.meta.env?.DEV) {
        console.error('Decoding failed. Direct attempt:', e1, 'URL-decoded attempt:', e2);
      }
      return null;
    }
  }
};

/**
 * Gets the clean origin (protocol + host) for link generation
 */
export const getCleanOrigin = (): string => {
  let href = window.location.href;
  
  // Strip blob: prefix if present (common in previews)
  if (href.startsWith('blob:')) {
    href = href.slice(5);
  }
  
  try {
    const url = new URL(href);
    return url.origin;
  } catch (e) {
    // Fallback: simple string manipulation
    return href.split('?')[0].split('#')[0].replace(/\/$/, '');
  }
};

/**
 * Generates a ParaLink URL from a payload
 */
export const generateParaLink = (payload: LinkPayload): string => {
  const encoded = encodePayload(payload);
  const origin = getCleanOrigin();
  return `${origin}/#/go?p=${encoded}`;
};

