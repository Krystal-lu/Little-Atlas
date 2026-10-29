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
    <div className="bg-[#FFFFFF]/95 border border-[#DDD0BC] rounded-xl p-5 shadow-lg max-w-sm backdrop-blur-md text-[#262D2A]">
      <div className="flex items-center space-x-2 text-[#75523B] text-[11px] uppercase tracking-widest font-semibold mb-1">
        <Compass className="w-3.5 h-3.5" />
        <span>Personal Archive</span>
      </div>
      <h3 className="font-sans text-xl font-medium text-[#262D2A]">
        Your atlas is waiting.
      </h3>
      <p className="text-xs text-[#626B65] mt-1.5 leading-relaxed font-sans">
        Pin the places you’ve been, gather the moments that stayed with you, and turn them into postcards to keep.
      </p>

      <div className="mt-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
        <button
          onClick={() => (onManualAdd ? onManualAdd() : onSearchFocus())}
          className="flex-1 px-3.5 py-2 bg-[#75523B] hover:bg-[#523A29] text-white rounded-xl text-xs font-sans font-medium flex items-center justify-center space-x-1.5 transition-colors shadow-xs"
        >
          <MapPin className="w-3.5 h-3.5" />
          <span>Add a memory</span>
        </button>
        <button
          onClick={onExploreSample}
          className="px-3.5 py-2 bg-[#EEECE5] hover:bg-[#E4D5BE] text-[#626B65] rounded-xl text-xs font-sans font-medium flex items-center justify-center space-x-1.5 transition-colors"
        >
          <Sparkles className="w-3.5 h-3.5 text-[#75523B]" />
          <span>View sample atlas</span>
        </button>
      </div>
    </div>
  );
};
