import React from 'react';
import { BookOpen, Calendar, ArrowRight, Compass, Camera } from 'lucide-react';
import { Place, Memory } from '../types';

interface JourneysPlaceholderProps {
  places: Place[];
  memories: Memory[];
  onSelectPlace: (place: Place, memoryId?: string) => void;
  onGoToAtlas: () => void;
}

export const JourneysPlaceholder: React.FC<JourneysPlaceholderProps> = ({
  places,
  memories,
  onSelectPlace,
  onGoToAtlas,
}) => {
  // Sort memories chronologically (newest first)
  const sortedMemories = [...memories].sort((a, b) => {
    const da = a.date || a.createdAt;
    const db = b.date || b.createdAt;
    return db.localeCompare(da);
  });

  return (
    <div className="max-w-4xl mx-auto py-8 px-6 text-[#2C2723]">
      <div className="flex items-center space-x-2 text-xs font-medium uppercase tracking-wider text-[#9E4F39]">
        <BookOpen className="w-4 h-4" />
        <span>Travel Chronology</span>
      </div>

      <h1 className="font-serif text-3xl font-medium text-[#2B2621] mt-1">
        Your Journeys
      </h1>
      <p className="text-sm text-[#73685C] mt-1 italic font-serif">
        “Some places become stories only after we leave.”
      </p>

      {sortedMemories.length === 0 ? (
        <div className="mt-8 p-8 rounded-2xl bg-[#FAF6EE] border border-dashed border-[#DDD3BF] text-center max-w-lg mx-auto">
          <div className="w-12 h-12 rounded-full bg-[#EFE6D5] text-[#8D7F6E] flex items-center justify-center mx-auto mb-3">
            <Compass className="w-6 h-6 stroke-[1.5]" />
          </div>
          <h3 className="font-serif text-lg font-medium text-[#2B2621]">
            No journeys pinned yet.
          </h3>
          <p className="text-xs text-[#7A6F62] mt-1">
            Pin visited destinations on the Atlas to begin building your chronological travel story.
          </p>
          <button
            onClick={onGoToAtlas}
            className="mt-4 px-4 py-2 bg-[#9E4F39] text-white rounded-full text-xs font-medium hover:bg-[#85412E] transition-colors"
          >
            Return to Atlas
          </button>
        </div>
      ) : (
        <div className="mt-8 space-y-6">
          <div className="border-l-2 border-[#D8CEBA] ml-4 pl-6 space-y-8">
            {sortedMemories.map((mem) => {
              const place = places.find((p) => p.id === mem.placeId);
              if (!place) return null;

              return (
                <div key={mem.id} className="relative group">
                  {/* Timeline node */}
                  <div className="absolute -left-[31px] top-1.5 w-3.5 h-3.5 rounded-full border-2 border-[#FAF6EE] bg-[#C26D53] group-hover:scale-125 transition-transform" />

                  <div className="bg-[#FAF6EE] border border-[#E2D7C2] rounded-2xl p-5 shadow-xs transition-all group-hover:shadow-md group-hover:border-[#C4B79F]">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-start space-x-3.5">
                        {mem.coverImage ? (
                          <img
                            src={mem.coverImage}
                            alt={place.name}
                            className="w-14 h-14 object-cover rounded-xl border border-[#D5C7B0] shrink-0"
                          />
                        ) : (
                          <div className="w-14 h-14 rounded-xl bg-[#EDE4D2] flex items-center justify-center text-[#8D8070] shrink-0">
                            <Camera className="w-5 h-5" />
                          </div>
                        )}
                        <div>
                          <div className="flex items-center space-x-2 text-xs text-[#8A7E71]">
                            <Calendar className="w-3.5 h-3.5 text-[#B4674E]" />
                            <span>
                              {mem.date
                                ? new Date(mem.date).toLocaleDateString('en-US', {
                                    month: 'long',
                                    day: 'numeric',
                                    year: 'numeric',
                                  })
                                : 'Date not recorded'}
                            </span>
                          </div>
                          <h3 className="font-serif text-xl font-medium text-[#2B2621] mt-0.5">
                            {mem.title || place.name}
                          </h3>
                          <p className="text-xs text-[#7A6F62]">
                            {place.name}
                            {[place.region, place.country].filter(Boolean).length > 0 &&
                              ` · ${[place.region, place.country].filter(Boolean).join(', ')}`}
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => onSelectPlace(place, mem.id)}
                        className="inline-flex items-center space-x-1 text-xs text-[#9E4F39] hover:text-[#7A3625] font-medium transition-colors self-start sm:self-center shrink-0"
                      >
                        <span>View on Globe</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {mem.note && (
                      <p className="mt-3 p-3 rounded-xl bg-[#F4EDE0]/60 border border-[#E8DFC9] text-xs text-[#453D34] italic font-serif">
                        “{mem.note}”
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
