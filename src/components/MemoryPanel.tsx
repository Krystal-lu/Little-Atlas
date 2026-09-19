import React, { useState, useEffect } from 'react';
import {
  X,
  Calendar,
  Camera,
  Trash2,
  Edit3,
  Check,
  MapPin,
  Mail,
  Compass,
  Bookmark,
  Plus,
  ArrowLeft,
  ChevronRight,
  ImageIcon,
} from 'lucide-react';
import { Place, Memory } from '../types';
import { compressImageFile } from '../utils/imageCompression';

interface MemoryPanelProps {
  place: Place;
  isSaved: boolean;
  memories: Memory[];
  selectedMemoryId?: string;
  onClose: () => void;
  onSaveNewMemory: (params: {
    place: Place;
    date: string;
    note?: string;
    title?: string;
    coverImage?: string;
  }) => void;
  onUpdateMemory: (updated: Memory) => void;
  onDeleteMemory: (memoryId: string, placeId: string) => void;
  onSelectMemory: (memoryId: string) => void;
  onBackToPlaceOverview: () => void;
  onCreatePostcard?: (place: Place, memory?: Memory) => void;
}

export const MemoryPanel: React.FC<MemoryPanelProps> = ({
  place,
  isSaved,
  memories,
  selectedMemoryId,
  onClose,
  onSaveNewMemory,
  onUpdateMemory,
  onDeleteMemory,
  onSelectMemory,
  onBackToPlaceOverview,
  onCreatePostcard,
}) => {
  // If user is actively authoring a new memory (for State A or State B "+ Add another trip")
  const [isAddingMemory, setIsAddingMemory] = useState(!isSaved);
  const [newDate, setNewDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [newNote, setNewNote] = useState('');
  const [newCoverImage, setNewCoverImage] = useState('');

  // Active memory for State C
  const activeMemory = selectedMemoryId
    ? memories.find((m) => m.id === selectedMemoryId)
    : memories.length === 1
    ? memories[0]
    : undefined;

  // Inline editing in State C
  const [isEditingNote, setIsEditingNote] = useState(false);
  const [noteText, setNoteText] = useState(activeMemory?.note || '');
  const [isEditingDate, setIsEditingDate] = useState(false);
  const [dateText, setDateText] = useState(activeMemory?.date || '');

  // Confirm delete dialog state
  const [confirmDeleteMemoryId, setConfirmDeleteMemoryId] = useState<string | null>(null);

  // Sync state when active memory changes
  useEffect(() => {
    if (activeMemory) {
      setNoteText(activeMemory.note || '');
      setDateText(activeMemory.date || '');
      setIsEditingNote(false);
      setIsEditingDate(false);
      setIsAddingMemory(false);
    } else if (!isSaved) {
      setIsAddingMemory(true);
      setNewNote('');
      setNewCoverImage('');
      setNewDate(new Date().toISOString().split('T')[0]);
    } else {
      setIsAddingMemory(false);
    }
  }, [activeMemory, isSaved, place.id]);

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveNewMemory({
      place,
      date: newDate || new Date().toISOString().split('T')[0],
      note: newNote.trim() || undefined,
      coverImage: newCoverImage || undefined,
    });
    setIsAddingMemory(false);
  };

  const handleSaveInlineNote = () => {
    if (!activeMemory) return;
    onUpdateMemory({ ...activeMemory, note: noteText.trim() });
    setIsEditingNote(false);
  };

  const handleSaveInlineDate = () => {
    if (!activeMemory) return;
    onUpdateMemory({ ...activeMemory, date: dateText });
    setIsEditingDate(false);
  };

  const handleImageFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const compressedDataUrl = await compressImageFile(file);
      if (isAddingMemory) {
        setNewCoverImage(compressedDataUrl);
      } else if (activeMemory) {
        onUpdateMemory({
          ...activeMemory,
          coverImage: compressedDataUrl,
          photoCount: (activeMemory.photoCount || 0) + 1,
        });
      }
    } catch (err) {
      console.warn('Image compression fallback:', err);
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          if (isAddingMemory) {
            setNewCoverImage(reader.result);
          } else if (activeMemory) {
            onUpdateMemory({
              ...activeMemory,
              coverImage: reader.result,
              photoCount: (activeMemory.photoCount || 0) + 1,
            });
          }
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const formattedCoords =
    typeof place.latitude === 'number' && typeof place.longitude === 'number'
      ? `${place.latitude >= 0 ? `${place.latitude.toFixed(2)}° N` : `${Math.abs(place.latitude).toFixed(2)}° S`}, ${
          place.longitude >= 0 ? `${place.longitude.toFixed(2)}° E` : `${Math.abs(place.longitude).toFixed(2)}° W`
        }`
      : 'Coordinates not recorded';

  return (
    <div
      id="memory-preview-panel"
      className="w-full max-w-sm sm:w-96 bg-[#FAF5EC] border border-[#D8CCA8] rounded-2xl shadow-xl p-5 text-[#2C2723] flex flex-col relative animate-in slide-in-from-right-4 duration-200 backdrop-blur-md max-h-[85vh] overflow-y-auto"
    >
      {/* Top Close Button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-1.5 rounded-full text-[#8C7F72] hover:text-[#2C2723] hover:bg-[#EFE5D2] transition-colors"
        aria-label="Close panel"
      >
        <X className="w-4 h-4" />
      </button>

      {/* Navigation back button when drilled into a specific memory among multiple memories */}
      {isSaved && activeMemory && memories.length > 1 && !isAddingMemory && (
        <button
          onClick={onBackToPlaceOverview}
          className="inline-flex items-center space-x-1 text-xs text-[#8A4836] hover:text-[#5E2B1E] font-medium mb-2.5 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>All {place.name} memories ({memories.length})</span>
        </button>
      )}

      {/* ========================================================================= */}
      {/* HEADER SECTION: Place info + Saved Badge (if saved)                       */}
      {/* ========================================================================= */}
      <div className="pr-6">
        <div className="flex items-center space-x-2">
          {isSaved ? (
            <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-[#EADCC8] text-[#5A4533] text-[10px] font-sans font-semibold uppercase tracking-wider">
              <Bookmark className="w-3 h-3 fill-current" />
              <span>Saved</span>
            </span>
          ) : (
            <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-[#EFE8DC] text-[#7A6F62] text-[10px] font-sans uppercase tracking-wider">
              <Compass className="w-3 h-3" />
              <span>Search Result</span>
            </span>
          )}

          {isSaved && (
            <span className="text-[11px] font-serif text-[#786D61] italic">
              {memories.length} {memories.length === 1 ? 'memory' : 'memories'}
            </span>
          )}
        </div>

        <h2 className="font-serif text-2xl font-medium text-[#2B2621] mt-1.5 leading-snug">
          {place.name}
        </h2>
        <p className="text-xs text-[#786D61]">
          {[place.region, place.country].filter(Boolean).join(', ') || 'Earth'}
        </p>
        <p className="text-[11px] font-mono text-[#A29483] mt-0.5">{formattedCoords}</p>
      </div>

      {/* ========================================================================= */}
      {/* STATE A: UNSAVED SEARCH RESULT (User searched, not yet saved)            */}
      {/* ========================================================================= */}
      {!isSaved && !isAddingMemory && (
        <div className="mt-5 p-4 rounded-xl border border-dashed border-[#D2C5AB] bg-[#F4EDE0]/60 text-center">
          <p className="text-xs text-[#6B6053] leading-relaxed">
            You are previewing this destination on the Atlas. It has not been pinned to your
            saved memories yet.
          </p>
          <button
            onClick={() => setIsAddingMemory(true)}
            className="mt-3.5 w-full px-4 py-2.5 bg-[#B45A42] hover:bg-[#964731] text-white rounded-xl text-xs font-serif font-medium flex items-center justify-center space-x-1.5 transition-colors shadow-xs"
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>Pin a memory</span>
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* NEW MEMORY CREATION FORM (for State A or State B "+ Add another trip")    */}
      {/* ========================================================================= */}
      {isAddingMemory && (
        <form onSubmit={handleCreateSubmit} className="mt-4 space-y-3 pt-3 border-t border-[#E5D9C2]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-serif font-medium text-[#7D3827]">
              {isSaved ? `Add another memory to ${place.name}` : `Pin a memory for ${place.name}`}
            </span>
            {isSaved && (
              <button
                type="button"
                onClick={() => setIsAddingMemory(false)}
                className="text-[11px] text-[#7A6F62] hover:underline"
              >
                Cancel
              </button>
            )}
          </div>

          <div>
            <label className="block text-[10px] uppercase font-semibold text-[#7A6F62] mb-1">
              Date Visited
            </label>
            <input
              type="date"
              required
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
              className="w-full px-3 py-1.5 bg-white border border-[#D5C7B0] rounded-xl text-xs text-[#2C2723]"
            />
          </div>

          <div>
            <label className="block text-[10px] uppercase font-semibold text-[#7A6F62] mb-1">
              Personal Note / Story
            </label>
            <textarea
              rows={3}
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              placeholder="What stayed with you? A quiet café, the scent of cedar, an afternoon wander..."
              className="w-full p-2.5 bg-white border border-[#D5C7B0] rounded-xl text-xs text-[#2C2723] placeholder-[#9E9283] focus:outline-none focus:border-[#B45A42]"
            />
          </div>

          {/* Photo upload */}
          <div>
            <label className="block text-[10px] uppercase font-semibold text-[#7A6F62] mb-1">
              Photo Snapshot (Optional)
            </label>
            <div className="flex items-center space-x-2">
              <label className="cursor-pointer inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-dashed border-[#BBAE9A] bg-white hover:bg-[#F5EDE0] text-xs text-[#5E5346] transition-colors">
                <ImageIcon className="w-3.5 h-3.5 text-[#B45A42]" />
                <span>Choose photo</span>
                <input type="file" accept="image/*" onChange={handleImageFile} className="hidden" />
              </label>
              {newCoverImage && (
                <div className="flex items-center space-x-1.5">
                  <img
                    src={newCoverImage}
                    alt="Preview"
                    className="w-7 h-7 object-cover rounded-md border border-[#D8CCA8]"
                  />
                  <button
                    type="button"
                    onClick={() => setNewCoverImage('')}
                    className="text-[#B45A42] hover:underline text-[10px]"
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>
          </div>

          <button
            type="submit"
            className="w-full mt-2 px-4 py-2.5 bg-[#B45A42] hover:bg-[#964731] text-white rounded-xl text-xs font-serif font-medium flex items-center justify-center space-x-1.5 transition-colors shadow-xs"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Save Memory to Atlas</span>
          </button>
        </form>
      )}

      {/* ========================================================================= */}
      {/* STATE B: SAVED PLACE OVERVIEW (Listing multiple memories at this place)   */}
      {/* ========================================================================= */}
      {isSaved && !activeMemory && !isAddingMemory && (
        <div className="mt-4 pt-3 border-t border-[#E5D9C2] space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-serif font-medium text-[#5E5244]">
              Pinned Memories ({memories.length})
            </span>
            <button
              onClick={() => setIsAddingMemory(true)}
              className="text-xs text-[#B45A42] hover:underline font-serif flex items-center space-x-1"
            >
              <Plus className="w-3 h-3" />
              <span>Add another trip</span>
            </button>
          </div>

          <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
            {memories.map((mem) => {
              const formatted = mem.date
                ? new Date(mem.date).toLocaleDateString('en-US', {
                    month: 'short',
                    year: 'numeric',
                  })
                : 'Date not recorded';

              return (
                <div
                  key={mem.id}
                  onClick={() => onSelectMemory(mem.id)}
                  className="p-3 rounded-xl bg-[#F7EFE2]/90 hover:bg-[#F0E5D3] border border-[#E0D4BF] cursor-pointer transition-colors flex items-center justify-between group"
                >
                  <div className="flex items-start space-x-3 min-w-0 pr-2">
                    {mem.coverImage ? (
                      <img
                        src={mem.coverImage}
                        alt="Thumbnail"
                        className="w-10 h-10 object-cover rounded-lg border border-[#D5C7B0] shrink-0"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-[#EAE0CD] flex items-center justify-center text-[#8C7F72] shrink-0">
                        <Camera className="w-4 h-4" />
                      </div>
                    )}
                    <div className="min-w-0">
                      <div className="text-xs font-serif font-medium text-[#2C2723] group-hover:text-[#913F29] transition-colors">
                        {mem.title || formatted}
                      </div>
                      <div className="text-[11px] text-[#7A6F62] font-mono">{formatted}</div>
                      {mem.note && (
                        <div className="text-[11px] text-[#554C42] italic line-clamp-1 mt-0.5">
                          “{mem.note}”
                        </div>
                      )}
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#A29483] group-hover:text-[#2C2723] shrink-0" />
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STATE C: SAVED MEMORY VIEW (Single memory details, edit note/date, delete)*/}
      {/* ========================================================================= */}
      {isSaved && activeMemory && !isAddingMemory && (
        <div className="mt-3 pt-3 border-t border-[#E5D9C2]">
          {/* Cover image or empty photo placeholder */}
          {activeMemory.coverImage ? (
            <div className="relative rounded-xl overflow-hidden border border-[#D5C7B0] aspect-16/10 bg-[#EFE6D5] mb-3">
              <img
                src={activeMemory.coverImage}
                alt={`Memory from ${place.name}`}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-2 left-2 px-2.5 py-0.5 rounded-md bg-[#2C2723]/65 backdrop-blur-xs text-[#FAF6EE] text-[11px] flex items-center space-x-1.5 font-serif">
                <Camera className="w-3 h-3" />
                <span>{activeMemory.photoCount || 1} moment{activeMemory.photoCount === 1 ? '' : 's'}</span>
              </div>
            </div>
          ) : (
            <div className="mb-3 p-3 rounded-xl border border-dashed border-[#D2C5AB] bg-[#F4EDE0]/60 flex items-center justify-between">
              <div className="flex items-center space-x-2 text-xs text-[#706456]">
                <Camera className="w-4 h-4 text-[#8D8070]" />
                <span className="font-serif italic">No photo attached</span>
              </div>
              <label className="cursor-pointer text-[11px] text-[#B45A42] hover:underline font-serif">
                <span>+ Attach photo</span>
                <input type="file" accept="image/*" onChange={handleImageFile} className="hidden" />
              </label>
            </div>
          )}

          {/* Visited Date Row */}
          <div className="pt-2 flex items-center justify-between text-xs">
            <div className="flex items-center space-x-2 text-[#5E5244]">
              <Calendar className="w-3.5 h-3.5 text-[#B45A42]" />
              {isEditingDate ? (
                <input
                  type="date"
                  value={dateText}
                  onChange={(e) => setDateText(e.target.value)}
                  className="px-2 py-0.5 border border-[#D5C7B0] rounded bg-white text-xs text-[#2C2723]"
                />
              ) : (
                <span className="font-medium text-[#2E2720] font-serif">
                  {activeMemory.date
                    ? new Date(activeMemory.date).toLocaleDateString('en-US', {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric',
                      })
                    : 'No date recorded'}
                </span>
              )}
            </div>

            {isEditingDate ? (
              <button
                onClick={handleSaveInlineDate}
                className="text-[11px] px-2.5 py-0.5 rounded bg-[#9E4F39] text-white hover:bg-[#85412E]"
              >
                Save
              </button>
            ) : (
              <button
                onClick={() => setIsEditingDate(true)}
                className="text-[11px] text-[#8C8072] hover:text-[#2C2723] flex items-center space-x-1"
              >
                <Edit3 className="w-3 h-3" />
                <span>Edit date</span>
              </button>
            )}
          </div>

          {/* Personal Note */}
          <div className="mt-3 pt-3 border-t border-[#E5D9C2]">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-serif font-medium text-[#5E5244]">Personal Note</span>
              {!isEditingNote && (
                <button
                  onClick={() => setIsEditingNote(true)}
                  className="text-[11px] text-[#8C8072] hover:text-[#2C2723] flex items-center space-x-1"
                >
                  <Edit3 className="w-3 h-3" />
                  <span>{activeMemory.note ? 'Edit note' : 'Write note'}</span>
                </button>
              )}
            </div>

            {isEditingNote ? (
              <div className="space-y-2">
                <textarea
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  rows={3}
                  placeholder="What do you want to remember about this place?"
                  className="w-full p-2.5 bg-white border border-[#D5C7B0] rounded-xl text-xs text-[#2C2723] placeholder-[#9E9283] focus:outline-none focus:border-[#B45A42]"
                />
                <div className="flex justify-end space-x-2">
                  <button
                    onClick={() => {
                      setNoteText(activeMemory.note || '');
                      setIsEditingNote(false);
                    }}
                    className="px-2.5 py-1 text-xs text-[#706456] hover:bg-[#EFE6D5] rounded-md"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveInlineNote}
                    className="px-3 py-1 text-xs bg-[#9E4F39] text-white rounded-md hover:bg-[#85412E] flex items-center space-x-1"
                  >
                    <Check className="w-3 h-3" />
                    <span>Save note</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-3 rounded-xl bg-[#F4ECE0]/80 border border-[#E0D4BD] text-xs text-[#3E352B] italic font-serif leading-relaxed">
                {activeMemory.note ? (
                  `“${activeMemory.note}”`
                ) : (
                  <span className="text-[#988C7D] not-italic font-sans">
                    No handwritten note yet. Click "Write note" to capture a thought.
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Delete confirm dialog / Delete button */}
          {confirmDeleteMemoryId === activeMemory.id ? (
            <div className="mt-4 p-3 rounded-xl bg-[#F8EBE8] border border-[#E9CDC6] text-xs text-[#7A3222] space-y-2">
              <p className="font-serif">
                Delete this memory?{' '}
                {memories.length === 1 && (
                  <span className="text-[11px] block mt-0.5 text-[#913F29]">
                    This is the only memory for {place.name}. Its pin will disappear from the
                    Atlas.
                  </span>
                )}
              </p>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => onDeleteMemory(activeMemory.id, place.id)}
                  className="px-3 py-1 rounded bg-[#B45A42] text-white font-medium text-xs hover:bg-[#913F29]"
                >
                  Confirm Delete
                </button>
                <button
                  onClick={() => setConfirmDeleteMemoryId(null)}
                  className="px-2.5 py-1 rounded text-[#5A4F42] hover:bg-[#EBDDD8] text-xs"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="mt-4 pt-3 border-t border-[#E5D9C2] flex items-center justify-between">
              <button
                onClick={() => setConfirmDeleteMemoryId(activeMemory.id)}
                className="text-xs text-[#9E4F39] hover:text-[#7A3625] flex items-center space-x-1 py-1 px-2 rounded-md hover:bg-[#F6E6E1] transition-colors"
                title="Delete this memory"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete memory</span>
              </button>

              <div className="flex items-center space-x-2">
                {onCreatePostcard && (
                  <button
                    onClick={() => onCreatePostcard(place, activeMemory)}
                    className="text-xs px-3 py-1.5 rounded-full border border-[#D5C7B0] text-[#4F4437] hover:bg-[#EFE5D3] flex items-center space-x-1.5 transition-colors font-serif"
                  >
                    <Mail className="w-3.5 h-3.5 text-[#B45A42]" />
                    <span>Postcard</span>
                  </button>
                )}

                {memories.length > 1 && (
                  <button
                    onClick={() => setIsAddingMemory(true)}
                    className="text-xs px-3 py-1.5 rounded-full bg-[#EAE0D0] hover:bg-[#DFCDB8] text-[#4A3D2F] font-serif transition-colors"
                  >
                    + Another trip
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
