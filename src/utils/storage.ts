import { Place, Memory, TripPlan } from '../types';
import { findMatchingPlace } from './placeMatching';
import { saveMemoriesToIdb, getMemoriesFromIdb, clearIdb } from './indexedDb';

export const PLACES_STORAGE_KEY = 'little_atlas_places_v2';
export const MEMORIES_STORAGE_KEY = 'little_atlas_memories_v2';
export const SAMPLE_ACTIVE_KEY = 'little_atlas_sample_active_v2';
export const SAVED_PLANS_STORAGE_KEY = 'little_atlas_saved_plans_v1';

const LEGACY_STORAGE_KEY_V1 = 'little_atlas_places_v1';
const LEGACY_SAMPLE_KEY_V1 = 'little_atlas_sample_active_v1';

export const SAMPLE_PLACES: Place[] = [
  {
    id: 'sample-place-kyoto',
    name: 'Kyoto',
    city: 'Kyoto',
    region: 'Kansai',
    country: 'Japan',
    countryCode: 'jp',
    latitude: 35.0116,
    longitude: 135.7681,
    createdAt: '2025-04-14T08:00:00.000Z',
  },
  {
    id: 'sample-place-paris',
    name: 'Paris',
    city: 'Paris',
    region: 'Île-de-France',
    country: 'France',
    countryCode: 'fr',
    latitude: 48.8566,
    longitude: 2.3522,
    createdAt: '2025-05-22T08:00:00.000Z',
  },
  {
    id: 'sample-place-reykjavik',
    name: 'Reykjavik & South Coast',
    city: 'Reykjavik',
    region: 'Capital Region',
    country: 'Iceland',
    countryCode: 'is',
    latitude: 64.1466,
    longitude: -21.9426,
    createdAt: '2025-09-08T08:00:00.000Z',
  },
];

export const SAMPLE_MEMORIES: Memory[] = [
  {
    id: 'sample-memory-kyoto',
    placeId: 'sample-place-kyoto',
    title: 'Morning Rain in Arashiyama',
    date: '2025-04-14',
    note: 'Everything felt unusually quiet after the rain. The cedar moss in Arashiyama was glowing under the morning sun.',
    coverImage:
      'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=600&auto=format&fit=crop&q=80',
    photoCount: 4,
    createdAt: '2025-04-14T08:00:00.000Z',
  },
  {
    id: 'sample-memory-paris',
    placeId: 'sample-place-paris',
    title: 'Late Afternoon on the Seine',
    date: '2025-05-22',
    note: 'Spent the late afternoon wandering near the Seine with a warm bag of roasted chestnuts and old paperback books.',
    coverImage:
      'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=600&auto=format&fit=crop&q=80',
    photoCount: 6,
    createdAt: '2025-05-22T08:00:00.000Z',
  },
  {
    id: 'sample-memory-reykjavik',
    placeId: 'sample-place-reykjavik',
    title: 'Black Sand Beach at Vik',
    date: '2025-09-08',
    note: 'The wind was cold and fierce, but the black sand beach at Vik looked like another world entirely.',
    coverImage:
      'https://images.unsplash.com/photo-1504893524553-b855bce32c67?w=600&auto=format&fit=crop&q=80',
    photoCount: 3,
    createdAt: '2025-09-08T08:00:00.000Z',
  },
];

/**
 * Migrates v1 legacy storage to separated Places and Memories v2 schema.
 * - Merges duplicate place records into a single Place object
 * - Preserves notes, dates, and photos as individual Memories
 * - Filters out records that were solely temporary search artifacts with no user memory content
 */
