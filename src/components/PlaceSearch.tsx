import React, { useState, useEffect, useRef } from 'react';
import { Search, MapPin, X, Plus, Bookmark, Compass } from 'lucide-react';
import { Place, Memory, SearchResult } from '../types';
import { searchOfflineAndSavedPlaces } from '../utils/geocoding';

interface PlaceSearchProps {
  savedPlaces: Place[];
  memories: Memory[];
  onSelectSavedPlace: (placeId: string) => void;
  onSelectSearchResult: (result: SearchResult) => void;
  onManualAdd?: (name: string) => void;
  onOpenManualModal?: () => void;
}

export const PlaceSearch: React.FC<PlaceSearchProps> = ({
  savedPlaces,
  memories,
  onSelectSavedPlace,
  onSelectSearchResult,
  onManualAdd,
  onOpenManualModal,
}) => {
  const [query, setQuery] = useState('');
  const [savedMatches, setSavedMatches] = useState<SearchResult[]>([]);
  const [atlasMatches, setAtlasMatches] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Synchronous, zero-latency 100% offline search
  useEffect(() => {
    const clean = query.trim();
    if (clean.length < 2) {
      setSavedMatches([]);
      setAtlasMatches([]);
      return;
    }

    const { savedMatches: sm, atlasMatches: am } = searchOfflineAndSavedPlaces(
      clean,
      savedPlaces,
      memories
    );
    setSavedMatches(sm);
    setAtlasMatches(am);
    setIsOpen(true);
  }, [query, savedPlaces, memories]);

  // Click outside to dismiss dropdown
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectSaved = (result: SearchResult) => {
    if (result.existingPlaceId) {
      onSelectSavedPlace(result.existingPlaceId);
    }
    setQuery('');
    setIsOpen(false);
  };

  const handleSelectAtlas = (result: SearchResult) => {
    if (result.existingPlaceId) {
      // If this atlas item actually corresponds to an existing saved place, open the existing memory!
      onSelectSavedPlace(result.existingPlaceId);
    } else {
      // Temporary UI preview only
      onSelectSearchResult(result);
    }
    setQuery('');
    setIsOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (savedMatches.length > 0) {
        handleSelectSaved(savedMatches[0]);
      } else if (atlasMatches.length > 0) {
        handleSelectAtlas(atlasMatches[0]);
      } else if (query.trim() && onManualAdd) {
        onManualAdd(query.trim());
        setQuery('');
        setIsOpen(false);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  const hasResults = savedMatches.length > 0 || atlasMatches.length > 0;

  return (
    <div ref={containerRef} className="relative w-full max-w-md">
      <div className="relative flex items-center">
        <div className="absolute left-4 text-[#8C7F72] pointer-events-none">
          <Search className="w-4 h-4 stroke-[1.6]" />
        </div>
        <input
          id="place-search-input"
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            if (!isOpen && e.target.value.trim().length >= 2) setIsOpen(true);
          }}
          onFocus={() => {
            if (hasResults || query.trim().length >= 2) setIsOpen(true);
          }}
          onKeyDown={handleKeyDown}
          placeholder="Search world destinations or memory places…"
          className="w-full pl-11 pr-10 py-2.5 bg-[#FAF6EE]/95 border border-[#D9CDBC] rounded-full text-sm text-[#2C2723] placeholder-[#8C7F72] shadow-xs focus:outline-none focus:border-[#B45A42] focus:ring-2 focus:ring-[#B45A42]/15 transition-all font-sans"
        />
        {query && (
          <button
            onClick={() => {
              setQuery('');
              setSavedMatches([]);
              setAtlasMatches([]);
              setIsOpen(false);
            }}
            className="absolute right-3.5 text-[#9A8E80] hover:text-[#2C2723] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Results Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-[#FCFAF5] border border-[#D5C7B3] rounded-2xl shadow-xl overflow-hidden z-50 animate-in fade-in-50 duration-150 divide-y divide-[#EFE5D3]">
          {hasResults ? (
            <div className="max-h-96 overflow-y-auto">
              {/* SECTION 1: YOUR MEMORIES (Existing saved places with memories) */}
              {savedMatches.length > 0 && (
                <div>
                  <div className="px-4 py-2 bg-[#F5EFE3] text-[10px] font-sans font-semibold uppercase tracking-wider text-[#8A4836] flex items-center justify-between">
                    <div className="flex items-center space-x-1.5">
                      <Bookmark className="w-3 h-3 fill-[#8A4836]" />
                      <span>Your Saved Memories</span>
                    </div>
                    <span className="text-[10px] font-mono text-[#A05C49]">
                      {savedMatches.length} place{savedMatches.length === 1 ? '' : 's'}
                    </span>
                  </div>

                  <div className="divide-y divide-[#F2E8D7]/60">
                    {savedMatches.map((res) => (
                      <button
                        key={res.id}
                        onClick={() => handleSelectSaved(res)}
                        className="w-full text-left px-4 py-2.5 hover:bg-[#F2E8D7] transition-colors flex items-center justify-between group bg-[#FAF5EB]/50"
                      >
                        <div className="flex items-start space-x-3 min-w-0 pr-3">
                          <MapPin className="w-4 h-4 mt-0.5 text-[#B45A42] fill-[#B45A42]/20 shrink-0" />
                          <div className="min-w-0">
                            <div className="text-sm font-medium text-[#2C2723] group-hover:text-[#913F29] transition-colors truncate">
                              {res.text}
                            </div>
                            <div className="text-xs text-[#7A6F62] truncate">
                              {res.placeName}
                            </div>
                          </div>
                        </div>

                        <div className="shrink-0 flex items-center space-x-2">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-[#E8DDD0] text-[#5A4F42]">
                            {res.memoriesCount || 1}{' '}
                            {(res.memoriesCount || 1) === 1 ? 'memory' : 'memories'}
                          </span>
                          <span className="text-[10px] font-serif font-medium text-[#B45A42] uppercase tracking-wider px-2 py-0.5 bg-[#F6EBE7] rounded-md border border-[#E9CECA]">
                            Saved
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* SECTION 2: PLACES (Curated Atlas Destinations) */}
              {atlasMatches.length > 0 && (
                <div>
                  <div className="px-4 py-2 bg-[#F9F5EC] text-[10px] font-sans font-semibold uppercase tracking-wider text-[#7B7062] flex items-center justify-between">
                    <div className="flex items-center space-x-1.5">
                      <Compass className="w-3 h-3" />
                      <span>Places</span>
                    </div>
                    <span className="text-[9px] font-serif italic text-[#A69988]">
                      offline atlas
                    </span>
                  </div>

                  <div className="divide-y divide-[#F2E8D7]/60">
                    {atlasMatches.map((res) => (
                      <button
                        key={res.id}
                        onClick={() => handleSelectAtlas(res)}
                        className="w-full text-left px-4 py-2.5 hover:bg-[#F2E8D7] transition-colors flex items-start space-x-3 group"
                      >
                        <MapPin className="w-4 h-4 mt-0.5 text-[#8C7F72] group-hover:text-[#B45A42] shrink-0 transition-colors" />
                        <div className="min-w-0 flex-1">
                          <div className="text-sm font-medium text-[#2C2723] group-hover:text-[#913F29] transition-colors truncate">
                            {res.text}
                          </div>
                          <div className="text-xs text-[#7A6F62] truncate">
                            {res.placeName}
                          </div>
                        </div>
                        <span className="text-[11px] text-[#A29483] font-serif italic shrink-0 group-hover:text-[#804231] transition-colors">
                          Preview
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Manual quick-add bar */}
              {query.trim() && (
                <div className="p-2.5 bg-[#F5EDE1]/80 border-t border-[#E8DFC9] flex items-center justify-between">
                  <button
                    onClick={() => {
                      if (onManualAdd) onManualAdd(query.trim());
                      setQuery('');
                      setIsOpen(false);
                    }}
                    className="flex items-center space-x-1.5 text-xs text-[#8A4836] hover:text-[#673022] font-medium transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Pin "{query.trim()}" as a custom place</span>
                  </button>
                </div>
              )}
            </div>
          ) : query.trim().length >= 2 ? (
            /* No match fallback */
            <div className="p-5 text-center">
              <p className="text-xs text-[#7A6F62]">
                No predefined atlas destination for "{query}".
              </p>
              <div className="mt-3 flex flex-col sm:flex-row items-center justify-center gap-2">
                {onManualAdd && (
                  <button
                    onClick={() => {
                      onManualAdd(query.trim());
                      setQuery('');
                      setIsOpen(false);
                    }}
                    className="inline-flex items-center space-x-1.5 text-xs font-medium px-4 py-2 rounded-full bg-[#B45A42] text-[#FAF6EE] hover:bg-[#9B452F] transition-colors shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Pin "{query.trim()}" directly</span>
                  </button>
                )}
                {onOpenManualModal && (
                  <button
                    onClick={() => {
                      onOpenManualModal();
                      setIsOpen(false);
                    }}
                    className="inline-flex items-center space-x-1 text-xs text-[#7A6F62] hover:text-[#2C2723] px-3 py-1.5 rounded-full hover:bg-[#EFE4D2] transition-colors"
                  >
                    <span>Custom coordinates & details…</span>
                  </button>
                )}
              </div>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
};
