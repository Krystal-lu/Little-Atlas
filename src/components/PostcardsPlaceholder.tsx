import React from 'react';
import { Mail, MapPin, ArrowRight } from 'lucide-react';
import { Place, Memory } from '../types';

interface PostcardsPlaceholderProps {
  places: Place[];
  memories: Memory[];
  onSelectPlaceForPostcard: (place: Place, memoryId?: string) => void;
  onGoToAtlas: () => void;
}

export const PostcardsPlaceholder: React.FC<PostcardsPlaceholderProps> = ({
  places,
  memories,
  onSelectPlaceForPostcard,
  onGoToAtlas,
}) => {
  return (
    <div className="max-w-4xl mx-auto py-8 px-6 text-[#2C2723]">
      <div className="flex items-center space-x-2 text-xs font-medium uppercase tracking-wider text-[#9E4F39]">
        <Mail className="w-4 h-4" />
        <span>Postcard Collection</span>
      </div>

      <h1 className="font-serif text-3xl font-medium text-[#2B2621] mt-1">
        Postcards to Keep
      </h1>
      <p className="text-sm text-[#73685C] mt-1">
        Turn your favorite travel moments into tactile, downloadable keepsakes.
      </p>

      {memories.length === 0 ? (
        <div className="mt-8 p-8 rounded-2xl bg-[#FAF6EE] border border-dashed border-[#DDD3BF] text-center max-w-lg mx-auto">
          <div className="w-12 h-12 rounded-full bg-[#EFE6D5] text-[#8D7F6E] flex items-center justify-center mx-auto mb-3">
            <Mail className="w-6 h-6 stroke-[1.5]" />
          </div>
          <h3 className="font-serif text-lg font-medium text-[#2B2621]">
            Your postcard box is empty.
          </h3>
          <p className="text-xs text-[#7A6F62] mt-1">
            Begin by pinning a memory on the Atlas. You can turn any pinned place or photo into an editorial keepsake.
          </p>
          <button
            onClick={onGoToAtlas}
            className="mt-4 px-4 py-2 bg-[#9E4F39] text-white rounded-full text-xs font-medium hover:bg-[#85412E] transition-colors"
          >
            Start on the Atlas
          </button>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {memories.map((mem) => {
            const place = places.find((p) => p.id === mem.placeId);
            if (!place) return null;

            return (
              <div
                key={mem.id}
                className="bg-[#FAF6EE] border border-[#E0D5BF] rounded-2xl p-4 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                {mem.coverImage ? (
                  <div className="aspect-4/3 rounded-xl overflow-hidden border border-[#D9CEBA] bg-[#EDE4D2] mb-3">
                    <img
                      src={mem.coverImage}
                      alt={place.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="aspect-4/3 rounded-xl border border-dashed border-[#D9CEBA] bg-[#F3ECE0] mb-3 flex flex-col items-center justify-center text-center p-3">
                    <Mail className="w-6 h-6 text-[#9A8E7E] mb-1 stroke-[1.5]" />
                    <span className="text-[11px] text-[#7A6E5F] font-serif">Postcard Canvas</span>
                  </div>
                )}

                <div>
                  <div className="flex items-center space-x-1 text-xs text-[#8A7E71]">
                    <MapPin className="w-3 h-3 text-[#B4674E]" />
                    <span className="truncate">{place.country || 'Destination'}</span>
                  </div>
                  <h3 className="font-serif text-lg font-medium text-[#2B2621] mt-0.5">
                    {mem.title || place.name}
                  </h3>
                  {mem.note && (
                    <p className="text-xs text-[#6B6053] mt-1.5 line-clamp-2 italic font-serif">
                      “{mem.note}”
                    </p>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-[#EAE1D1] flex items-center justify-between">
                  <span className="text-[10px] uppercase font-mono tracking-wider text-[#9E9182]">
                    {mem.date ? new Date(mem.date).getFullYear() : 'Keepsake'}
                  </span>
                  <button
                    onClick={() => onSelectPlaceForPostcard(place, mem.id)}
                    className="text-xs text-[#9E4F39] hover:text-[#7A3625] font-medium flex items-center space-x-1"
                  >
                    <span>View location</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
