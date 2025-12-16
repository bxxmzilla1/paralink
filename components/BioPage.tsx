import React from 'react';
import { User, ExternalLink, ShieldCheck } from 'lucide-react';
import { LinkItem } from '../utils/payload';

interface BioPageProps {
  profileName: string;
  links: LinkItem[];
  onLinkClick: (url: string) => void;
}

/**
 * BioPage Component
 * 
 * Displays a landing page with multiple links.
 * Used when a creator generates a bio page with multiple destinations.
 */
export const BioPage: React.FC<BioPageProps> = ({ 
  profileName, 
  links, 
  onLinkClick 
}) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white flex flex-col items-center py-12 px-4">
      {/* Profile Avatar/Icon */}
      <div className="w-24 h-24 bg-brand-teal rounded-full flex items-center justify-center mb-6 shadow-2xl ring-4 ring-brand-teal/30">
        <User className="w-12 h-12 text-white" />
      </div>

      {/* Profile Name */}
      <h1 className="text-3xl font-bold mb-10 tracking-wide">{profileName}</h1>
      
      {/* Links List */}
      <div className="w-full max-w-md space-y-3">
        {links.map((link, i) => (
          <button
            key={i}
            onClick={() => onLinkClick(link.url)}
            onTouchEnd={(e) => {
              e.preventDefault();
              onLinkClick(link.url);
            }}
            className="w-full bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/10 text-white font-semibold py-4 px-6 rounded-xl transition-all transform active:scale-[0.98] flex items-center justify-between group"
          >
            <span className="text-left">{link.title}</span>
            <ExternalLink className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors flex-shrink-0 ml-3" />
          </button>
        ))}
      </div>
      
      {/* Footer */}
      <div className="mt-12 opacity-50 text-xs flex items-center space-x-1">
        <ShieldCheck className="w-4 h-4" />
        <span>Secure Link</span>
      </div>
    </div>
  );
};

