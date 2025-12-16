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
 * Decoding order: decodeURIComponent → atob → JSON.parse
 */
export const decodePayload = (base64: string): LinkPayload | null => {
  if (!base64 || typeof base64 !== 'string') {
    return null;
  }
  
  try {
    // Step 1: URL decode (decodeURIComponent)
    const urlDecoded = decodeURIComponent(base64);
    
    // Step 2: Base64 decode (atob)
    const json = atob(urlDecoded);
    
    // Step 3: JSON parse
    return JSON.parse(json);
  } catch (e) {
    // Decoding failed - only log in development
    if (import.meta.env?.DEV) {
      console.error('Decoding failed:', e);
    }
    return null;
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

