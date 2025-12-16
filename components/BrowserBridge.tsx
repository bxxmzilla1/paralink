import React from 'react';
import { ArrowRight } from 'lucide-react';

interface BrowserBridgeProps {
  onOpen: () => void;
}

/**
 * BrowserBridge Component (Unified Browser Transition Confirmation)
 * 
 * Shown when a user is in an in-app browser and needs to transition
 * to their system browser (Safari or Chrome).
 * 
 * This component is used for BOTH:
 * - Direct link destinations
 * - Landing page outbound links
 * 
 * The button tap counts as user intent and opens the system browser.
 */
export const BrowserBridge: React.FC<BrowserBridgeProps> = ({ onOpen }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8 text-center">
        {/* Primary CTA Button */}
        <button
          onClick={onOpen}
          onTouchEnd={(e) => {
            e.preventDefault();
            onOpen();
          }}
          className="w-full py-5 bg-black text-white font-bold text-lg rounded-xl shadow-lg hover:bg-gray-800 active:scale-[0.98] transition-all flex items-center justify-center space-x-2 mb-3"
        >
          <span>Continue</span>
          <ArrowRight className="w-5 h-5" />
        </button>

        {/* Fine print */}
        <p className="text-xs text-gray-500">
          Opens in your browser
        </p>
      </div>
    </div>
  );
};
