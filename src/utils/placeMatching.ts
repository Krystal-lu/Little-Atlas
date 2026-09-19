import { Place } from '../types';

/**
 * Normalizes text for reliable matching:
 * - lowercase
 * - trim
 * - strip accents/diacritics
 * - collapse whitespace and punctuation
 */
export function normalizePlaceText(text?: string): string {
  if (!text) return '';
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Generates a canonical place key:
 * normalized name + country + rounded latitude/longitude (2 decimals ~1.1km)
 * e.g., "tokyo|japan|35.69|139.69" or "tokyo|japan"
 */
export function getCanonicalPlaceKey(candidate: {
  name: string;
  country?: string;
  latitude?: number;
  longitude?: number;
}): string {
  const normName = normalizePlaceText(candidate.name);
  const normCountry = normalizePlaceText(candidate.country);

  const hasCoords =
    typeof candidate.latitude === 'number' &&
    !isNaN(candidate.latitude) &&
    typeof candidate.longitude === 'number' &&
    !isNaN(candidate.longitude);

  if (hasCoords) {
    const latRound = (Math.round(candidate.latitude! * 100) / 100).toFixed(2);
    const lngRound = (Math.round(candidate.longitude! * 100) / 100).toFixed(2);
    return `${normName}|${normCountry}|${latRound}|${lngRound}`;
  }

  return normCountry ? `${normName}|${normCountry}` : normName;
}

/**
 * Calculates approximate distance in kilometers using the Haversine formula
 */
export function calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Searches for an existing saved Place that matches the candidate place.
 * Evaluates:
 * 1. Exact canonical key match
 * 2. Close coordinates (< 35km) with matching or compatible names
 * 3. Exact normalized name and country match
 */
export function findMatchingPlace(
  candidate: {
    name: string;
    city?: string;
    region?: string;
    country?: string;
    latitude?: number;
    longitude?: number;
  },
  existingPlaces: Place[]
): Place | undefined {
  if (!existingPlaces.length) return undefined;

  const candidateKey = getCanonicalPlaceKey(candidate);
  const normCandidateName = normalizePlaceText(candidate.name);
  const normCandidateCountry = normalizePlaceText(candidate.country);
  const normCandidateCity = normalizePlaceText(candidate.city);

  const candHasCoords =
    typeof candidate.latitude === 'number' &&
    !isNaN(candidate.latitude) &&
    typeof candidate.longitude === 'number' &&
    !isNaN(candidate.longitude);

  // 1. Check exact canonical key
  const exactKeyMatch = existingPlaces.find(
    (p) => getCanonicalPlaceKey(p) === candidateKey
  );
  if (exactKeyMatch) return exactKeyMatch;

  // 2. Check geographical proximity + name overlap
  if (candHasCoords) {
    for (const place of existingPlaces) {
      if (
        typeof place.latitude === 'number' &&
        typeof place.longitude === 'number'
      ) {
        const dist = calculateDistanceKm(
          candidate.latitude!,
          candidate.longitude!,
          place.latitude,
          place.longitude
        );

        // Within 35km radius (same metropolitan/city area)
        if (dist <= 35) {
          const normPName = normalizePlaceText(place.name);
          const normPCity = normalizePlaceText(place.city);
          if (
            normPName === normCandidateName ||
            normPName.includes(normCandidateName) ||
            normCandidateName.includes(normPName) ||
            (normCandidateCity && normCandidateCity === normPCity)
          ) {
            return place;
          }
        }
      }
    }
  }

  // 3. Name and country match (even if coordinates are not provided or slightly offset)
  for (const place of existingPlaces) {
    const normPName = normalizePlaceText(place.name);
    const normPCountry = normalizePlaceText(place.country);

    if (normPName === normCandidateName) {
      if (
        !normCandidateCountry ||
        !normPCountry ||
        normCandidateCountry === normPCountry ||
        normCandidateCountry.includes(normPCountry) ||
        normPCountry.includes(normCandidateCountry)
      ) {
        return place;
      }
    }
  }

  return undefined;
}
