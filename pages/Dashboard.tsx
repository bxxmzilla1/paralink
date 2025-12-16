import React, { useState } from 'react';
import { Link, Clipboard, ArrowRight, ShieldCheck, Zap, Globe, Plus, Trash2 } from 'lucide-react';
import { encodePayload, LinkPayload, generateParaLink } from '../utils/payload';

/**
 * Dashboard Page (Creator Mode)
 * 
 * Creator-friendly interface for generating:
 * - Direct links (single destination)
 * - Bio pages (multiple links)
 * 
 * All link data is encoded in the URL (stateless architecture).
 */
const Dashboard: React.FC = () => {
  const [tab, setTab] = useState<'direct' | 'bio'>('direct');
  
  // Direct link state
  const [directUrl, setDirectUrl] = useState('');
  const [directTitle, setDirectTitle] = useState('');
  
  // Bio page state
  const [bioName, setBioName] = useState('');
  const [bioLinks, setBioLinks] = useState<{title: string, url: string}[]>([
    {title: '', url: ''}
  ]);
  
  // Generated link state
  const [generatedLink, setGeneratedLink] = useState('');
  const [copied, setCopied] = useState(false);

  /**
   * Generates a ParaLink URL from the current form data
   */
  const handleGenerate = () => {
    let data: LinkPayload;

    if (tab === 'direct') {
      if (!directUrl.trim()) return;
      
      let u = directUrl.trim();
      if (!/^https?:\/\//i.test(u)) {
        u = 'https://' + u;
      }
      
      data = {
        mode: 'direct',
        url: u,
        title: directTitle.trim() || 'Content'
      };
    } else {
      // Bio mode
      const validLinks = bioLinks.filter(l => l.url.trim() && l.title.trim());
      if (validLinks.length === 0) return;
      
      data = {
        mode: 'bio',
        profileName: bioName.trim() || 'My Links',
        links: validLinks.map(l => {
          let u = l.url.trim();
          if (!/^https?:\/\//i.test(u)) {
            u = 'https://' + u;
          }
          return { 
            title: l.title.trim(), 
            url: u 
          };
        })
      };
    }

    const link = generateParaLink(data);
    setGeneratedLink(link);
    setCopied(false);
  };

  const copyToClipboard = () => {
    if (!generatedLink) return;
    navigator.clipboard.writeText(generatedLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-brand-teal rounded-lg flex items-center justify-center">
              <Link className="text-white w-5 h-5" />
            </div>
            <span className="font-bold text-xl tracking-tight text-gray-900">ParaLink</span>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-4 py-12">
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-3">
            Create Smart Links
          </h1>
          <p className="text-gray-600">
            Generate links that reliably open in your browser, even from social media apps.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex justify-center mb-8">
          <div className="bg-white p-1 rounded-xl shadow-sm border border-gray-200 inline-flex">
            <button 
              onClick={() => {
                setTab('direct');
                setGeneratedLink('');
              }}
              className={`px-6 py-2 rounded-lg text-sm font-semibold transition-all ${
                tab === 'direct' 
                  ? 'bg-black text-white shadow-md' 
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              Direct Link
            </button>
            <button 
              onClick={() => {
                setTab('bio');
                setGeneratedLink('');
              }}
              className={`px-6 py-2 rounded-lg text-sm font-semibold transition-all ${
                tab === 'bio' 
                  ? 'bg-black text-white shadow-md' 
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              Bio Page
            </button>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="bg-gray-900 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center space-x-2 text-white">
              <Zap className="w-4 h-4 text-brand-teal" />
              <span className="font-medium text-sm">
                {tab === 'direct' ? 'Single Redirect' : 'Bio Profile'} Generator
              </span>
            </div>
          </div>
          
          <div className="p-6 md:p-8">
            <div className="space-y-6">
              
              {/* Direct Mode Inputs */}
              {tab === 'direct' && (
                <>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      Destination URL
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Globe className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        placeholder="https://example.com"
                        value={directUrl}
                        onChange={(e) => setDirectUrl(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-teal outline-none transition-all"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      Link Title (optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Exclusive Content"
                      value={directTitle}
                      onChange={(e) => setDirectTitle(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-teal outline-none transition-all"
                    />
                  </div>
                </>
              )}

              {/* Bio Mode Inputs */}
              {tab === 'bio' && (
                <>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      Profile Name
                    </label>
                    <input
                      type="text"
                      placeholder="@username or Your Name"
                      value={bioName}
                      onChange={(e) => setBioName(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-teal outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="block text-sm font-semibold text-gray-700">
                      Links
                    </label>
                    {bioLinks.map((link, idx) => (
                      <div key={idx} className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Title"
                          value={link.title}
                          onChange={(e) => {
                            const newLinks = [...bioLinks];
                            newLinks[idx].title = e.target.value;
                            setBioLinks(newLinks);
                          }}
                          className="w-1/3 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-teal outline-none"
                        />
                        <input
                          type="text"
                          placeholder="URL"
                          value={link.url}
                          onChange={(e) => {
                            const newLinks = [...bioLinks];
                            newLinks[idx].url = e.target.value;
                            setBioLinks(newLinks);
                          }}
                          className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-teal outline-none"
                        />
                        {bioLinks.length > 1 && (
                          <button 
                            onClick={() => setBioLinks(bioLinks.filter((_, i) => i !== idx))}
                            className="p-2 text-red-400 hover:text-red-600 transition-colors"
                            aria-label="Remove link"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                    <button 
                      onClick={() => setBioLinks([...bioLinks, {title: '', url: ''}])}
                      className="text-sm text-brand-teal font-medium flex items-center hover:underline"
                    >
                      <Plus className="w-4 h-4 mr-1" /> Add another link
                    </button>
                  </div>
                </>
              )}

              {/* Generate Button */}
              <button
                onClick={handleGenerate}
                className="w-full py-4 px-6 rounded-xl text-white font-bold text-lg flex items-center justify-center space-x-2 transition-all bg-black hover:bg-gray-800 shadow-lg active:scale-[0.99]"
              >
                <span>Generate Smart Link</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>

            {/* Generated Link Display */}
            {generatedLink && (
              <div className="mt-8 pt-8 border-t border-gray-100 animate-fadeIn">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-semibold text-gray-700">
                    Generated Link
                  </label>
                  <span className="text-xs text-green-600 font-medium bg-green-50 px-2 py-1 rounded-full">
                    Ready
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-600 font-mono text-xs md:text-sm truncate">
                    {generatedLink}
                  </div>
                  <button
                    onClick={copyToClipboard}
                    className="flex-shrink-0 bg-brand-teal text-white p-3 rounded-xl hover:bg-teal-600 transition-colors shadow-md"
                    aria-label="Copy link"
                  >
                    {copied ? (
                      <ShieldCheck className="w-5 h-5" />
                    ) : (
                      <Clipboard className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
