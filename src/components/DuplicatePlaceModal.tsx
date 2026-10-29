import { visitDate } from '../utils/dates';
import { useDialog } from '../hooks/useDialog';
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
  const dialogRef = useDialog(onCancel);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#262D2A]/40 backdrop-blur-xs animate-in fade-in-50 duration-150">
      <div ref={dialogRef} role="dialog" aria-modal="true" aria-label="You already have a memory pinned here."
        className="relative w-full max-w-md bg-[#FFFFFF] border border-[#D8D7CE] rounded-xl shadow-2xl p-6 text-[#262D2A]"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 p-1.5 rounded-full text-[#626B65] hover:text-[#262D2A] hover:bg-[#EEECE5] transition-colors"
          aria-label="Cancel"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center space-x-2 text-xs font-sans text-[#75523B]">
          <MapPin className="w-4 h-4" />
          <span>Duplicate Place Check</span>
        </div>

        <h3 className="font-sans text-xl font-medium text-[#262D2A] mt-1.5">
          You already have a memory pinned here.
        </h3>

        <p className="text-xs text-[#626B65] mt-2 leading-relaxed">
          <strong className="text-[#262D2A] font-medium">{existingPlace.name}</strong> (
          {[existingPlace.region, existingPlace.country].filter(Boolean).join(', ')}) already exists
          in your Atlas with{' '}
          <span className="font-medium text-[#75523B]">
            {existingMemories.length} pinned memory
            {existingMemories.length === 1 ? '' : 'ies'}
          </span>
          .
        </p>

        {/* Existing memories preview snippet */}
        <div className="mt-3 p-3 bg-[#EEECE5] rounded-xl border border-[#D8D7CE] max-h-32 overflow-y-auto space-y-1.5">
          {existingMemories.map((m) => (
            <div key={m.id} className="text-xs flex items-center justify-between text-[#626B65]">
              <span className="font-sans truncate mr-2">
                {m.title || (m.date ? visitDate(m.date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'Saved memory')}
              </span>
              <span className="text-[10px] font-mono text-[#626B65] shrink-0">{m.date || 'No date'}</span>
            </div>
          ))}
        </div>

        {/* Options */}
        <div className="mt-5 space-y-2">
          {pendingMemoryData && (
            <button
              onClick={() => onAddAnotherMemory(existingPlace.id, pendingMemoryData)}
              className="w-full py-2.5 px-4 rounded-xl bg-[#75523B] hover:bg-[#523A29] text-white text-xs font-sans font-medium flex items-center justify-center space-x-2 transition-colors shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Add another memory to this place</span>
            </button>
          )}

          <button
            onClick={() => onOpenExisting(existingPlace.id)}
            className="w-full py-2.5 px-4 rounded-xl bg-[#EBE0CD] hover:bg-[#DFD2BC] text-[#3E342A] text-xs font-sans font-medium flex items-center justify-center space-x-2 transition-colors"
          >
            <Bookmark className="w-4 h-4 text-[#75523B]" />
            <span>Open existing memory</span>
          </button>

          <button
            onClick={onCancel}
            className="w-full py-2 text-xs text-[#626B65] hover:text-[#262D2A] font-sans transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
