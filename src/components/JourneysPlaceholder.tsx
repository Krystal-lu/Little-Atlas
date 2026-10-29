import { visitDate } from '../utils/dates';
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
    <div className="max-w-4xl mx-auto py-8 px-6 text-[#262D2A]">
      <div className="flex items-center space-x-2 text-xs font-medium uppercase tracking-wider text-[#75523B]">
        <BookOpen className="w-4 h-4" />
        <span>Your memories, in order</span>
      </div>

      <h1 className="font-sans text-3xl font-medium text-[#262D2A] mt-1">
        Timeline
      </h1>
      <p className="text-sm text-[#626B65] mt-1 font-sans">
        Return to a visit by its date. Each memory stays connected to its place.
      </p>

      {sortedMemories.length === 0 ? (
        <div className="mt-8 p-8 rounded-xl bg-[#FFFFFF] border border-dashed border-[#D8D7CE] text-center max-w-lg mx-auto">
          <div className="w-12 h-12 rounded-full bg-[#EEECE5] text-[#626B65] flex items-center justify-center mx-auto mb-3">
            <Compass className="w-6 h-6 stroke-[1.5]" />
          </div>
          <h3 className="font-sans text-lg font-medium text-[#262D2A]">
            No journeys pinned yet.
          </h3>
          <p className="text-xs text-[#626B65] mt-1">
            Pin visited destinations on the Atlas to begin building your chronological travel story.
          </p>
          <button
            onClick={onGoToAtlas}
            className="mt-4 px-4 py-2 bg-[#75523B] text-white rounded-full text-xs font-medium hover:bg-[#523A29] transition-colors"
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
                  <div className="absolute -left-[31px] top-1.5 w-3.5 h-3.5 rounded-full border-2 border-[#FFFFFF] bg-[#75523B] group-hover:scale-125 transition-transform" />

                  <div className="bg-[#FFFFFF] border border-[#D8D7CE] rounded-xl p-5 shadow-xs transition-all group-hover:shadow-md group-hover:border-[#D8D7CE]">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-start space-x-3.5">
                        {mem.coverImage ? (
                          <img
                            src={mem.coverImage}
                            alt={place.name}
                            className="w-14 h-14 object-cover rounded-xl border border-[#D8D7CE] shrink-0"
                          />
                        ) : (
                          <div className="w-14 h-14 rounded-xl bg-[#EEECE5] flex items-center justify-center text-[#626B65] shrink-0">
                            <Camera className="w-5 h-5" />
                          </div>
                        )}
                        <div>
                          <div className="flex items-center space-x-2 text-xs text-[#626B65]">
                            <Calendar className="w-3.5 h-3.5 text-[#75523B]" />
                            <span>
                              {mem.date
                                ? visitDate(mem.date).toLocaleDateString('en-US', {
                                    month: 'long',
                                    day: 'numeric',
                                    year: 'numeric',
                                  })
                                : 'Date not recorded'}
                            </span>
                          </div>
                          <h3 className="font-sans text-xl font-medium text-[#262D2A] mt-0.5">
                            {mem.title || place.name}
                          </h3>
                          <p className="text-xs text-[#626B65]">
                            {place.name}
                            {[place.region, place.country].filter(Boolean).length > 0 &&
                              ` · ${[place.region, place.country].filter(Boolean).join(', ')}`}
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => onSelectPlace(place, mem.id)}
                        className="inline-flex items-center space-x-1 text-xs text-[#75523B] hover:text-[#523A29] font-medium transition-colors self-start sm:self-center shrink-0"
                      >
                        <span>View on Globe</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {mem.note && (
                      <p className="mt-3 p-3 rounded-xl bg-[#F6F5F0]/60 border border-[#EEECE5] text-xs text-[#453D34] font-sans">
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
