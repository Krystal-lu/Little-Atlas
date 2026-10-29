import { todayLocal } from '../utils/dates';
import { useDialog } from '../hooks/useDialog';
import React, { useState } from 'react';
import { MapPin, Calendar, X, ImageIcon, Compass } from 'lucide-react';
import { POPULAR_DESTINATIONS } from '../utils/geocoding';
import { compressImageFile } from '../utils/imageCompression';

interface ManualAddModalProps {
  initialCoordinates?: { longitude: number; latitude: number };
  initialName?: string;
  onClose: () => void;
  onSave: (params: {
    name: string;
    city?: string;
    region?: string;
    country: string;
    latitude?: number;
    longitude?: number;
    date: string;
    note?: string;
    coverImage?: string;
  }) => void;
}

const REGION_SHORTCUTS = [
  { label: 'Europe', coords: [10.5, 51.1] as [number, number], country: 'Europe' },
  { label: 'UK & Ireland', coords: [-2.5, 53.5] as [number, number], country: 'United Kingdom' },
  { label: 'Mediterranean', coords: [15.0, 39.0] as [number, number], country: 'Italy' },
  { label: 'Japan', coords: [138.2, 36.2] as [number, number], country: 'Japan' },
  { label: 'SE Asia', coords: [101.5, 13.0] as [number, number], country: 'Thailand' },
  { label: 'North America', coords: [-98.0, 39.0] as [number, number], country: 'United States' },
  { label: 'South America', coords: [-60.0, -18.0] as [number, number], country: 'Brazil' },
  { label: 'Oceania', coords: [140.0, -30.0] as [number, number], country: 'Australia' },
  { label: 'Africa', coords: [20.0, 5.0] as [number, number], country: 'Kenya' },
];

