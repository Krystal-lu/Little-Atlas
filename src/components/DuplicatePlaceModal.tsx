import React from 'react';
import { Bookmark, Plus, X, MapPin } from 'lucide-react';
import { Place, Memory } from '../types';

interface DuplicatePlaceModalProps {
  existingPlace: Place;
  existingMemories: Memory[];
  pendingMemoryData?: {
    date: string;
    note?: string;
    title?: string;
    coverImage?: string;
  };
  onOpenExisting: (placeId: string) => void;
  onAddAnotherMemory: (
    placeId: string,
    memoryData: { date: string; note?: string; title?: string; coverImage?: string }
  ) => void;
  onCancel: () => void;
}

export const DuplicatePlaceModal: React.FC<DuplicatePlaceModalProps> = ({
  existingPlace,
  existingMemories,
  pendingMemoryData,
  onOpenExisting,
  onAddAnotherMemory,
  onCancel,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2C2723]/40 backdrop-blur-xs animate-in fade-in-50 duration-150">
      <div
        className="relative w-full max-w-md bg-[#FAF5EB] border border-[#D9CCA8] rounded-3xl shadow-2xl p-6 text-[#2C2723]"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 p-1.5 rounded-full text-[#7A6F62] hover:text-[#2C2723] hover:bg-[#EFE6D5] transition-colors"
          aria-label="Cancel"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center space-x-2 text-xs font-serif italic text-[#B45A42]">
          <MapPin className="w-4 h-4" />
          <span>Duplicate Place Check</span>
        </div>

        <h3 className="font-serif text-xl font-medium text-[#2B2621] mt-1.5">
          You already have a memory pinned here.
        </h3>

        <p className="text-xs text-[#706456] mt-2 leading-relaxed">
          <strong className="text-[#2C2723] font-medium">{existingPlace.name}</strong> (
          {[existingPlace.region, existingPlace.country].filter(Boolean).join(', ')}) already exists
          in your Atlas with{' '}
          <span className="font-medium text-[#B45A42]">
            {existingMemories.length} pinned memory
            {existingMemories.length === 1 ? '' : 'ies'}
          </span>
          .
        </p>

        {/* Existing memories preview snippet */}
        <div className="mt-3 p-3 bg-[#F3ECE0] rounded-xl border border-[#DFD4BE] max-h-32 overflow-y-auto space-y-1.5">
          {existingMemories.map((m) => (
            <div key={m.id} className="text-xs flex items-center justify-between text-[#4F4437]">
              <span className="font-serif italic truncate mr-2">
                {m.title || (m.date ? new Date(m.date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'Saved memory')}
              </span>
              <span className="text-[10px] font-mono text-[#8C7F72] shrink-0">{m.date || 'No date'}</span>
            </div>
          ))}
        </div>

        {/* Options */}
        <div className="mt-5 space-y-2">
          {pendingMemoryData && (
            <button
              onClick={() => onAddAnotherMemory(existingPlace.id, pendingMemoryData)}
              className="w-full py-2.5 px-4 rounded-xl bg-[#B45A42] hover:bg-[#974833] text-white text-xs font-serif font-medium flex items-center justify-center space-x-2 transition-colors shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Add another memory to this place</span>
            </button>
          )}

          <button
            onClick={() => onOpenExisting(existingPlace.id)}
            className="w-full py-2.5 px-4 rounded-xl bg-[#EBE0CD] hover:bg-[#DFD2BC] text-[#3E342A] text-xs font-serif font-medium flex items-center justify-center space-x-2 transition-colors"
          >
            <Bookmark className="w-4 h-4 text-[#B45A42]" />
            <span>Open existing memory</span>
          </button>

          <button
            onClick={onCancel}
            className="w-full py-2 text-xs text-[#7A6F62] hover:text-[#2C2723] font-sans transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