export function migrateLegacyStorage(): { places: Place[]; memories: Memory[] } | null {
  try {
    const v2PlacesRaw = localStorage.getItem(PLACES_STORAGE_KEY);
    const v2MemoriesRaw = localStorage.getItem(MEMORIES_STORAGE_KEY);

    // If v2 already initialized, return null (no migration needed)
    if (v2PlacesRaw !== null && v2MemoriesRaw !== null) {
      return null;
    }

    const legacyRaw = localStorage.getItem(LEGACY_STORAGE_KEY_V1);
    if (!legacyRaw) {
      return null;
    }

    const parsed = JSON.parse(legacyRaw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      return null;
    }

    const migratedPlaces: Place[] = [];
    const migratedMemories: Memory[] = [];

    for (const legacyItem of parsed) {
      if (!legacyItem || typeof legacyItem !== 'object') continue;

      const name = legacyItem.name || legacyItem.city || 'Unknown Place';
      const hasNote = Boolean(legacyItem.note && legacyItem.note.trim().length > 0);
      const hasPhoto = Boolean(legacyItem.coverImage || (legacyItem.photoCount && legacyItem.photoCount > 0));
      const hasDate = Boolean(legacyItem.visitedAt);

      // If it has absolutely no user memory content and was not a sample,
      // it was likely an unsaved search result unintentionally stored by the legacy bug.
      const isSample = String(legacyItem.id || '').startsWith('sample-');
      const isMeaningful = hasNote || hasPhoto || hasDate || isSample;

      if (!isMeaningful) {
        // Discard ephemeral search result artifact
        continue;
      }

      // Check if a matching Place already exists in migratedPlaces
      const existingPlace = findMatchingPlace(
        {
          name,
          city: legacyItem.city,
          region: legacyItem.region,
          country: legacyItem.country,
          latitude: legacyItem.latitude,
          longitude: legacyItem.longitude,
        },
        migratedPlaces
      );

      let targetPlaceId: string;

      if (existingPlace) {
        targetPlaceId = existingPlace.id;
      } else {
        targetPlaceId = legacyItem.id || `place-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
        const cleanPlace: Place = {
          id: targetPlaceId,
          name,
          city: legacyItem.city,
          region: legacyItem.region,
          country: legacyItem.country,
          countryCode: legacyItem.countryCode,
          latitude: typeof legacyItem.latitude === 'number' ? legacyItem.latitude : undefined,
          longitude: typeof legacyItem.longitude === 'number' ? legacyItem.longitude : undefined,
          createdAt: legacyItem.createdAt || new Date().toISOString(),
        };
        migratedPlaces.push(cleanPlace);
      }

      // Create a Memory record attached to this place
      const memoryId = `memory-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      const cleanMemory: Memory = {
        id: memoryId,
        placeId: targetPlaceId,
        title: legacyItem.title || name,
        date: legacyItem.visitedAt,
        note: legacyItem.note?.trim() || undefined,
        coverImage: legacyItem.coverImage || undefined,
        photoCount: legacyItem.photoCount || (legacyItem.coverImage ? 1 : 0),
        createdAt: legacyItem.createdAt || new Date().toISOString(),
      };
      migratedMemories.push(cleanMemory);
    }

    // Persist migrated v2 data safely
    try {
      localStorage.setItem(PLACES_STORAGE_KEY, JSON.stringify(migratedPlaces));
      localStorage.setItem(MEMORIES_STORAGE_KEY, JSON.stringify(migratedMemories));
    } catch {
      // If quota exceeded during migration, save places and compact memories
      localStorage.setItem(PLACES_STORAGE_KEY, JSON.stringify(migratedPlaces));
      const compact = migratedMemories.map((m) =>
        m.coverImage && m.coverImage.startsWith('data:image/') && m.coverImage.length > 50000
          ? { ...m, coverImage: undefined }
          : m
      );
      localStorage.setItem(MEMORIES_STORAGE_KEY, JSON.stringify(compact));
    }

    // Carry over sample flag if active
    const legacySampleActive = localStorage.getItem(LEGACY_SAMPLE_KEY_V1) === 'true';
    if (legacySampleActive) {
      localStorage.setItem(SAMPLE_ACTIVE_KEY, 'true');
    }

    // Free legacy storage space to prevent quota exhaustion
    try {
      localStorage.removeItem(LEGACY_STORAGE_KEY_V1);
      localStorage.removeItem(LEGACY_SAMPLE_KEY_V1);
    } catch {
      // Ignore
    }

    // Also persist full records into IndexedDB
    saveMemoriesToIdb(migratedMemories).catch(() => {});

    return { places: migratedPlaces, memories: migratedMemories };
  } catch (err) {
    console.error('Safe legacy storage migration error:', err);
    return null;
  }
}

export function getStoredPlaces(): Place[] {
  try {
    // Run migration check first
    migrateLegacyStorage();

    const raw = localStorage.getItem(PLACES_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (err) {
    console.error('Failed to read stored places from localStorage', err);
  }
  return [];
}

export function saveStoredPlaces(places: Place[]): void {
  try {
    localStorage.setItem(PLACES_STORAGE_KEY, JSON.stringify(places));
  } catch (err) {
    console.warn('Could not save places to localStorage (quota check):', err);
    try {
      // Free any lingering legacy keys
      localStorage.removeItem(LEGACY_STORAGE_KEY_V1);
      localStorage.removeItem(LEGACY_SAMPLE_KEY_V1);
      localStorage.setItem(PLACES_STORAGE_KEY, JSON.stringify(places));
    } catch (retryErr) {
      console.error('Failed to save places to localStorage', retryErr);
    }
  }
}

export function getStoredMemories(): Memory[] {
  try {
    // Run migration check first
    migrateLegacyStorage();

    const raw = localStorage.getItem(MEMORIES_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (err) {
    console.error('Failed to read stored memories from localStorage', err);
  }
  return [];
}

/**
 * Asynchronously checks IndexedDB for full-fidelity memories (including large photos)
 * and merges them if localStorage had to drop oversized image strings due to browser quota.
 */
export async function syncMemoriesWithIdb(currentMemories: Memory[]): Promise<Memory[] | null> {
  try {
    const idbMemories = await getMemoriesFromIdb();
    if (!idbMemories || idbMemories.length === 0) {
      // If IndexedDB is empty but we have memories, populate it
      if (currentMemories.length > 0) {
        await saveMemoriesToIdb(currentMemories);
      }
      return null;
    }

    // Check if IDB has photos that current memories lack
    let hasEnrichment = false;
    const merged = currentMemories.map((mem) => {
      if (!mem.coverImage) {
        const idbMatch = idbMemories.find((im) => im.id === mem.id);
        if (idbMatch && idbMatch.coverImage) {
          hasEnrichment = true;
          return { ...mem, coverImage: idbMatch.coverImage };
        }
      }
      return mem;
    });

    return hasEnrichment ? merged : null;
  } catch {
    return null;
  }
}

export function saveStoredMemories(memories: Memory[]): void {
  // Always asynchronously persist the full records to IndexedDB (virtually unlimited quota)
  saveMemoriesToIdb(memories).catch(() => {});

  try {
    localStorage.setItem(MEMORIES_STORAGE_KEY, JSON.stringify(memories));
  } catch (err) {
    console.warn('localStorage quota warning: Attempting storage recovery...', err);

    // 1. Purge legacy keys to reclaim space
    try {
      localStorage.removeItem(LEGACY_STORAGE_KEY_V1);
      localStorage.removeItem(LEGACY_SAMPLE_KEY_V1);
    } catch {
      // Ignore
    }

    // 2. Retry saving after legacy purge
    try {
      localStorage.setItem(MEMORIES_STORAGE_KEY, JSON.stringify(memories));
      return;
    } catch {
      // Quota still exceeded
    }

    // 3. Compact oversized base64 strings in localStorage copy
    // (Full images are already safely committed to IndexedDB)
    try {
      const compactMemories = memories.map((m) => {
        if (m.coverImage && m.coverImage.startsWith('data:image/') && m.coverImage.length > 40000) {
          return {
            ...m,
            coverImage: undefined,
          };
        }
        return m;
      });

      localStorage.setItem(MEMORIES_STORAGE_KEY, JSON.stringify(compactMemories));
      console.info('Memories saved to localStorage using compact representation.');
    } catch (finalErr) {
      console.error('Could not save memories to localStorage even after compaction:', finalErr);
    }
  }
}

/**
 * Returns all memories associated with a given place ID
 */
export function getMemoriesForPlace(placeId: string, memories: Memory[]): Memory[] {
  return memories.filter((m) => m.placeId === placeId);
}

/**
 * Filters places down to only those that contain at least one saved Memory.
 * Only places with memories are considered permanent saved pins on the globe!
 */
export function getPlacesWithMemories(places: Place[], memories: Memory[]): Place[] {
  const placeIdSet = new Set(memories.map((m) => m.placeId));
  return places.filter((p) => placeIdSet.has(p.id));
}

export function isSampleActive(): boolean {
  return localStorage.getItem(SAMPLE_ACTIVE_KEY) === 'true';
}

export function setSampleActive(active: boolean): void {
  localStorage.setItem(SAMPLE_ACTIVE_KEY, active ? 'true' : 'false');
}

export function clearAllLocalData(): void {
  localStorage.removeItem(PLACES_STORAGE_KEY);
  localStorage.removeItem(MEMORIES_STORAGE_KEY);
  localStorage.removeItem(SAMPLE_ACTIVE_KEY);
  localStorage.removeItem(SAVED_PLANS_STORAGE_KEY);
  localStorage.removeItem(LEGACY_STORAGE_KEY_V1);
  localStorage.removeItem(LEGACY_SAMPLE_KEY_V1);
  clearIdb().catch(() => {});
}

// ----------------------------------------------------------------------------
// TRIP PLANS PERSISTENCE
// ----------------------------------------------------------------------------

export function getStoredPlans(): TripPlan[] {
  try {
    const raw = localStorage.getItem(SAVED_PLANS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (err) {
    console.error('Failed to read saved trip plans from localStorage', err);
  }
  return [];
}

export function saveStoredPlans(plans: TripPlan[]): void {
  try {
    localStorage.setItem(SAVED_PLANS_STORAGE_KEY, JSON.stringify(plans));
  } catch (err) {
    console.error('Failed to save trip plans to localStorage', err);
  }
}

export function savePlan(plan: TripPlan): TripPlan[] {
  const current = getStoredPlans();
  const existingIdx = current.findIndex((p) => p.id === plan.id);
  let updated: TripPlan[];
  if (existingIdx >= 0) {
    updated = [...current];
    updated[existingIdx] = { ...plan, updatedAt: new Date().toISOString() };
  } else {
    updated = [plan, ...current];
  }
  saveStoredPlans(updated);
  return updated;
}

export function deleteStoredPlan(planId: string): TripPlan[] {
  const current = getStoredPlans();
  const filtered = current.filter((p) => p.id !== planId);
  saveStoredPlans(filtered);
  return filtered;
}

export function togglePlanUpcoming(planId: string): TripPlan[] {
  const current = getStoredPlans();
  const updated = current.map((p) => {
    if (p.id === planId) {
      return { ...p, isUpcoming: !p.isUpcoming };
    }
    return p;
  });
  saveStoredPlans(updated);
  return updated;
}