export const ManualAddModal: React.FC<ManualAddModalProps> = ({
  initialCoordinates,
  initialName = '',
  onClose,
  onSave,
}) => {
  const dialogRef = useDialog(onClose);
  const [name, setName] = useState(initialName);
  const [city, setCity] = useState('');
  const [region, setRegion] = useState('');
  const [country, setCountry] = useState('');

  // Coordinates are strictly OPTIONAL
  const [latitude, setLatitude] = useState<string>(
    initialCoordinates ? (Math.round(initialCoordinates.latitude * 1000) / 1000).toString() : ''
  );
  const [longitude, setLongitude] = useState<string>(
    initialCoordinates ? (Math.round(initialCoordinates.longitude * 1000) / 1000).toString() : ''
  );
  const [showCoordinateTuning, setShowCoordinateTuning] = useState(Boolean(initialCoordinates));

  // Memory fields
  const [visitedDate, setVisitedDate] = useState(() => todayLocal());
  const [note, setNote] = useState('');
  const [coverImage, setCoverImage] = useState('');

  // Auto-suggest country/coordinates if user types a known popular destination
  const handleNameChange = (val: string) => {
    setName(val);
    const match = POPULAR_DESTINATIONS.find(
      (d) => d.text.toLowerCase() === val.trim().toLowerCase()
    );
    if (match) {
      if (!country && match.country) setCountry(match.country);
      if (!region && match.region) setRegion(match.region);
      if (!city && match.city) setCity(match.city);
      if (!latitude && !longitude && match.center) {
        setLongitude((Math.round(match.center[0] * 1000) / 1000).toString());
        setLatitude((Math.round(match.center[1] * 1000) / 1000).toString());
      }
    }
  };

  const handleSelectShortcut = (coords: [number, number], fallbackCountry: string) => {
    setLongitude(coords[0].toString());
    setLatitude(coords[1].toString());
    setShowCoordinateTuning(true);
    if (!country) {
      setCountry(fallbackCountry);
    }
  };

  const handleImageFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const compressedDataUrl = await compressImageFile(file);
      setCoverImage(compressedDataUrl);
    } catch (err) {
      console.warn('Image compression fallback:', err);
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setCoverImage(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const latNum = latitude.trim() !== '' ? parseFloat(latitude) : undefined;
    const lngNum = longitude.trim() !== '' ? parseFloat(longitude) : undefined;

    onSave({
      name: name.trim(),
      city: city.trim() || undefined,
      region: region.trim() || undefined,
      country: country.trim() || 'Unknown',
      latitude: typeof latNum === 'number' && !isNaN(latNum) ? latNum : undefined,
      longitude: typeof lngNum === 'number' && !isNaN(lngNum) ? lngNum : undefined,
      date: visitedDate || todayLocal(),
      note: note.trim() || undefined,
      coverImage: coverImage || undefined,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#262D2A]/35 backdrop-blur-xs animate-in fade-in-50 duration-200">
      <div ref={dialogRef} role="dialog" aria-modal="true" aria-label="What do you want to remember?"
        className="relative w-full max-w-lg bg-[#FFFFFF] border border-[#D8D7CE] rounded-xl shadow-2xl overflow-hidden p-6 sm:p-7 text-[#262D2A] max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-full text-[#626B65] hover:text-[#262D2A] hover:bg-[#EEECE5] transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Title */}
        <div className="flex items-center space-x-2 text-xs font-sans text-[#75523B]">
          <MapPin className="w-4 h-4" />
          <span>New memory</span>
        </div>
        <h2 className="font-sans text-2xl font-medium text-[#262D2A] mt-1">
          What do you want to remember?
        </h2>
        <p className="text-xs text-[#626B65] mt-1 leading-relaxed">
          Choose a place, add the date, and write down the part a photo cannot tell.
        </p>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {/* Destination Name */}
          <div>
            <label htmlFor="memory-field-1" className="block text-[11px] font-medium tracking-wide uppercase text-[#626B65] mb-1">
              Place name *
            </label>
            <input id="memory-field-1"
              type="text"
              required
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="e.g. Kyoto, Paris, Cotswolds, Grandma’s Cabin"
              className="w-full px-3.5 py-2.5 bg-[#FFFFFF] border border-[#D8D7CE] rounded-xl text-sm text-[#262D2A] placeholder-[#69716B] focus:outline-none focus:border-[#75523B] focus:ring-2 focus:ring-[#75523B]/15"
              autoFocus
            />
          </div>

          {/* City / Region / Country */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label htmlFor="memory-field-2" className="block text-[10px] font-medium tracking-wide uppercase text-[#626B65] mb-1">
                City (Optional)
              </label>
              <input id="memory-field-2"
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="e.g. Florence"
                className="w-full px-3 py-2 bg-[#FFFFFF] border border-[#D8D7CE] rounded-xl text-xs text-[#262D2A]"
              />
            </div>
            <div>
              <label htmlFor="memory-field-3" className="block text-[10px] font-medium tracking-wide uppercase text-[#626B65] mb-1">
                Region (Optional)
              </label>
              <input id="memory-field-3"
                type="text"
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                placeholder="e.g. Tuscany"
                className="w-full px-3 py-2 bg-[#FFFFFF] border border-[#D8D7CE] rounded-xl text-xs text-[#262D2A]"
              />
            </div>
            <div>
              <label htmlFor="memory-field-4" className="block text-[10px] font-medium tracking-wide uppercase text-[#626B65] mb-1">
                Country *
              </label>
              <input id="memory-field-4"
                type="text"
                required
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                placeholder="e.g. Italy"
                className="w-full px-3 py-2 bg-[#FFFFFF] border border-[#D8D7CE] rounded-xl text-xs text-[#262D2A]"
              />
            </div>
          </div>

          {/* Date Visited */}
          <div>
            <label htmlFor="visit-date" className="block text-[11px] font-medium tracking-wide uppercase text-[#626B65] mb-1">
              Date Visited
            </label>
            <div className="relative">
              <Calendar className="w-4 h-4 absolute left-3 top-2.5 text-[#626B65]" />
              <input
                id="visit-date" aria-label="Date visited" type="date"
                value={visitedDate}
                onChange={(e) => setVisitedDate(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-[#FFFFFF] border border-[#D8D7CE] rounded-xl text-sm text-[#262D2A]"
              />
            </div>
          </div>

          {/* Personal Note */}
          <div>
            <label htmlFor="memory-field-7" className="block text-[11px] font-medium tracking-wide uppercase text-[#626B65] mb-1">
              Personal Memory Note
            </label>
            <textarea aria-label="Personal memory note" id="memory-field-7"
              rows={2}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="What made this trip memorable?"
              className="w-full px-3.5 py-2.5 bg-[#FFFFFF] border border-[#D8D7CE] rounded-xl text-sm text-[#262D2A] placeholder-[#69716B] focus:outline-none focus:border-[#75523B] font-sans leading-relaxed"
            />
          </div>

          {/* Optional Photo Attachment */}
          <div>
            <label className="block text-[11px] font-medium tracking-wide uppercase text-[#626B65] mb-1">
              Memory Photo (Optional)
            </label>
            <div className="flex items-center space-x-3">
              <label className="cursor-pointer inline-flex items-center space-x-2 px-3 py-1.5 rounded-xl border border-dashed border-[#69716B] bg-[#FFFFFF] hover:bg-[#F6F5F0] text-xs text-[#626B65] transition-colors">
                <ImageIcon className="w-3.5 h-3.5 text-[#75523B]" />
                <span>Upload a snapshot</span>
                <input aria-label="Memory photo" type="file" accept="image/*" onChange={handleImageFile} className="hidden" />
              </label>
              {coverImage && (
                <div className="flex items-center space-x-2 text-xs text-[#626B65]">
                  <img
                    src={coverImage}
                    alt="Preview"
                    className="w-7 h-7 object-cover rounded-md border border-[#D8D7CE]"
                  />
                  <span className="text-[11px] text-[#262D2A] font-medium">Photo attached</span>
                  <button
                    type="button"
                    onClick={() => setCoverImage('')}
                    className="text-[#75523B] hover:underline text-[10px]"
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <details className="atlas-advanced"><summary>Adjust map location (optional)</summary>          {/* Globe Placement & Coordinates (OPTIONAL) */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="memory-field-5" className="block text-[11px] font-medium tracking-wide uppercase text-[#626B65]">
                Globe Placement (Optional)
              </label>
              <button
                type="button"
                onClick={() => setShowCoordinateTuning(!showCoordinateTuning)}
                className="text-[11px] text-[#75523B] hover:underline font-sans"
              >
                {showCoordinateTuning ? 'Hide coordinates' : '+ Specify coordinates (Lat/Lng)'}
              </button>
            </div>

            {/* Quick region shortcuts to set approximate coords */}
            <div className="flex flex-wrap gap-1.5">
              {REGION_SHORTCUTS.map((sc) => (
                <button
                  key={sc.label}
                  type="button"
                  onClick={() => handleSelectShortcut(sc.coords, sc.country)}
                  className="px-2.5 py-1 text-[11px] font-medium rounded-full bg-[#EEECE5] text-[#626B65] hover:bg-[#EEECE5] hover:text-[#262D2A] transition-colors"
                >
                  {sc.label}
                </button>
              ))}
            </div>

            {showCoordinateTuning && (
              <div className="grid grid-cols-2 gap-3 mt-2.5 p-3 rounded-xl bg-[#F4EFE4] border border-[#D8D7CE]">
                <div>
                  <label className="block text-[10px] uppercase font-semibold text-[#626B65] mb-0.5">
                    Latitude (-90 to 90)
                  </label>
                  <input id="memory-field-5"
                    type="number"
                    step="any"
                    min="-90"
                    max="90"
                    value={latitude}
                    onChange={(e) => setLatitude(e.target.value)}
                    placeholder="e.g. 35.68"
                    className="w-full px-2.5 py-1.5 bg-[#FFFFFF] border border-[#D8D7CE] rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label htmlFor="memory-field-6" className="block text-[10px] uppercase font-semibold text-[#626B65] mb-0.5">
                    Longitude (-180 to 180)
                  </label>
                  <input id="memory-field-6"
                    type="number"
                    step="any"
                    min="-180"
                    max="180"
                    value={longitude}
                    onChange={(e) => setLongitude(e.target.value)}
                    placeholder="e.g. 139.76"
                    className="w-full px-2.5 py-1.5 bg-[#FFFFFF] border border-[#D8D7CE] rounded-lg text-xs"
                  />
                </div>
              </div>
            )}
          </div>

</details>
          <div className="pt-3 flex items-center justify-end space-x-3 border-t border-[#E8DFC8]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-[#626B65] hover:text-[#262D2A] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name.trim()}
              className="px-5 py-2.5 rounded-full bg-[#75523B] hover:bg-[#523A29] text-[#FFFFFF] font-sans font-medium text-xs tracking-wide shadow-sm hover:shadow transition-all disabled:opacity-50 cursor-pointer flex items-center space-x-1.5"
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>Save memory</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
