import React from 'react';
import { Compass, Sparkles, MapPin } from 'lucide-react';

interface EmptyStateProps {
  onSearchFocus: () => void;
  onExploreSample: () => void;
  onManualAdd?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  onSearchFocus,
  onExploreSample,
  onManualAdd,
}) => {
  return (
    <div className="bg-[#FAF5EC]/95 border border-[#DDD0BC] rounded-2xl p-5 shadow-lg max-w-sm backdrop-blur-md text-[#2C2723]">
      <div className="flex items-center space-x-2 text-[#B45A42] text-[11px] uppercase tracking-widest font-semibold mb-1">
        <Compass className="w-3.5 h-3.5" />
        <span>Personal Archive</span>
      </div>
      <h3 className="font-serif text-xl font-medium text-[#2B2621]">
        Your atlas is waiting.
      </h3>
      <p className="text-xs text-[#7A6F62] mt-1.5 leading-relaxed font-serif italic">
        Pin the places you’ve been, gather the moments that stayed with you, and turn them into postcards to keep.
      </p>

      <div className="mt-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
        <button
          onClick={() => (onManualAdd ? onManualAdd() : onSearchFocus())}
          className="flex-1 px-3.5 py-2 bg-[#B45A42] hover:bg-[#964731] text-white rounded-xl text-xs font-serif font-medium flex items-center justify-center space-x-1.5 transition-colors shadow-xs"
        >
          <MapPin className="w-3.5 h-3.5" />
          <span>Add a memory</span>
        </button>
        <button
          onClick={onExploreSample}
          className="px-3.5 py-2 bg-[#EFE4D2] hover:bg-[#E4D5BE] text-[#4A3D2F] rounded-xl text-xs font-serif font-medium flex items-center justify-center space-x-1.5 transition-colors"
        >
          <Sparkles className="w-3.5 h-3.5 text-[#B45A42]" />
          <span>View sample atlas</span>
        </button>
      </div>
    </div>
  );
};
