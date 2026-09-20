import React, { useState, useEffect, useMemo } from 'react';
import { Header } from './components/Header';
import { IllustratedGlobe } from './components/IllustratedGlobe';
import { PlaceSearch } from './components/PlaceSearch';
import { MemoryPanel } from './components/MemoryPanel';
import { EmptyState } from './components/EmptyState';
import { PrivacyView } from './components/PrivacyView';
import { JourneysPlaceholder } from './components/JourneysPlaceholder';
import { PostcardsPlaceholder } from './components/PostcardsPlaceholder';
import { PlanTripView } from './components/PlanTripView';
import { ManualAddModal } from './components/ManualAddModal';
import { DuplicatePlaceModal } from './components/DuplicatePlaceModal';
import { Place, Memory, ActiveTab, SearchResult } from './types';
import {
  getStoredPlaces,
  saveStoredPlaces,
  getStoredMemories,
  saveStoredMemories,
  SAMPLE_PLACES,
  SAMPLE_MEMORIES,
  isSampleActive,
  setSampleActive,
  getPlacesWithMemories,
  clearAllLocalData,
  syncMemoriesWithIdb,
} from './utils/storage';
import { findMatchingPlace } from './utils/placeMatching';
import { POPULAR_DESTINATIONS, REGION_COORDINATE_PRESETS } from './utils/geocoding';
import { AlertTriangle, Compass } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('atlas');
  const [isSample, setIsSample] = useState<boolean>(() => isSampleActive());

  // Persistent collections
  const [places, setPlaces] = useState<Place[]>([]);
  const [memories, setMemories] = useState<Memory[]>([]);

  // Selection state for viewing saved places/memories
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | undefined>();
  const [selectedMemoryId, setSelectedMemoryId] = useState<string | undefined>();

  // Temporary search / preview state (NEVER persisted to storage unless user saves)
  const [temporaryPreviewPlace, setTemporaryPreviewPlace] = useState<Place | null>(null);

  // Temporary pin for the globe (disappears when search/preview closes)
  const [temporaryPin, setTemporaryPin] = useState<{
    longitude: number;
    latitude: number;
    name: string;
  } | null>(null);

  // Modals
  const [manualModalOpen, setManualModalOpen] = useState(false);
  const [manualInitialCoords, setManualInitialCoords] = useState<
    { longitude: number; latitude: number } | undefined
  >();
  const [manualInitialName, setManualInitialName] = useState('');
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  // Duplicate Check Modal state
  const [duplicateCheck, setDuplicateCheck] = useState<{
    existingPlace: Place;
    existingMemories: Memory[];
    pendingMemoryData: {
      date: string;
      note?: string;
      title?: string;
      coverImage?: string;
    };
  } | null>(null);

  // Load initial places & memories
  useEffect(() => {
    if (isSample) {
      setPlaces(SAMPLE_PLACES);
      setMemories(SAMPLE_MEMORIES);
    } else {
      const storedPlaces = getStoredPlaces();
      const storedMemories = getStoredMemories();
      setPlaces(storedPlaces);
      setMemories(storedMemories);

      // Asynchronously enrich photos from IndexedDB if localStorage was capped
      syncMemoriesWithIdb(storedMemories).then((enriched) => {
        if (enriched) {
          setMemories(enriched);
        }
      });
    }
  }, [isSample]);

  // Synchronize storage helper
  const persistState = (newPlaces: Place[], newMemories: Memory[]) => {
    setPlaces(newPlaces);
    setMemories(newMemories);
    if (!isSample) {
      saveStoredPlaces(newPlaces);
      saveStoredMemories(newMemories);
    }
  };

  // Only places with at least one saved memory appear as permanent pins on the globe
  const savedPlacesWithMemories = useMemo(() => {
    return getPlacesWithMemories(places, memories);
  }, [places, memories]);

  const handleToggleSample = () => {
    const next = !isSample;
    setIsSample(next);
    setSampleActive(next);
    setSelectedPlaceId(undefined);
    setSelectedMemoryId(undefined);
    setTemporaryPreviewPlace(null);
    setTemporaryPin(null);

    if (next) {
      setPlaces(SAMPLE_PLACES);
      setMemories(SAMPLE_MEMORIES);
    } else {
      setPlaces(getStoredPlaces());
      setMemories(getStoredMemories());
    }
  };

  const handleClearAll = () => {
    clearAllLocalData();
    setIsSample(false);
    setPlaces([]);
    setMemories([]);
    setSelectedPlaceId(undefined);
    setSelectedMemoryId(undefined);
    setTemporaryPreviewPlace(null);
    setTemporaryPin(null);
    setShowClearConfirm(false);
  };

  // --------------------------------------------------------------------------
  // SEARCH ACTIONS
  // --------------------------------------------------------------------------

  // User clicked a SAVED place from search (matches existing saved place)
  const handleSelectSavedPlaceFromSearch = (placeId: string) => {
    setTemporaryPreviewPlace(null);
    setTemporaryPin(null);
    setSelectedPlaceId(placeId);
    // Find memories for this place
    const placeMems = memories.filter((m) => m.placeId === placeId);
    setSelectedMemoryId(placeMems.length === 1 ? placeMems[0].id : undefined);
    setActiveTab('atlas');
  };

  // User clicked an UNSAVED place from search results
  const handleSelectSearchResult = (result: SearchResult) => {
    // Check if by any chance it matches an existing place with memories
    const matchedExisting = findMatchingPlace(
      {
        name: result.text,
        city: result.city,
        region: result.region,
        country: result.country,
        latitude: result.center ? result.center[1] : undefined,
        longitude: result.center ? result.center[0] : undefined,
      },
      savedPlacesWithMemories
    );

    if (matchedExisting) {
      handleSelectSavedPlaceFromSearch(matchedExisting.id);
      return;
    }

    // Temporary preview ONLY — NOT saved to storage or places array!
    const tempPlace: Place = {
      id: `temp-${Date.now()}`,
      name: result.text,
      city: result.city,
      region: result.region,
      country: result.country,
      countryCode: result.countryCode,
      latitude: result.center ? result.center[1] : undefined,
      longitude: result.center ? result.center[0] : undefined,
      createdAt: new Date().toISOString(),
    };

    setSelectedPlaceId(undefined);
    setSelectedMemoryId(undefined);
    setTemporaryPreviewPlace(tempPlace);

    if (result.center) {
      setTemporaryPin({
        longitude: result.center[0],
        latitude: result.center[1],
        name: result.text,
      });
    } else {
      setTemporaryPin(null);
    }
  };

  // Clicking on unpinned coordinates on the globe
  const handlePinCoordinates = (coords: { longitude: number; latitude: number }) => {
    setManualInitialCoords(coords);
    setManualInitialName('');
    setManualModalOpen(true);
  };

  // Manual place entry trigger from search query
  const handleManualAddFromSearch = (queryName: string) => {
    const clean = queryName.trim().toLowerCase();

    // Check if query matches a predefined destination
    const matched = POPULAR_DESTINATIONS.find(
      (d) => d.text.toLowerCase() === clean || d.placeName.toLowerCase().includes(clean)
    );
    if (matched) {
      handleSelectSearchResult({
        id: matched.id,
        text: matched.text,
        placeName: matched.placeName,
        city: matched.city,
        region: matched.region,
        country: matched.country,
        countryCode: matched.countryCode,
        center: matched.center,
      });
      return;
    }

    let initialCoords: [number, number] | undefined = undefined;
    for (const [key, coords] of Object.entries(REGION_COORDINATE_PRESETS)) {
      if (clean.includes(key)) {
        initialCoords = coords;
        break;
      }
    }

    setManualInitialName(queryName.trim());
    setManualInitialCoords(
      initialCoords ? { longitude: initialCoords[0], latitude: initialCoords[1] } : undefined
    );
    setManualModalOpen(true);
  };

  // --------------------------------------------------------------------------
  // SAVING / CREATING MEMORIES (WITH DUPLICATE DETECTION)
  // --------------------------------------------------------------------------

  const handleSaveNewMemory = (params: {
    place: Place;
    date: string;
    note?: string;
    title?: string;
    coverImage?: string;
  }) => {
    const candidate = params.place;

    // Duplicate detection against existing places that have memories
    const existingMatch = findMatchingPlace(
      {
        name: candidate.name,
        city: candidate.city,
        region: candidate.region,
        country: candidate.country,
        latitude: candidate.latitude,
        longitude: candidate.longitude,
      },
      savedPlacesWithMemories
    );

    // If candidate place already exists in saved places and has a different ID
    if (existingMatch && existingMatch.id !== candidate.id) {
      const existingMems = memories.filter((m) => m.placeId === existingMatch.id);
      setDuplicateCheck({
        existingPlace: existingMatch,
        existingMemories: existingMems,
        pendingMemoryData: {
          date: params.date,
          note: params.note,
          title: params.title,
          coverImage: params.coverImage,
        },
      });
      return;
    }

    // No duplicate: proceed to save memory
    let placeId = candidate.id;
    let newPlaces = [...places];

    // If place was temporary or not in places collection, add it
    const alreadyStoredPlace = places.find((p) => p.id === candidate.id);
    if (!alreadyStoredPlace) {
      placeId = `place-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      const cleanPlace: Place = {
        id: placeId,
        name: candidate.name,
        city: candidate.city,
        region: candidate.region,
        country: candidate.country,
        countryCode: candidate.countryCode,
        latitude: candidate.latitude,
        longitude: candidate.longitude,
        createdAt: new Date().toISOString(),
      };
      newPlaces.push(cleanPlace);
    }

    const newMemory: Memory = {
      id: `memory-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      placeId: placeId,
      title: params.title || candidate.name,
      date: params.date,
      note: params.note,
      coverImage: params.coverImage,
      photoCount: params.coverImage ? 1 : 0,
      createdAt: new Date().toISOString(),
    };

    const newMemories = [...memories, newMemory];
    persistState(newPlaces, newMemories);

    // Clear temporary search preview and switch to active saved memory
    setTemporaryPreviewPlace(null);
    setTemporaryPin(null);
    setSelectedPlaceId(placeId);
    setSelectedMemoryId(newMemory.id);
  };

  // Manual Add Modal Submission
  const handleSaveManualModal = (params: {
    name: string;
    city?: string;
    region?: string;
    country: string;
    latitude?: number;
    longitude?: number;
    date: string;
    note?: string;
    coverImage?: string;
  }) => {
    const candidatePlace = {
      name: params.name,
      city: params.city,
      region: params.region,
      country: params.country,
      latitude: params.latitude,
      longitude: params.longitude,
    };

    // Duplicate detection
    const existingMatch = findMatchingPlace(candidatePlace, savedPlacesWithMemories);
    if (existingMatch) {
      const existingMems = memories.filter((m) => m.placeId === existingMatch.id);
      setDuplicateCheck({
        existingPlace: existingMatch,
        existingMemories: existingMems,
        pendingMemoryData: {
          date: params.date,
          note: params.note,
          coverImage: params.coverImage,
        },
      });
      return;
    }

    // Create new Place
    const placeId = `place-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const newPlace: Place = {
      id: placeId,
      name: params.name,
      city: params.city,
      region: params.region,
      country: params.country,
      latitude: params.latitude,
      longitude: params.longitude,
      createdAt: new Date().toISOString(),
    };

    // Create Memory
    const newMemory: Memory = {
      id: `memory-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      placeId: placeId,
      title: params.name,
      date: params.date,
      note: params.note,
      coverImage: params.coverImage,
      photoCount: params.coverImage ? 1 : 0,
      createdAt: new Date().toISOString(),
    };

    const newPlaces = [...places, newPlace];
    const newMemories = [...memories, newMemory];
    persistState(newPlaces, newMemories);

    setTemporaryPreviewPlace(null);
    setTemporaryPin(null);
    setSelectedPlaceId(placeId);
    setSelectedMemoryId(newMemory.id);
  };

  // Duplicate Modal Confirmation Actions
  const handleAddAnotherMemoryToExistingPlace = (
    placeId: string,
    memoryData: { date: string; note?: string; title?: string; coverImage?: string }
  ) => {
    const newMemory: Memory = {
      id: `memory-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      placeId,
      title: memoryData.title,
      date: memoryData.date,
      note: memoryData.note,
      coverImage: memoryData.coverImage,
      photoCount: memoryData.coverImage ? 1 : 0,
      createdAt: new Date().toISOString(),
    };

    const newMemories = [...memories, newMemory];
    persistState(places, newMemories);

    setDuplicateCheck(null);
    setTemporaryPreviewPlace(null);
    setTemporaryPin(null);
    setSelectedPlaceId(placeId);
    setSelectedMemoryId(newMemory.id);
  };

  const handleOpenExistingFromDuplicate = (placeId: string) => {
    setDuplicateCheck(null);
    setTemporaryPreviewPlace(null);
    setTemporaryPin(null);
    setSelectedPlaceId(placeId);
    const placeMems = memories.filter((m) => m.placeId === placeId);
    setSelectedMemoryId(placeMems.length === 1 ? placeMems[0].id : undefined);
  };

  // --------------------------------------------------------------------------
  // MEMORY UPDATES & DELETION (CRUCIAL FOR TEST 6 & TEST 7)
  // --------------------------------------------------------------------------

  const handleUpdateMemory = (updated: Memory) => {
    const newMemories = memories.map((m) => (m.id === updated.id ? updated : m));
    persistState(places, newMemories);
  };

  const handleDeleteMemory = (memoryId: string, placeId: string) => {
    const remainingMemories = memories.filter((m) => m.id !== memoryId);
    const remainingMemoriesForPlace = remainingMemories.filter((m) => m.placeId === placeId);

    if (remainingMemoriesForPlace.length === 0) {
      // Last memory for this place was deleted! (TEST 7)
      // Remove Place so its permanent pin disappears from the atlas
      const remainingPlaces = places.filter((p) => p.id !== placeId);
      persistState(remainingPlaces, remainingMemories);
      setSelectedPlaceId(undefined);
      setSelectedMemoryId(undefined);
    } else {
      // Other memories still exist for this place (TEST 6)
      // Place remains on globe
      persistState(places, remainingMemories);
      if (selectedMemoryId === memoryId) {
        setSelectedMemoryId(
          remainingMemoriesForPlace.length === 1 ? remainingMemoriesForPlace[0].id : undefined
        );
      }
    }
  };

  // Active panel data
  const currentSavedPlace = selectedPlaceId
    ? places.find((p) => p.id === selectedPlaceId)
    : undefined;
  const currentMemories = selectedPlaceId
    ? memories.filter((m) => m.placeId === selectedPlaceId)
    : [];

  const activePanelPlace = currentSavedPlace || temporaryPreviewPlace;
  const isPanelSaved = Boolean(currentSavedPlace && currentMemories.length > 0);

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#F7F2E7] text-[#2C2723] select-none">
      {/* Top Application Header */}
      <Header
        activeTab={activeTab}
        onSelectTab={(tab) => {
          setActiveTab(tab);
          if (tab !== 'atlas') {
            setSelectedPlaceId(undefined);
            setSelectedMemoryId(undefined);
            setTemporaryPreviewPlace(null);
            setTemporaryPin(null);
          }
        }}
        placesCount={savedPlacesWithMemories.length}
        isSample={isSample}
        onToggleSample={handleToggleSample}
        onClearData={() => setShowClearConfirm(true)}
        onOpenAddModal={() => {
          setManualInitialCoords(undefined);
          setManualInitialName('');
          setManualModalOpen(true);
        }}
      />

      {/* Main Screen Body */}
      <main className="relative flex-1 w-full overflow-hidden flex flex-col">
        {activeTab === 'atlas' && (
          <div className="relative w-full h-full flex flex-col items-center justify-center">
            {/* Illustrated Globe Centerpiece (Only places with memories appear as permanent pins!) */}
            <IllustratedGlobe
              places={savedPlacesWithMemories}
              selectedPlaceId={selectedPlaceId}
              temporaryPin={temporaryPin}
              onSelectPlace={(p) => {
                setTemporaryPreviewPlace(null);
                setTemporaryPin(null);
                setSelectedPlaceId(p.id);
                const mems = memories.filter((m) => m.placeId === p.id);
                setSelectedMemoryId(mems.length === 1 ? mems[0].id : undefined);
              }}
              onPinCoordinates={handlePinCoordinates}
              className="absolute inset-0"
            />

            {/* Floating Top Narrative & Search Bar */}
            <div className="absolute top-6 left-6 right-6 z-20 pointer-events-none flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              {/* Literary Headline */}
              <div className="pointer-events-auto max-w-md bg-[#FAF5EB]/90 backdrop-blur-md px-5 py-3.5 rounded-2xl border border-[#DED4C0]/85 shadow-xs">
                <h1 className="font-serif text-xl sm:text-2xl font-medium tracking-tight text-[#2B2621]">
                  Where have your memories taken you?
                </h1>
                <p className="text-xs text-[#7A6F62] mt-0.5 leading-relaxed font-serif italic">
                  Keep the places that became memories.
                </p>
              </div>

              {/* Offline Search Field */}
              <div className="pointer-events-auto w-full md:w-auto">
                <PlaceSearch
                  savedPlaces={places}
                  memories={memories}
                  onSelectSavedPlace={handleSelectSavedPlaceFromSearch}
                  onSelectSearchResult={handleSelectSearchResult}
                  onManualAdd={handleManualAddFromSearch}
                  onOpenManualModal={() => {
                    setManualInitialCoords(undefined);
                    setManualInitialName('');
                    setManualModalOpen(true);
                  }}
                />
              </div>
            </div>

            {/* Floating Memory Counter Pill */}
            {savedPlacesWithMemories.length > 0 && !activePanelPlace && (
              <div className="absolute bottom-6 left-6 z-10 pointer-events-none hidden sm:block">
                <div className="px-4 py-2 rounded-full bg-[#FAF5EB]/90 backdrop-blur-xs border border-[#DFD3BE] shadow-xs text-xs text-[#615648] flex items-center space-x-2">
                  <Compass className="w-3.5 h-3.5 text-[#B45A42]" />
                  <span className="font-serif">
                    {savedPlacesWithMemories.length} saved place
                    {savedPlacesWithMemories.length === 1 ? '' : 's'} · {memories.length} pinned memory
                    {memories.length === 1 ? '' : 'ies'}
                  </span>
                </div>
              </div>
            )}

            {/* Empty State Overlay if user has no saved places */}
            {savedPlacesWithMemories.length === 0 && !activePanelPlace && (
              <div className="absolute bottom-10 left-6 z-20 pointer-events-auto">
                <EmptyState
                  onSearchFocus={() => {
                    const input = document.getElementById(
                      'place-search-input'
                    ) as HTMLInputElement | null;
                    input?.focus();
                  }}
                  onExploreSample={handleToggleSample}
                  onManualAdd={() => {
                    setManualInitialCoords(undefined);
                    setManualInitialName('');
                    setManualModalOpen(true);
                  }}
                />
              </div>
            )}

            {/* Floating Memory Panel: State A (Search preview), State B (Place overview), State C (Memory view) */}
            {activePanelPlace && (
              <div className="absolute top-24 right-6 bottom-10 z-30 pointer-events-auto flex items-start justify-end">
                <MemoryPanel
                  place={activePanelPlace}
                  isSaved={isPanelSaved}
                  memories={currentMemories}
                  selectedMemoryId={selectedMemoryId}
                  onClose={() => {
                    setSelectedPlaceId(undefined);
                    setSelectedMemoryId(undefined);
                    setTemporaryPreviewPlace(null);
                    setTemporaryPin(null);
                  }}
                  onSaveNewMemory={handleSaveNewMemory}
                  onUpdateMemory={handleUpdateMemory}
                  onDeleteMemory={handleDeleteMemory}
                  onSelectMemory={(memId) => setSelectedMemoryId(memId)}
                  onBackToPlaceOverview={() => setSelectedMemoryId(undefined)}
                  onCreatePostcard={(_p, mem) => {
                    setSelectedMemoryId(mem?.id);
                    setActiveTab('postcards');
                  }}
                />
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Journeys */}
        {activeTab === 'journeys' && (
          <div className="flex-1 overflow-y-auto bg-[#F7F2E7]">
            <JourneysPlaceholder
              places={savedPlacesWithMemories}
              memories={memories}
              onSelectPlace={(place, memoryId) => {
                setSelectedPlaceId(place.id);
                setSelectedMemoryId(memoryId);
                setActiveTab('atlas');
              }}
              onGoToAtlas={() => setActiveTab('atlas')}
            />
          </div>
        )}

        {/* Tab 3: Postcards */}
        {activeTab === 'postcards' && (
          <div className="flex-1 overflow-y-auto bg-[#F7F2E7]">
            <PostcardsPlaceholder
              places={savedPlacesWithMemories}
              memories={memories}
              onSelectPlaceForPostcard={(place, memoryId) => {
                setSelectedPlaceId(place.id);
                setSelectedMemoryId(memoryId);
                setActiveTab('atlas');
              }}
              onGoToAtlas={() => setActiveTab('atlas')}
            />
          </div>
        )}

        {/* Tab 4: Plan Trip */}
        {activeTab === 'plan-trip' && (
          <div className="flex-1 overflow-y-auto bg-[#F7F2E7]">
            <PlanTripView onGoToAtlas={() => setActiveTab('atlas')} />
          </div>
        )}

        {/* Tab 5: Privacy */}
        {activeTab === 'privacy' && (
          <div className="flex-1 overflow-y-auto bg-[#F7F2E7]">
            <PrivacyView
              onBack={() => setActiveTab('atlas')}
              onClearAll={() => setShowClearConfirm(true)}
            />
          </div>
        )}
      </main>

      {/* Manual Place Entry Modal */}
      {manualModalOpen && (
        <ManualAddModal
          initialCoordinates={manualInitialCoords}
          initialName={manualInitialName}
          onClose={() => setManualModalOpen(false)}
          onSave={handleSaveManualModal}
        />
      )}

      {/* Duplicate Place Check Dialog */}
      {duplicateCheck && (
        <DuplicatePlaceModal
          existingPlace={duplicateCheck.existingPlace}
          existingMemories={duplicateCheck.existingMemories}
          pendingMemoryData={duplicateCheck.pendingMemoryData}
          onOpenExisting={handleOpenExistingFromDuplicate}
          onAddAnotherMemory={handleAddAnotherMemoryToExistingPlace}
          onCancel={() => setDuplicateCheck(null)}
        />
      )}

      {/* Clear/Reset Confirmation Modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-2xs">
          <div className="bg-[#FCFAF5] border border-[#DDD3BF] rounded-2xl p-6 max-w-md w-full shadow-2xl animate-in fade-in-50 duration-150">
            <div className="w-10 h-10 rounded-full bg-[#F5D8D0] text-[#9E4F39] flex items-center justify-center mb-3">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <h3 className="font-serif text-xl font-medium text-[#2B2621]">
              Clear all Little Atlas memories?
            </h3>
            <p className="text-xs text-[#7A6F62] mt-2 leading-relaxed">
              This removes your locally stored places and memories from this browser. This action
              cannot be undone.
            </p>
            <div className="mt-5 flex justify-end space-x-2">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="px-4 py-2 text-xs text-[#706456] hover:bg-[#EFE6D5] rounded-xl font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleClearAll}
                className="px-4 py-2 text-xs bg-[#9E4F39] text-white rounded-xl font-medium hover:bg-[#85412E] transition-colors"
              >
                Yes, clear local archive
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
