import React from 'react';
import { Shield, HardDrive, Map, ArrowLeft, Trash2 } from 'lucide-react';

interface PrivacyViewProps {
  onBack: () => void;
  onClearAll: () => void;
}

export const PrivacyView: React.FC<PrivacyViewProps> = ({ onBack, onClearAll }) => {
  return (
    <div className="max-w-2xl mx-auto py-8 px-6 text-[#2C2723]">
      <button
        onClick={onBack}
        className="inline-flex items-center space-x-1.5 text-xs text-[#7A6F62] hover:text-[#2C2723] mb-6 px-2.5 py-1 rounded-full bg-[#EFE6D5]/80 hover:bg-[#E4D8C3] transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to Atlas</span>
      </button>

      <div className="flex items-center space-x-2 text-xs font-medium uppercase tracking-wider text-[#9E4F39]">
        <Shield className="w-4 h-4" />
        <span>Privacy & Local Storage</span>
      </div>

      <h1 className="font-serif text-3xl font-medium text-[#2B2621] mt-1">
        Your memories stay with you.
      </h1>

      <p className="text-sm text-[#73685C] mt-2 leading-relaxed">
        Little Atlas is intentionally designed as a calm, personal, local-first travel archive.
        Your photos and notes are meant for you, not an algorithm.
      </p>

      <div className="mt-8 space-y-4 text-xs leading-relaxed text-[#4A4035]">
        <div className="p-4 rounded-2xl bg-[#FAF6EE] border border-[#E0D5BF] flex items-start space-x-3.5">
          <HardDrive className="w-5 h-5 text-[#9E4F39] shrink-0 mt-0.5" />
          <div>
            <h3 className="font-medium text-sm text-[#2B2621]">Local-First in Your Browser</h3>
            <p className="mt-1 text-[#665B4F]">
              Your travel photos, EXIF metadata, and handwritten memory notes are processed and stored
              locally inside your browser’s storage (IndexedDB / localStorage). They are not uploaded to a
              remote database server or cloud profile by default.
            </p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#FAF6EE] border border-[#E0D5BF] flex items-start space-x-3.5">
          <Map className="w-5 h-5 text-[#B4674E] shrink-0 mt-0.5" />
          <div>
            <h3 className="font-medium text-sm text-[#2B2621]">Completely Offline-Ready & Standalone</h3>
            <p className="mt-1 text-[#665B4F]">
              Little Atlas includes an offline global destination atlas and a standalone illustrated globe
              that operate entirely locally without any external map APIs, tokens, or network requests.
              No private notes, photo pixels, or travel journals are ever sent to any third-party server.
            </p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#FAF6EE] border border-[#E0D5BF] flex items-start space-x-3.5">
          <Trash2 className="w-5 h-5 text-[#9E4F39] shrink-0 mt-0.5" />
          <div>
            <h3 className="font-medium text-sm text-[#2B2621]">Clearing Browser Data</h3>
            <p className="mt-1 text-[#665B4F]">
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
