import React from 'react';
import { Shield, HardDrive, Map, ArrowLeft, Trash2 } from 'lucide-react';

interface PrivacyViewProps {
  onBack: () => void;
  onClearAll: () => void;
}

export const PrivacyView: React.FC<PrivacyViewProps> = ({ onBack, onClearAll }) => {
  return (
    <div className="max-w-2xl mx-auto py-8 px-6 text-[#262D2A]">
      <button
        onClick={onBack}
        className="inline-flex items-center space-x-1.5 text-xs text-[#626B65] hover:text-[#262D2A] mb-6 px-2.5 py-1 rounded-full bg-[#EEECE5]/80 hover:bg-[#EEECE5] transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to Atlas</span>
      </button>

      <div className="flex items-center space-x-2 text-xs font-medium uppercase tracking-wider text-[#75523B]">
        <Shield className="w-4 h-4" />
        <span>Privacy & Local Storage</span>
      </div>

      <h1 className="font-sans text-3xl font-medium text-[#262D2A] mt-1">
        Your data, on this browser.
      </h1>

      <p className="text-sm text-[#626B65] mt-2 leading-relaxed">
        Little Atlas is intentionally designed as a calm, personal, local-first travel archive.
        Your photos and notes are meant for you, not an algorithm.
      </p>

      <div className="mt-8 space-y-4 text-xs leading-relaxed text-[#626B65]">
        <div className="p-4 rounded-xl bg-[#FFFFFF] border border-[#D8D7CE] flex items-start space-x-3.5">
          <HardDrive className="w-5 h-5 text-[#75523B] shrink-0 mt-0.5" />
          <div>
            <h3 className="font-medium text-sm text-[#262D2A]">Local-First in Your Browser</h3>
            <p className="mt-1 text-[#626B65]">
              Your saved photos, dates and memory notes are stored
              locally inside your browser’s storage (IndexedDB / localStorage). They are not uploaded to a
              remote database server or cloud profile by default.
            </p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[#FFFFFF] border border-[#D8D7CE] flex items-start space-x-3.5">
          <Map className="w-5 h-5 text-[#75523B] shrink-0 mt-0.5" />
          <div>
            <h3 className="font-medium text-sm text-[#262D2A]">What uses the internet</h3>
            <p className="mt-1 text-[#626B65]">
              The globe and built-in destination search run in your browser after the app loads.
              AI trip planning sends the destination and preferences you enter to our server and AI provider.
              Do not include private information in trip-planning prompts. Saved memories are not automatically sent to the planner.
            </p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[#FFFFFF] border border-[#D8D7CE] flex items-start space-x-3.5">
          <Trash2 className="w-5 h-5 text-[#75523B] shrink-0 mt-0.5" />
          <div>
            <h3 className="font-medium text-sm text-[#262D2A]">Clearing Browser Data</h3>
            <p className="mt-1 text-[#626B65]">
              Because your memories reside in your browser, clearing your browser's site cache or
              storage will erase your local atlas. You can also reset your data at any time below.
            </p>
            <button
              onClick={onClearAll}
              className="mt-3 inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-[#F3DCD5] hover:bg-[#EBCDC4] text-[#8F3B25] font-medium text-xs transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear all Little Atlas data from this browser</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
