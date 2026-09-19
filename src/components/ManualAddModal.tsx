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
  const [visitedDate, setVisitedDate] = useState(() => new Date().toISOString().split('T')[0]);
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
      date: visitedDate || new Date().toISOString().split('T')[0],
      note: note.trim() || undefined,
      coverImage: coverImage || undefined,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2C2723]/35 backdrop-blur-xs animate-in fade-in-50 duration-200">
      <div
        className="relative w-full max-w-lg bg-[#FAF5EB] border border-[#DED4C0] rounded-3xl shadow-2xl overflow-hidden p-6 sm:p-7 text-[#2C2723] max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-full text-[#7A6F62] hover:text-[#2C2723] hover:bg-[#EFE6D5] transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Title */}
        <div className="flex items-center space-x-2 text-xs font-serif italic text-[#B45A42]">
          <MapPin className="w-4 h-4" />
          <span>Manual Place & Memory Entry</span>
        </div>
        <h2 className="font-serif text-2xl font-medium text-[#2B2621] mt-1">
          Pin a Place to Your Atlas
        </h2>
        <p className="text-xs text-[#7A6F62] mt-1 leading-relaxed">
          Record any destination, countryside retreat, or personal memory. Works 100% offline
          without any external API.
        </p>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {/* Destination Name */}
          <div>
            <label className="block text-[11px] font-medium tracking-wide uppercase text-[#6E6457] mb-1">
              Destination / Memory Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="e.g. Kyoto, Paris, Cotswolds, Grandma’s Cabin"
              className="w-full px-3.5 py-2.5 bg-[#FFFDF9] border border-[#D8CCA8] rounded-xl text-sm text-[#2C2723] placeholder-[#9E9385] focus:outline-none focus:border-[#B45A42] focus:ring-2 focus:ring-[#B45A42]/15"
              autoFocus
            />
          </div>

          {/* City / Region / Country */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[10px] font-medium tracking-wide uppercase text-[#6E6457] mb-1">
                City (Optional)
              </label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="e.g. Florence"
                className="w-full px-3 py-2 bg-[#FFFDF9] border border-[#D8CCA8] rounded-xl text-xs text-[#2C2723]"
              />
            </div>
            <div>
              <label className="block text-[10px] font-medium tracking-wide uppercase text-[#6E6457] mb-1">
                Region (Optional)
              </label>
              <input
                type="text"
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                placeholder="e.g. Tuscany"
                className="w-full px-3 py-2 bg-[#FFFDF9] border border-[#D8CCA8] rounded-xl text-xs text-[#2C2723]"
              />
            </div>
            <div>
              <label className="block text-[10px] font-medium tracking-wide uppercase text-[#6E6457] mb-1">
                Country *
              </label>
              <input
                type="text"
                required
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                placeholder="e.g. Italy"
                className="w-full px-3 py-2 bg-[#FFFDF9] border border-[#D8CCA8] rounded-xl text-xs text-[#2C2723]"
              />
            </div>
          </div>

          {/* Globe Placement & Coordinates (OPTIONAL) */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-[11px] font-medium tracking-wide uppercase text-[#6E6457]">
                Globe Placement (Optional)
              </label>
              <button
                type="button"
                onClick={() => setShowCoordinateTuning(!showCoordinateTuning)}
                className="text-[11px] text-[#B45A42] hover:underline font-serif italic"
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
                  className="px-2.5 py-1 text-[11px] font-medium rounded-full bg-[#EFE6D5] text-[#4A4035] hover:bg-[#E4D8C3] hover:text-[#2C2723] transition-colors"
                >
                  {sc.label}
                </button>
              ))}
            </div>

            {showCoordinateTuning && (
              <div className="grid grid-cols-2 gap-3 mt-2.5 p-3 rounded-xl bg-[#F4EFE4] border border-[#DDD3BF]">
                <div>
                  <label className="block text-[10px] uppercase font-semibold text-[#7A6F62] mb-0.5">
                    Latitude (-90 to 90)
                  </label>
                  <input
                    type="number"
                    step="any"
                    min="-90"
                    max="90"
                    value={latitude}
                    onChange={(e) => setLatitude(e.target.value)}
                    placeholder="e.g. 35.68"
                    className="w-full px-2.5 py-1.5 bg-[#FFFDF9] border border-[#D5C7B3] rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-semibold text-[#7A6F62] mb-0.5">
                    Longitude (-180 to 180)
                  </label>
                  <input
                    type="number"
                    step="any"
                    min="-180"
                    max="180"
                    value={longitude}
                    onChange={(e) => setLongitude(e.target.value)}
                    placeholder="e.g. 139.76"
                    className="w-full px-2.5 py-1.5 bg-[#FFFDF9] border border-[#D5C7B3] rounded-lg text-xs"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Date Visited */}
          <div>
            <label className="block text-[11px] font-medium tracking-wide uppercase text-[#6E6457] mb-1">
              Date Visited
            </label>
            <div className="relative">
              <Calendar className="w-4 h-4 absolute left-3 top-2.5 text-[#8C7F72]" />
              <input
                type="date"
                value={visitedDate}
                onChange={(e) => setVisitedDate(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-[#FFFDF9] border border-[#D8CCA8] rounded-xl text-sm text-[#2C2723]"
              />
            </div>
          </div>

          {/* Personal Note */}
          <div>
            <label className="block text-[11px] font-medium tracking-wide uppercase text-[#6E6457] mb-1">
              Personal Memory Note
            </label>
            <textarea
              rows={2}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="What made this trip memorable?"
              className="w-full px-3.5 py-2.5 bg-[#FFFDF9] border border-[#D8CCA8] rounded-xl text-sm text-[#2C2723] placeholder-[#9E9385] focus:outline-none focus:border-[#B45A42] font-serif leading-relaxed"
            />
          </div>

          {/* Optional Photo Attachment */}
          <div>
            <label className="block text-[11px] font-medium tracking-wide uppercase text-[#6E6457] mb-1">
              Memory Photo (Optional)
            </label>
            <div className="flex items-center space-x-3">
              <label className="cursor-pointer inline-flex items-center space-x-2 px-3 py-1.5 rounded-xl border border-dashed border-[#BBAE9A] bg-[#FFFDF9] hover:bg-[#F5EDE0] text-xs text-[#5E5346] transition-colors">
                <ImageIcon className="w-3.5 h-3.5 text-[#B45A42]" />
                <span>Upload a snapshot</span>
                <input type="file" accept="image/*" onChange={handleImageFile} className="hidden" />
              </label>
              {coverImage && (
                <div className="flex items-center space-x-2 text-xs text-[#4A4035]">
                  <img
                    src={coverImage}
                    alt="Preview"
                    className="w-7 h-7 object-cover rounded-md border border-[#D8CCA8]"
                  />
                  <span className="text-[11px] text-[#2C2723] font-medium">Photo attached</span>
                  <button
                    type="button"
                    onClick={() => setCoverImage('')}
                    className="text-[#B45A42] hover:underline text-[10px]"
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="pt-3 flex items-center justify-end space-x-3 border-t border-[#E8DFC8]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-[#6B6053] hover:text-[#2C2723] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name.trim()}
              className="px-5 py-2.5 rounded-full bg-[#B45A42] hover:bg-[#9B452F] text-[#FAF6EE] font-serif font-medium text-xs tracking-wide shadow-sm hover:shadow transition-all disabled:opacity-50 cursor-pointer flex items-center space-x-1.5"
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>Pin Memory to Atlas</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
