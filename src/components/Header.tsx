import React from 'react';
import { Compass, BookOpen, Mail, Shield, Sparkles, Trash2, Plus } from 'lucide-react';
import { ActiveTab } from '../types';

interface HeaderProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  placesCount: number;
  isSample: boolean;
  onToggleSample: () => void;
  onClearData: () => void;
  onOpenAddModal?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onSelectTab,
  placesCount,
  isSample,
  onToggleSample,
  onClearData,
  onOpenAddModal,
}) => {
  return (
    <header className="relative z-30 flex items-center justify-between px-6 py-4 border-b border-[#E3D9C4] bg-[#F7F2E7]/90 backdrop-blur-md">
      {/* Brand & Editorial Title */}
      <div className="flex items-center space-x-3.5">
        <button
          onClick={() => onSelectTab('atlas')}
          className="text-left group flex items-center space-x-3 focus:outline-none"
        >
          <div className="w-10 h-10 rounded-full bg-[#EDE3D0] border border-[#D5C6AC] flex items-center justify-center text-[#B45A42] shadow-2xs transition-transform duration-200 group-hover:scale-105">
            <Compass className="w-5 h-5 stroke-[1.6]" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-serif text-2xl font-medium tracking-tight text-[#2B2621]">
                Little Atlas
              </span>
              {isSample && (
                <span className="text-[10px] font-sans uppercase tracking-widest px-2 py-0.5 rounded-full bg-[#E5D7C2] text-[#635341] font-semibold">
                  Sample Atlas
                </span>
              )}
            </div>
            <p className="text-xs font-serif italic text-[#786E64] hidden sm:block">
              Keep the places that became memories.
            </p>
          </div>
        </button>
      </div>

      {/* Editorial Navigation Tabs */}
      <nav className="flex items-center space-x-1.5 sm:space-x-2 bg-[#EBE1CF]/85 p-1 rounded-full border border-[#D8CCB5]">
        <button
          id="nav-tab-atlas"
          onClick={() => onSelectTab('atlas')}
          className={`flex items-center space-x-1.5 px-4 py-1.5 rounded-full text-xs font-medium transition-all duration-150 ${
            activeTab === 'atlas'
              ? 'bg-[#FCFAF5] text-[#2B2621] shadow-xs'
              : 'text-[#6B6053] hover:text-[#2B2621]'
          }`}
        >
          <Compass className="w-3.5 h-3.5" />
          <span>Atlas</span>
          {placesCount > 0 && (
            <span className="ml-1 text-[10px] px-1.5 py-0.2 rounded-full bg-[#E4D7C2] text-[#4A4035]">
              {placesCount}
            </span>
          )}
        </button>

        <button
          id="nav-tab-journeys"
          onClick={() => onSelectTab('journeys')}
          className={`flex items-center space-x-1.5 px-4 py-1.5 rounded-full text-xs font-medium transition-all duration-150 ${
            activeTab === 'journeys'
              ? 'bg-[#FCFAF5] text-[#2B2621] shadow-xs'
              : 'text-[#6B6053] hover:text-[#2B2621]'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>Journeys</span>
        </button>

        <button
          id="nav-tab-postcards"
          onClick={() => onSelectTab('postcards')}
          className={`flex items-center space-x-1.5 px-4 py-1.5 rounded-full text-xs font-medium transition-all duration-150 ${
            activeTab === 'postcards'
              ? 'bg-[#FCFAF5] text-[#2B2621] shadow-xs'
              : 'text-[#6B6053] hover:text-[#2B2621]'
          }`}
        >
          <Mail className="w-3.5 h-3.5" />
          <span>Postcards</span>
        </button>
      </nav>

      {/* Subtle Utility Actions */}
      <div className="flex items-center space-x-2 sm:space-x-2.5">
        {/* Pin Memory Action */}
        {onOpenAddModal && (
          <button
            onClick={onOpenAddModal}
            className="flex items-center space-x-1.5 text-xs px-3.5 py-1.5 rounded-full bg-[#B45A42] hover:bg-[#9B452F] text-[#FAF6EE] font-serif transition-all shadow-2xs hover:shadow-xs"
            title="Pin a memory or destination"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Pin Memory</span>
          </button>
        )}

        {/* Sample toggle button */}
        <button
          onClick={onToggleSample}
          className={`flex items-center space-x-1.5 text-xs px-3 py-1.5 rounded-full border transition-all duration-150 ${
            isSample
              ? 'bg-[#E5D7C2] border-[#CBB9A0] text-[#3D3327]'
              : 'bg-transparent border-[#D5C6AC] text-[#695E52] hover:bg-[#EFE6D5]'
          }`}
          title={isSample ? 'Switch to your personal atlas' : 'View curated sample memories'}
        >
          <Sparkles className="w-3.5 h-3.5 text-[#B45A42]" />
          <span className="hidden md:inline">
            {isSample ? 'Sample View' : 'Explore sample memories'}
          </span>
        </button>

        {/* Privacy Note */}
        <button
          onClick={() => onSelectTab('privacy')}
          className={`p-2 rounded-full transition-colors ${
            activeTab === 'privacy'
              ? 'bg-[#E5D7C2] text-[#2B2621]'
              : 'text-[#7B7063] hover:text-[#2B2621] hover:bg-[#EDE3D0]'
          }`}
          title="Privacy & Local Storage"
          aria-label="Privacy information"
        >
          <Shield className="w-4 h-4" />
        </button>

        {/* Reset / Clear Data */}
        {placesCount > 0 && (
          <button
            onClick={onClearData}
            className="p-2 rounded-full text-[#8A7D6F] hover:text-[#9E4F39] hover:bg-[#F3DFD8] transition-colors"
            title="Reset Little Atlas data"
            aria-label="Reset local data"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>
    </header>
  );
};
