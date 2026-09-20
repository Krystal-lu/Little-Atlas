import React, { useState, useEffect } from 'react';
import {
  Compass,
  Calendar,
  Sparkles,
  MapPin,
  Clock,
  Utensils,
  Sun,
  Coffee,
  Moon,
  BookmarkCheck,
  Send,
  Trash2,
  Check,
  AlertCircle,
  RotateCcw,
  Tag,
  ArrowRight,
} from 'lucide-react';
import {
  TripPlan,
  DayItinerary,
  TravelPace,
  TripBudget,
  TripInterest,
} from '../types';
import {
  getStoredPlans,
  savePlan,
  deleteStoredPlan,
  togglePlanUpcoming,
} from '../utils/storage';

const AVAILABLE_INTERESTS: TripInterest[] = [
  'Food',
  'Shopping',
  'Culture',
  'Nature',
  'Photography',
  'Nightlife',
  'Design',
  'Local neighborhoods',
];

interface PlanTripViewProps {
  onGoToAtlas?: () => void;
}

export const PlanTripView: React.FC<PlanTripViewProps> = () => {
  // Form State
  const [destination, setDestination] = useState('');
  const [daysCount, setDaysCount] = useState<number>(3);
  const [pace, setPace] = useState<TravelPace>('relaxed');
  const [interests, setInterests] = useState<TripInterest[]>([
    'Food',
    'Local neighborhoods',
  ]);
  const [budget, setBudget] = useState<TripBudget>('moderate');
  const [additionalPreferences, setAdditionalPreferences] = useState('');

  // Execution & UI State
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('Putting your trip together…');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [currentPlan, setCurrentPlan] = useState<TripPlan | null>(null);
  const [isSaved, setIsSaved] = useState(false);

  // Revision State
  const [revisionInput, setRevisionInput] = useState('');
  const [isRevising, setIsRevising] = useState(false);

  // Saved Plans list
  const [savedPlans, setSavedPlans] = useState<TripPlan[]>([]);
  const [activeViewMode, setActiveViewMode] = useState<'create' | 'saved'>('create');

  // Load saved plans on mount
  useEffect(() => {
    setSavedPlans(getStoredPlans());
  }, []);

  const toggleInterest = (interest: TripInterest) => {
    if (interests.includes(interest)) {
      setInterests(interests.filter((i) => i !== interest));
    } else {
      setInterests([...interests, interest]);
    }
  };

  // Submit Plan Generation
  const handleCreateTrip = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!destination.trim()) {
      setErrorMessage('Please provide a destination for your journey.');
      return;
    }

    setIsLoading(true);
    setLoadingMessage('Putting your trip together…');
    setErrorMessage(null);
    setIsSaved(false);

    try {
      const response = await fetch('/api/plan-trip', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          destination: destination.trim(),
          daysCount,
          pace,
          interests,
          budget,
          additionalPreferences: additionalPreferences.trim() || undefined,
        }),
      });

      let data: any = null;
      const contentType = response.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        try {
          data = await response.json();
        } catch {
          data = null;
        }
      } else {
        const text = await response.text();
        console.error('Non-JSON response from server:', text);
      }

      if (!response.ok || !data || data.success === false) {
        if (data?.code === 'NO_API_KEY' || response.status === 503) {
          throw new Error(data?.error || 'Trip planning is temporarily unavailable.');
        }
        throw new Error(
          data?.error || 'We couldn’t create your trip plan right now. Please try again.'
        );
      }

      const plan = data.itinerary || data.plan;
      if (plan) {
        setCurrentPlan(plan);
        setIsSaved(false);
      } else {
        throw new Error('We couldn’t create your trip plan right now. Please try again.');
      }
    } catch (err: any) {
      console.error('Plan trip request failed:', err);
      if (err.message) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage('We couldn’t create your trip plan right now. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Submit Revision
  const handleReviseTrip = async (e?: React.FormEvent, customPrompt?: string) => {
    if (e) e.preventDefault();
    const promptToUse = customPrompt || revisionInput;
    if (!promptToUse.trim() || !currentPlan) return;

    setIsRevising(true);
    setLoadingMessage('Updating your journey…');
    setErrorMessage(null);

    try {
      const response = await fetch('/api/revise-trip', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPlan,
          revisionPrompt: promptToUse.trim(),
        }),
      });

      let data: any = null;
      const contentType = response.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        try {
          data = await response.json();
        } catch {
          data = null;
        }
      } else {
        const text = await response.text();
        console.error('Non-JSON response from server during revision:', text);
      }

      if (!response.ok || !data || data.success === false) {
        if (data?.code === 'NO_API_KEY' || response.status === 503) {
          throw new Error(data?.error || 'Trip planning is temporarily unavailable.');
        }
        throw new Error(
          data?.error || 'We couldn’t update your trip plan right now. Please try again.'
        );
      }

      const plan = data.itinerary || data.plan;
      if (plan) {
        setCurrentPlan(plan);
        setRevisionInput('');
        setIsSaved(false);
      } else {
        throw new Error('We couldn’t update your trip plan right now. Please try again.');
      }
    } catch (err: any) {
      console.error('Revision failed:', err);
      if (err.message) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage('We couldn’t update your trip plan right now. Please try again.');
      }
    } finally {
      setIsRevising(false);
    }
  };

  // Save Plan
  const handleSavePlan = () => {
    if (!currentPlan) return;
    const updatedPlans = savePlan(currentPlan);
    setSavedPlans(updatedPlans);
    setIsSaved(true);
  };

  // Toggle Upcoming Status
  const handleToggleUpcoming = (planId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = togglePlanUpcoming(planId);
    setSavedPlans(updated);
    if (currentPlan && currentPlan.id === planId) {
      setCurrentPlan({ ...currentPlan, isUpcoming: !currentPlan.isUpcoming });
    }
  };

  // Delete Plan
  const handleDeletePlan = (planId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = deleteStoredPlan(planId);
    setSavedPlans(updated);
    if (currentPlan && currentPlan.id === planId) {
      setIsSaved(false);
    }
  };

  // Load a Saved Plan into View
  const handleSelectSavedPlan = (plan: TripPlan) => {
    setCurrentPlan(plan);
    setDestination(plan.destination);
    setDaysCount(plan.daysCount);
    setPace(plan.pace);
    setInterests(plan.interests as TripInterest[]);
    setBudget(plan.budget);
    setAdditionalPreferences(plan.additionalPreferences || '');
    setIsSaved(true);
    setErrorMessage(null);
    setActiveViewMode('create');
  };

  // Reset form to create fresh
  const handleStartFresh = () => {
    setCurrentPlan(null);
    setIsSaved(false);
    setErrorMessage(null);
    setRevisionInput('');
  };

  const formatSavedDate = (isoString?: string) => {
    if (!isoString) return 'Recent';
    try {
      const d = new Date(isoString);
      return `Saved ${d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
    } catch {
      return 'Recent';
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-6 text-[#2C2723]">
      {/* Header & Section Title */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4 border-b border-[#E3D9C4] pb-5">
        <div>
          <div className="flex items-center space-x-2 text-xs font-medium uppercase tracking-wider text-[#9E4F39]">
            <Compass className="w-4 h-4" />
            <span>Itinerary Curator</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-medium text-[#2B2621] mt-1 tracking-tight">
            Plan your next little adventure.
          </h1>
          <p className="text-sm text-[#73685C] mt-1.5 font-serif italic">
            “Tell Little Atlas where you’re going and how you want the trip to feel.”
          </p>
        </div>

        {/* Saved Plans shortcut tab */}
        {savedPlans.length > 0 && (
          <div className="flex items-center space-x-2 shrink-0 self-start sm:self-auto">
            <button
              onClick={() => setActiveViewMode('create')}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                activeViewMode === 'create'
                  ? 'bg-[#EAE0CD] text-[#2B2621] shadow-2xs'
                  : 'text-[#7B7063] hover:text-[#2B2621]'
              }`}
            >
              Plan View
            </button>
            <button
              onClick={() => setActiveViewMode('saved')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                activeViewMode === 'saved'
                  ? 'bg-[#EAE0CD] text-[#2B2621] shadow-2xs'
                  : 'text-[#7B7063] hover:text-[#2B2621]'
              }`}
            >
              <BookmarkCheck className="w-3.5 h-3.5 text-[#9E4F39]" />
              <span>Saved Plans</span>
              <span className="ml-1 text-[10px] px-1.5 py-0.2 rounded-full bg-[#DED2BD] text-[#4A4035]">
                {savedPlans.length}
              </span>
            </button>
          </div>
        )}
      </div>

      {/* VIEW MODE: SAVED PLANS LIST */}
      {activeViewMode === 'saved' && (
        <div className="mt-8 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-2xl font-medium text-[#2B2621]">
              Saved Plans
            </h2>
            <button
              onClick={() => setActiveViewMode('create')}
              className="text-xs font-medium text-[#9E4F39] hover:underline flex items-center space-x-1"
            >
              <span>Create new plan</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {savedPlans.map((plan) => (
              <div
                key={plan.id}
                onClick={() => handleSelectSavedPlan(plan)}
                className="group relative bg-[#FAF6EE] border border-[#E2D7C2] hover:border-[#C4B79F] rounded-2xl p-5 shadow-2xs hover:shadow-xs transition-all cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-serif text-xl font-medium text-[#2B2621] group-hover:text-[#9E4F39] transition-colors">
                        {plan.destination}
                      </h3>
                      <p className="text-xs text-[#7A6F62] mt-0.5 font-sans">
                        {plan.daysCount} {plan.daysCount === 1 ? 'day' : 'days'} •{' '}
                        <span className="capitalize">{plan.pace} pace</span>
                      </p>
                    </div>

                    {/* Upcoming badge / toggle */}
                    <button
                      onClick={(e) => handleToggleUpcoming(plan.id, e)}
                      className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full border transition-all ${
                        plan.isUpcoming
                          ? 'bg-[#E7D6C0] border-[#CBB89E] text-[#4A3C2D] font-semibold'
                          : 'bg-transparent border-[#D8CCB5] text-[#8C8071] hover:border-[#BFAF98]'
                      }`}
                      title="Click to toggle upcoming badge"
                    >
                      {plan.isUpcoming ? 'Upcoming' : '+ Mark Upcoming'}
                    </button>
                  </div>

                  {plan.overview && (
                    <p className="text-xs text-[#706456] mt-3 line-clamp-2 italic font-serif leading-relaxed">
                      “{plan.overview}”
                    </p>
                  )}
                </div>

                <div className="mt-5 pt-3 border-t border-[#EFE5D3] flex items-center justify-between text-xs text-[#8A7D6E]">
                  <span className="font-sans text-[11px]">
                    {formatSavedDate(plan.createdAt)}
                  </span>
                  <div className="flex items-center space-x-1.5">
                    <button
                      onClick={(e) => handleDeletePlan(plan.id, e)}
                      className="p-1.5 rounded-md hover:bg-[#F3E2DC] text-[#8C7F72] hover:text-[#9E4F39] transition-colors"
                      title="Delete saved plan"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-[#9E4F39] font-medium flex items-center group-hover:translate-x-0.5 transition-transform text-xs">
                      View itinerary &rarr;
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VIEW MODE: CREATE / VIEW ITINERARY */}
      {activeViewMode === 'create' && (
        <div className="mt-6 space-y-8">
          {/* TRIP SETUP FORM (Only shown when not reviewing an itinerary, or shown as collapsible) */}
          {!currentPlan && (
            <form
              onSubmit={handleCreateTrip}
              className="bg-[#FAF6EE] border border-[#E2D7C2] rounded-2xl p-6 sm:p-8 shadow-xs space-y-6"
            >
              {/* Destination & Days Row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <div className="sm:col-span-2">
                  <label
                    htmlFor="destination-input"
                    className="block text-xs font-medium uppercase tracking-wider text-[#5A5043] mb-1.5"
                  >
                    Destination <span className="text-[#9E4F39]">*</span>
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-[#8C7F70] absolute left-3.5 top-3" />
                    <input
                      id="destination-input"
                      type="text"
                      required
                      value={destination}
                      onChange={(e) => setDestination(e.target.value)}
                      placeholder="e.g. Tokyo, Kyoto, Lisbon, Oaxaca, Copenhagen..."
                      className="w-full bg-[#FCFAF5] border border-[#D5C7B0] focus:border-[#9E4F39] focus:outline-none rounded-xl pl-10 pr-4 py-2.5 text-sm text-[#2B2621] placeholder-[#A59988] transition-colors shadow-2xs font-sans"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="days-input"
                    className="block text-xs font-medium uppercase tracking-wider text-[#5A5043] mb-1.5"
                  >
                    Number of days <span className="text-[#9E4F39]">*</span>
                  </label>
                  <div className="relative">
                    <Calendar className="w-4 h-4 text-[#8C7F70] absolute left-3.5 top-3" />
                    <input
                      id="days-input"
                      type="number"
                      required
                      min={1}
                      max={14}
                      value={daysCount}
                      onChange={(e) =>
                        setDaysCount(Math.max(1, Math.min(14, parseInt(e.target.value) || 1)))
                      }
                      className="w-full bg-[#FCFAF5] border border-[#D5C7B0] focus:border-[#9E4F39] focus:outline-none rounded-xl pl-10 pr-4 py-2.5 text-sm text-[#2B2621] transition-colors shadow-2xs font-sans"
                    />
                  </div>
                </div>
              </div>

              {/* Travel Pace */}
              <div>
                <label className="block text-xs font-medium uppercase tracking-wider text-[#5A5043] mb-2">
                  Travel pace
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {(
                    [
                      { id: 'relaxed', title: 'Relaxed', desc: 'Fewer stops, unhurried wandering' },
                      { id: 'balanced', title: 'Balanced', desc: 'A thoughtful mix of highlights & pauses' },
                      { id: 'packed', title: 'Packed', desc: 'Full days, discovering as much as possible' },
                    ] as const
                  ).map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => setPace(option.id)}
                      className={`text-left p-3.5 rounded-xl border transition-all ${
                        pace === option.id
                          ? 'bg-[#EDE2CD] border-[#B8A48B] text-[#2B2621] shadow-2xs'
                          : 'bg-[#FCFAF5] border-[#DCD0BB] text-[#695D4F] hover:border-[#C4B69E]'
                      }`}
                    >
                      <div className="font-serif text-sm font-medium text-[#2B2621]">
                        {option.title}
                      </div>
                      <p className="text-[11px] text-[#7A6F62] mt-0.5 font-sans leading-tight">
                        {option.desc}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Interests Multi-Select */}
              <div>
                <label className="block text-xs font-medium uppercase tracking-wider text-[#5A5043] mb-2">
                  Interests
                </label>
                <div className="flex flex-wrap gap-2">
                  {AVAILABLE_INTERESTS.map((interest) => {
                    const selected = interests.includes(interest);
                    return (
                      <button
                        key={interest}
                        type="button"
                        onClick={() => toggleInterest(interest)}
                        className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full text-xs transition-all ${
                          selected
                            ? 'bg-[#9E4F39] text-[#FAF6EE] shadow-2xs'
                            : 'bg-[#FCFAF5] border border-[#D5C7B0] text-[#635749] hover:bg-[#F2EADA]'
                        }`}
                      >
                        {selected && <Check className="w-3 h-3" />}
                        <span>{interest}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Budget */}
              <div>
                <label className="block text-xs font-medium uppercase tracking-wider text-[#5A5043] mb-2">
                  Budget
                </label>
                <div className="flex flex-wrap gap-2 sm:gap-3">
                  {(['budget', 'moderate', 'premium'] as TripBudget[]).map((b) => (
                    <button
                      key={b}
                      type="button"
                      onClick={() => setBudget(b)}
                      className={`capitalize px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
                        budget === b
                          ? 'bg-[#EDE2CD] border border-[#B8A48B] text-[#2B2621] shadow-2xs'
                          : 'bg-[#FCFAF5] border border-[#D5C7B0] text-[#6B5F51] hover:bg-[#F2EADA]'
                      }`}
                    >
                      {b}
                    </button>
                  ))}
                </div>
              </div>

              {/* Additional Preferences */}
              <div>
                <label
                  htmlFor="preferences-input"
                  className="block text-xs font-medium uppercase tracking-wider text-[#5A5043] mb-1.5"
                >
                  Additional preferences <span className="text-[#8C8071] font-normal lowercase">(optional)</span>
                </label>
                <textarea
                  id="preferences-input"
                  rows={3}
                  value={additionalPreferences}
                  onChange={(e) => setAdditionalPreferences(e.target.value)}
                  placeholder="I like omakase, quiet neighborhoods, design stores, and I don’t want too many tourist attractions."
                  className="w-full bg-[#FCFAF5] border border-[#D5C7B0] focus:border-[#9E4F39] focus:outline-none rounded-xl p-3.5 text-xs text-[#2B2621] placeholder-[#A59988] transition-colors shadow-2xs font-sans leading-relaxed"
                />
              </div>

              {/* Submit Action */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full sm:w-auto px-7 py-3 rounded-full bg-[#B45A42] hover:bg-[#9B452F] text-[#FAF6EE] font-serif text-sm font-medium tracking-wide transition-all shadow-xs hover:shadow-md flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Create My Trip</span>
                </button>

                <p className="text-[11px] text-[#8C8071] font-serif italic text-center sm:text-right">
                  Curated with care for your personal travel archive.
                </p>
              </div>
            </form>
          )}

          {/* Calm Loading State */}
          {isLoading && (
            <div className="py-16 text-center space-y-3 animate-in fade-in duration-300">
              <div className="w-12 h-12 rounded-full bg-[#EDE3D0] border border-[#D5C6AC] flex items-center justify-center mx-auto text-[#9E4F39]">
                <Compass className="w-6 h-6 animate-spin duration-1000" style={{ animationDuration: '4s' }} />
              </div>
              <h3 className="font-serif text-lg text-[#2B2621] font-medium">
                {loadingMessage}
              </h3>
              <p className="text-xs text-[#7A6F62] font-serif italic max-w-xs mx-auto">
                Finding charming neighborhoods, cozy coffee stops, and gentle afternoon walks...
              </p>
            </div>
          )}

          {/* Error Message */}
          {errorMessage && (
            <div className="p-5 rounded-2xl bg-[#F8EDE8] border border-[#E9CFC7] text-[#8C3E2D] flex items-start space-x-3.5">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-[#9E4F39]" />
              <div className="flex-1 text-xs leading-relaxed">
                <p className="font-medium text-sm text-[#7D3425]">{errorMessage}</p>
                <p className="text-[#8C3E2D] mt-1">
                  You can try refreshing or adjusting your destination request.
                </p>
              </div>
              <button
                onClick={() => setErrorMessage(null)}
                className="text-xs text-[#7D3425] hover:underline font-medium"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* ITINERARY RESULT DISPLAY */}
          {currentPlan && !isLoading && (
            <div className="space-y-8 animate-in fade-in duration-300">
              {/* Trip Overview Bar */}
              <div className="bg-[#FAF6EE] border border-[#E2D7C2] rounded-2xl p-6 sm:p-7 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#EAE0CD] pb-4">
                  <div>
                    <span className="text-[11px] font-mono uppercase tracking-widest text-[#9E4F39] font-medium">
                      Curated Itinerary
                    </span>
                    <h2 className="font-serif text-3xl font-medium text-[#2B2621] mt-0.5">
                      {currentPlan.destination}
                    </h2>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-[#706456] mt-1">
                      <span>{currentPlan.daysCount} days</span>
                      <span>•</span>
                      <span className="capitalize">{currentPlan.pace} pace</span>
                      <span>•</span>
                      <span className="capitalize">{currentPlan.budget}</span>
                      {currentPlan.interests.length > 0 && (
                        <>
                          <span>•</span>
                          <span>{currentPlan.interests.join(', ')}</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Actions: Save & New Trip */}
                  <div className="flex items-center space-x-2.5 shrink-0">
                    <button
                      onClick={handleSavePlan}
                      className={`flex items-center space-x-1.5 px-4 py-2 rounded-full text-xs font-serif font-medium transition-all shadow-2xs ${
                        isSaved
                          ? 'bg-[#E3D8C3] text-[#3D3327] border border-[#C6B69C]'
                          : 'bg-[#B45A42] hover:bg-[#9B452F] text-[#FAF6EE]'
                      }`}
                    >
                      {isSaved ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-[#3D3327]" />
                          <span>Saved in Journal</span>
                        </>
                      ) : (
                        <>
                          <BookmarkCheck className="w-3.5 h-3.5" />
                          <span>Save Trip Plan</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={handleStartFresh}
                      className="px-3.5 py-2 rounded-full border border-[#D5C7B0] hover:bg-[#EFE6D5] text-[#6B5F51] text-xs font-serif transition-colors"
                      title="Create a new trip plan"
                    >
                      New Plan
                    </button>
                  </div>
                </div>

                {currentPlan.overview && (
                  <p className="text-sm font-serif italic text-[#635749] mt-4 leading-relaxed">
                    “{currentPlan.overview}”
                  </p>
                )}
              </div>

              {/* Day-By-Day Editorial Journal View */}
              <div className="space-y-6">
                {currentPlan.days.map((day: DayItinerary, idx: number) => (
                  <div
                    key={day.dayNumber || idx + 1}
                    className="relative bg-[#FCFAF5] border border-[#E3D9C5] rounded-2xl p-6 sm:p-7 shadow-2xs hover:border-[#D0C2A8] transition-colors"
                  >
                    {/* Header: Day number & Area */}
                    <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 border-b border-[#EFE7D8] pb-3 mb-5">
                      <div className="flex items-baseline space-x-3">
                        <span className="font-handwriting text-2xl text-[#9E4F39] font-bold">
                          Day {day.dayNumber || idx + 1}
                        </span>
                        <h3 className="font-serif text-xl sm:text-2xl font-medium text-[#2B2621]">
                          {day.neighborhoodOrArea}
                        </h3>
                      </div>
                      {day.theme && (
                        <span className="text-xs font-serif italic text-[#786E64]">
                          {day.theme}
                        </span>
                      )}
                    </div>

                    {/* Schedule Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-5 gap-x-8 text-xs leading-relaxed">
                      {/* Morning */}
                      <div className="space-y-1">
                        <div className="flex items-center space-x-1.5 text-[#9E4F39] font-medium tracking-wide uppercase text-[11px]">
                          <Sun className="w-3.5 h-3.5" />
                          <span>Morning</span>
                        </div>
                        <p className="text-[#3D352E] font-sans pl-5 leading-normal">
                          {day.morning}
                        </p>
                      </div>

                      {/* Lunch */}
                      <div className="space-y-1">
                        <div className="flex items-center space-x-1.5 text-[#B07238] font-medium tracking-wide uppercase text-[11px]">
                          <Utensils className="w-3.5 h-3.5" />
                          <span>Lunch</span>
                        </div>
                        <p className="text-[#3D352E] font-sans pl-5 leading-normal">
                          {day.lunch}
                        </p>
                      </div>

                      {/* Afternoon */}
                      <div className="space-y-1">
                        <div className="flex items-center space-x-1.5 text-[#5C714D] font-medium tracking-wide uppercase text-[11px]">
                          <Coffee className="w-3.5 h-3.5" />
                          <span>Afternoon</span>
                        </div>
                        <p className="text-[#3D352E] font-sans pl-5 leading-normal">
                          {day.afternoon}
                        </p>
                      </div>

                      {/* Evening */}
                      <div className="space-y-1">
                        <div className="flex items-center space-x-1.5 text-[#4D637B] font-medium tracking-wide uppercase text-[11px]">
                          <Moon className="w-3.5 h-3.5" />
                          <span>Evening</span>
                        </div>
                        <p className="text-[#3D352E] font-sans pl-5 leading-normal">
                          {day.evening}
                        </p>
                      </div>
                    </div>

                    {/* Optional Day Note */}
                    {day.notes && (
                      <div className="mt-4 pt-3 border-t border-[#F2EBDE] text-[11px] text-[#7A6F62] italic font-serif flex items-start space-x-2">
                        <span className="text-[#9E4F39] font-handwriting text-base leading-none">
                          Note:
                        </span>
                        <span>{day.notes}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Subtle Disclaimer Note (Requirement 7) */}
              <p className="text-[11px] text-[#8C8071] text-center font-serif italic py-1">
                Suggestions may change over time. Check current hours and reservations before your trip.
              </p>

              {/* CHAT / REVISION AREA (Requirement 8 & 9) */}
              <div className="bg-[#FAF6EE] border border-[#E2D7C2] rounded-2xl p-6 shadow-xs space-y-4">
                <div className="flex items-center space-x-2 text-xs font-medium uppercase tracking-wider text-[#5A5043]">
                  <RotateCcw className="w-3.5 h-3.5 text-[#9E4F39]" />
                  <span>Adjust your trip</span>
                </div>

                <p className="text-xs text-[#7A6F62] leading-relaxed">
                  Ask to soften a busy afternoon, swap out activities, or tailor neighborhoods. Your unchanged days will be preserved.
                </p>

                {/* Quick Revision Prompts */}
                <div className="flex flex-wrap gap-2 pt-1">
                  {[
                    'Make Day 2 more relaxed…',
                    'Add more shopping…',
                    'I don’t want museums…',
                    'Make dinner more special…',
                  ].map((quick) => (
                    <button
                      key={quick}
                      type="button"
                      onClick={() => handleReviseTrip(undefined, quick.replace('…', ''))}
                      disabled={isRevising}
                      className="text-[11px] font-sans px-3 py-1 rounded-full bg-[#FCFAF5] border border-[#D8CCB5] text-[#665A4C] hover:border-[#9E4F39] hover:text-[#2B2621] transition-all disabled:opacity-50"
                    >
                      {quick}
                    </button>
                  ))}
                </div>

                {/* Revision Input Form */}
                <form
                  onSubmit={(e) => handleReviseTrip(e)}
                  className="flex items-center space-x-2 pt-1"
                >
                  <input
                    type="text"
                    value={revisionInput}
                    onChange={(e) => setRevisionInput(e.target.value)}
                    disabled={isRevising}
                    placeholder="e.g. Make Day 2 more relaxed, or add a vintage bookshop visit..."
                    className="flex-1 bg-[#FCFAF5] border border-[#D5C7B0] focus:border-[#9E4F39] focus:outline-none rounded-xl px-4 py-2.5 text-xs text-[#2B2621] placeholder-[#9E9281] shadow-2xs transition-colors font-sans"
                  />
                  <button
                    type="submit"
                    disabled={isRevising || !revisionInput.trim()}
                    className="px-4 py-2.5 rounded-xl bg-[#9E4F39] hover:bg-[#85412E] text-[#FAF6EE] text-xs font-medium transition-colors shadow-2xs disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1.5 shrink-0"
                  >
                    {isRevising ? (
                      <span className="animate-pulse">Updating…</span>
                    ) : (
                      <>
                        <span>Apply</span>
                        <Send className="w-3 h-3" />
                      </>
                    )}
                  </button>
                </form>

                {isRevising && (
                  <p className="text-[11px] text-[#9E4F39] font-serif italic text-center animate-pulse">
                    Updating your journey…
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
