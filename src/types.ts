export interface Place {
  id: string;
  name: string;
  city?: string;
  region?: string;
  country?: string;
  countryCode?: string;
  latitude?: number;
  longitude?: number;
  createdAt: string;
}

export interface Memory {
  id: string;
  placeId: string;
  title?: string;
  date?: string; // 'YYYY-MM-DD' or formatted
  note?: string;
  photoIds?: string[];
  coverImage?: string;
  photoCount?: number;
  createdAt: string;
  updatedAt?: string;
}

export interface SearchResult {
  id: string;
  placeName: string;
  text: string;
  city?: string;
  region?: string;
  country?: string;
  countryCode?: string;
  center?: [number, number]; // [lng, lat]
  existingPlaceId?: string;
  memoriesCount?: number;
}

// Backward-compatibility alias during refactoring if needed
export type GeocodingResult = SearchResult;

export interface PhotoMemory {
  id: string;
  blob?: Blob;
  thumbnail?: string;
  originalFileName: string;
  capturedAt?: string;
  dateSource?: 'exif-datetime-original' | 'exif-createdate' | 'file-lastmodified' | 'manual' | 'unknown';
  latitude?: number;
  longitude?: number;
  placeId?: string;
  note?: string;
  importedAt: string;
}

export interface Journey {
  id: string;
  name: string;
  startDate?: string;
  endDate?: string;
  placeIds: string[];
  photoIds: string[];
}

export interface Postcard {
  id: string;
  title: string;
  placeId?: string;
  memoryId?: string;
  photoIds: string[];
  message: string;
  layout: 'single' | 'double' | 'triptych';
  createdAt: string;
}

export type ActiveTab = 'atlas' | 'journeys' | 'postcards' | 'plan-trip' | 'privacy';

export type TravelPace = 'relaxed' | 'balanced' | 'packed';
export type TripBudget = 'budget' | 'moderate' | 'premium';

export type TripInterest =
  | 'Food'
  | 'Shopping'
  | 'Culture'
  | 'Nature'
  | 'Photography'
  | 'Nightlife'
  | 'Design'
  | 'Local neighborhoods';

export interface DayItinerary {
  dayNumber: number;
  neighborhoodOrArea: string;
  theme?: string;
  morning: string;
  lunch: string;
  afternoon: string;
  evening: string;
  notes?: string;
}

export interface TripPlan {
  id: string;
  destination: string;
  daysCount: number;
  pace: TravelPace;
  interests: string[];
  budget: TripBudget;
  additionalPreferences?: string;
  days: DayItinerary[];
  overview?: string;
  isUpcoming?: boolean;
  createdAt: string;
  updatedAt?: string;
}

