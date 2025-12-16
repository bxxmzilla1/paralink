import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { decodePayload, LinkPayload } from '../utils/payload';
import { shouldShowBrowserTransition } from '../utils/routing';
import { redirectImmediately, openInSystemBrowser } from '../utils/routing';
import { BrowserBridge } from '../components/BrowserBridge';
import { BioPage } from '../components/BioPage';
import { Lock } from 'lucide-react';

/**
 * Viewer Page
 * 
 * Entry point for visitors opening ParaLink URLs.
 * Handles:
 * - Payload decoding from URL
 * - Environment detection
 * - Unified browser transition flow for all outbound links
 */
const Viewer: React.FC = () => {
  const location = useLocation();
  const [payload, setPayload] = useState<LinkPayload | null>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [showBridge, setShowBridge] = useState(false);
  const [bridgeTargetUrl, setBridgeTargetUrl] = useState<string>('');

  // Decode payload from URL
  useEffect(() => {
    try {
      // Extract payload from hash: #/go?p=...
      const hash = location.hash;
      
      if (import.meta.env.DEV) {
        console.log('[Viewer] Parsing hash:', hash);
      }
      
      // Check if hash contains the payload parameter
      if (!hash.includes('?p=')) {
        // No payload parameter found
        if (import.meta.env.DEV) {
          console.error('[Viewer] Hash does not contain ?p= parameter. Hash:', hash);
        }
        setStatus('error');
        return;
      }
      
      // Extract query string from hash (everything after the ?)
      const queryIndex = hash.indexOf('?');
      const queryString = hash.substring(queryIndex + 1);
      
      if (import.meta.env.DEV) {
        console.log('[Viewer] Query string:', queryString);
      }
      
      // Parse query parameters
      const params = new URLSearchParams(queryString);
      const encoded = params.get('p');
      
      if (!encoded) {
        // Payload parameter is missing
        if (import.meta.env.DEV) {
          console.error('[Viewer] Payload parameter "p" is missing from URL. Query string:', queryString);
        }
        setStatus('error');
        return;
      }
      
      if (import.meta.env.DEV) {
        console.log('[Viewer] Encoded payload length:', encoded.length);
      }
      
      // Decode the payload
      const decoded = decodePayload(encoded);
      
      if (!decoded) {
        // Decoding failed (base64 or JSON parse error)
        if (import.meta.env.DEV) {
          console.error('[Viewer] Failed to decode payload. Encoded value (first 50 chars):', encoded.substring(0, 50));
        }
        setStatus('error');
        return;
      }
      
      if (import.meta.env.DEV) {
        console.log('[Viewer] Decoded payload:', decoded);
      }
      
      // Validate payload structure - only check essential fields
      // For direct mode: must have mode === "direct" AND url is a string
      if (decoded.mode === 'direct') {
        if (typeof decoded.url !== 'string' || decoded.url.trim() === '') {
          if (import.meta.env.DEV) {
            console.error('[Viewer] Direct mode payload missing or invalid URL. Decoded:', decoded);
          }
          setStatus('error');
          return;
        }
      } else if (decoded.mode === 'bio') {
        // For bio mode: must have links array
        if (!Array.isArray(decoded.links) || decoded.links.length === 0) {
          if (import.meta.env.DEV) {
            console.error('[Viewer] Bio mode payload missing or invalid links. Decoded:', decoded);
          }
          setStatus('error');
          return;
        }
      } else {
        // Invalid mode
        if (import.meta.env.DEV) {
          console.error('[Viewer] Invalid payload mode. Must be "direct" or "bio". Decoded:', decoded);
        }
        setStatus('error');
        return;
      }
      
      // Payload is valid - set it and handle routing
      setPayload(decoded);
      setStatus('ready');
      
      if (import.meta.env.DEV) {
        console.log('[Viewer] Payload validated successfully. Mode:', decoded.mode);
      }
      
      // Handle direct links
      if (decoded.mode === 'direct' && decoded.url) {
        const needsTransition = shouldShowBrowserTransition();
        if (import.meta.env.DEV) {
          console.log('[Viewer] Direct link. Needs transition:', needsTransition, 'URL:', decoded.url);
        }
        
        if (needsTransition) {
          // In-app browser: show transition confirmation
          setBridgeTargetUrl(decoded.url);
          setShowBridge(true);
        } else {
          // Real browser: redirect immediately
          redirectImmediately(decoded.url);
        }
      }
    } catch (error) {
      // Only log in development
      if (import.meta.env.DEV) {
        console.error('[Viewer] Error decoding payload:', error);
      }
      setStatus('error');
    }
  }, [location]);

  /**
   * Unified handler for opening any outbound link
   * Used by both direct links and bio page links
   */
  const handleLinkOpen = (url: string) => {
    if (shouldShowBrowserTransition()) {
      // In-app browser: show transition confirmation
      setBridgeTargetUrl(url);
      setShowBridge(true);
    } else {
      // Real browser: redirect immediately
      redirectImmediately(url);
    }
  };

  /**
   * Handler for the browser transition confirmation button
   * Opens the target URL in the system browser
   */
  const handleBridgeConfirm = () => {
    if (bridgeTargetUrl) {
      openInSystemBrowser(bridgeTargetUrl);
    }
  };

  // Loading state
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-brand-teal border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-gray-600 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (status === 'error' || !payload) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
        <div className="bg-white p-8 rounded-2xl shadow-lg max-w-sm w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Invalid Link</h2>
          <p className="text-gray-600 text-sm">
            This link appears to be invalid or expired.
          </p>
        </div>
      </div>
    );
  }

  // Show browser transition confirmation when needed
  if (showBridge && bridgeTargetUrl) {
    return (
      <BrowserBridge onOpen={handleBridgeConfirm} />
    );
  }

  // Bio page
  if (payload.mode === 'bio' && payload.links && payload.links.length > 0) {
    return (
      <BioPage
        profileName={payload.profileName || 'My Links'}
        links={payload.links}
        onLinkClick={handleLinkOpen}
      />
    );
  }

  // Direct link fallback (shouldn't normally reach here, but just in case)
  if (payload.mode === 'direct' && payload.url) {
    // If we're here, we're in a real browser and should have redirected
    // But if something went wrong, show a button
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
        <div className="bg-white p-8 rounded-2xl shadow-lg max-w-sm w-full text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-gray-400" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-6">
            {payload.title || 'Open Link'}
          </h2>
          <button
            onClick={() => handleLinkOpen(payload.url!)}
            className="w-full py-4 bg-brand-teal text-white font-bold rounded-xl shadow-lg hover:bg-teal-600 transition"
          >
            Click to Open
          </button>
        </div>
      </div>
    );
  }

  // Fallback
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <p className="text-gray-600">Unable to display this link.</p>
      </div>
    </div>
  );
};

export default Viewer;
