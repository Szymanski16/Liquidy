import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { 
  X, 
  Upload, 
  Camera, 
  Link as LinkIcon, 
  Image as ImageIcon, 
  Sparkles, 
  Flame, 
  Check, 
  AlertCircle,
  HelpCircle,
  Cpu,
  Beaker,
  Clock,
  Droplet
} from 'lucide-react';
import { 
  Liquid, 
  Review, 
  LiquidWithReviews, 
  FlavorCategory, 
  LiquidType, 
  NicotineType, 
  VerdictType 
} from '../types';
import { compressImageFile } from '../lib/imageCompressor';
import { getLastReviewer, setLastReviewer } from '../lib/storage';

interface AddLiquidModalProps {
  isOpen: boolean;
  onClose: () => void;
  liquids: LiquidWithReviews[];
  preselectedLiquid?: LiquidWithReviews | null;
  knownReviewers: string[];
  onSaveNewLiquid: (
    liquidData: Omit<Liquid, 'id' | 'created_at'>,
    imageBlob?: Blob,
    initialReview?: Omit<Review, 'id' | 'liquid_id' | 'created_at'>
  ) => Promise<void>;
  onSaveReview: (
    reviewData: Omit<Review, 'id' | 'created_at'>
  ) => Promise<void>;
}

export const AddLiquidModal: React.FC<AddLiquidModalProps> = ({
  isOpen,
  onClose,
  liquids,
  preselectedLiquid,
  knownReviewers,
  onSaveNewLiquid,
  onSaveReview,
}) => {
  // Mode: 'new_liquid' (Add new bottle + review) or 'add_review' (Add review to existing liquid)
  const [activeTab, setActiveTab] = useState<'new_liquid' | 'add_review'>(
    preselectedLiquid ? 'add_review' : 'new_liquid'
  );

  // Selected liquid ID when adding review to existing
  const [selectedLiquidId, setSelectedLiquidId] = useState<string>(
    preselectedLiquid?.id || (liquids[0]?.id ?? '')
  );

  // Liquid Form state
  const [name, setName] = useState('');
  const [brand, setBrand] = useState('');
  const [type, setType] = useState<LiquidType>('Longfill');
  const [flavorCategory, setFlavorCategory] = useState<FlavorCategory>('Owocowe');
  const [aromaVolume, setAromaVolume] = useState<number>(10);
  
  // Image handling
  const [imageMode, setImageMode] = useState<'upload' | 'url'>('upload');
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [compressedImage, setCompressedImage] = useState<{
    blob: Blob;
    dataUrl: string;
    originalSize: number;
    compressedSize: number;
  } | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Review Form state
  const [includeReview, setIncludeReview] = useState(true);
  const [reviewerName, setReviewerName] = useState(getLastReviewer() || '');
  const [overallRating, setOverallRating] = useState<number>(8.0);
  const [sweetness, setSweetness] = useState<number>(3);
  const [cooling, setCooling] = useState<number>(2);
  const [intensity, setIntensity] = useState<number>(4);
  const [throatHit, setThroatHit] = useState<number>(3);
  const [coilLife, setCoilLife] = useState<number>(4);

  // Hardware & mix context
  const [deviceSetup, setDeviceSetup] = useState('');
  const [coilResistance, setCoilResistance] = useState('0.6 Ω');
  const [nicotineType, setNicotineType] = useState<NicotineType>('Sól (Nicsalt)');
  const [nicotineMg, setNicotineMg] = useState<number>(20);
  const [vgPgRatio, setVgPgRatio] = useState('50/50');
  const [steepingDays, setSteepingDays] = useState<number>(0);

  // Verdict & Comment
  const [verdict, setVerdict] = useState<VerdictType>('ADV (All Day Vape - kupię ponownie)');
  const [comment, setComment] = useState('');

  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // When preselectedLiquid prop changes, update state
  useEffect(() => {
    if (preselectedLiquid) {
      setActiveTab('add_review');
      setSelectedLiquidId(preselectedLiquid.id);
    }
  }, [preselectedLiquid]);

  if (!isOpen) return null;

  // Handle image file selection with client-side compression
  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsCompressing(true);
      setErrorMessage('');
      const originalSize = file.size;

      const result = await compressImageFile(file, 800, 800, 0.75);

      setCompressedImage({
        blob: result.blob,
        dataUrl: result.dataUrl,
        originalSize,
        compressedSize: result.sizeBytes,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setErrorMessage(`Błąd kompresji zdjęcia: ${msg}`);
    } finally {
      setIsCompressing(false);
    }
  };

  const handleRatingChange = (val: number) => {
    setOverallRating(val);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (activeTab === 'new_liquid') {
      if (!name.trim()) {
        setErrorMessage('Podaj nazwę liquidu / smaku.');
        return;
      }
      if (!brand.trim()) {
        setErrorMessage('Podaj markę / producenta (np. Dark Line, A&L, Vampire Vape).');
        return;
      }
    } else {
      if (!selectedLiquidId) {
        setErrorMessage('Wybierz liquid z listy.');
        return;
      }
    }

    if (activeTab === 'add_review' || includeReview) {
      if (!reviewerName.trim()) {
        setErrorMessage('Podaj swoją ksywkę lub imię testera.');
        return;
      }
    }

    setIsSubmitting(true);

    try {
      // Save last used reviewer name
      if (reviewerName.trim()) {
        setLastReviewer(reviewerName.trim());
      }

      const reviewDataPayload: Omit<Review, 'id' | 'liquid_id' | 'created_at'> = {
        reviewer_name: reviewerName.trim(),
        overall_rating: overallRating,
        sweetness,
        cooling,
        intensity,
        throat_hit: throatHit,
        coil_life: coilLife,
        device_setup: deviceSetup.trim() || undefined,
        coil_resistance: coilResistance.trim() || undefined,
        nicotine_type: nicotineType,
        nicotine_mg: nicotineMg,
        vg_pg_ratio: vgPgRatio.trim() || undefined,
        steeping_days: steepingDays,
        verdict,
        comment: comment.trim() || undefined,
      };

      if (activeTab === 'new_liquid') {
        const finalImageUrl = imageMode === 'url' ? imageUrlInput.trim() : (compressedImage?.dataUrl || '');
        const imageBlobToUpload = imageMode === 'upload' ? compressedImage?.blob : undefined;

        await onSaveNewLiquid(
          {
            name: name.trim(),
            brand: brand.trim(),
            type,
            flavor_category: flavorCategory,
            aroma_volume_ml: aromaVolume || undefined,
            image_url: finalImageUrl,
          },
          imageBlobToUpload,
          includeReview ? reviewDataPayload : undefined
        );
      } else {
        await onSaveReview({
          ...reviewDataPayload,
          liquid_id: selectedLiquidId,
        });
      }

      // Confetti celebration if verdict is ADV
      if (verdict.startsWith('ADV')) {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#8b5cf6', '#06b6d4', '#10b981', '#f59e0b'],
        });
      }

      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setErrorMessage(`Błąd podczas zapisywania: ${msg}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedLiquidObj = liquids.find((l) => l.id === selectedLiquidId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-5 overflow-y-auto bg-black/80 backdrop-blur-md animate-fade-in">
      <div 
        className="glass-modal rounded-2xl sm:rounded-3xl w-full max-w-2xl max-h-[94vh] flex flex-col overflow-hidden shadow-2xl border border-slate-800"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-dark-900">
          <div>
            <h2 className="text-xl font-black text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-violet-400" />
              <span>Dodaj Recenzję / Nowy Liquid</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Współdzielone wrażenia ekipy z testów aromatów i gotowych liquidów
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white bg-slate-900 border border-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-2 p-2 bg-dark-950/70 border-b border-slate-800 gap-1 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('new_liquid')}
            className={`py-2 rounded-xl transition-all ${
              activeTab === 'new_liquid'
                ? 'bg-violet-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Nowy Liquid (+ Recenzja)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('add_review')}
            className={`py-2 rounded-xl transition-all ${
              activeTab === 'add_review'
                ? 'bg-violet-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Oceń Istniejący Liquid ({liquids.length})
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 overflow-y-auto space-y-6">
          
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-rose-950/80 border border-rose-500/40 text-rose-200 text-xs flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Datalist for Reviewer Names */}
          <datalist id="reviewer-suggestions">
            {knownReviewers.map((name) => (
              <option key={name} value={name} />
            ))}
          </datalist>

          {/* TAB 1: NEW LIQUID DETAILS */}
          {activeTab === 'new_liquid' ? (
            <div className="space-y-4">
              <div className="text-xs font-bold uppercase tracking-wider text-violet-400 flex items-center gap-1.5">
                <Droplet className="w-4 h-4" />
                1. Dane Liquidu / Longfilla
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Brand */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Marka / Producent *
                  </label>
                  <input
                    type="text"
                    required
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    placeholder="np. Dark Line, A&L, Vampire Vape"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-dark-900 border border-slate-800 text-sm text-white focus:outline-none focus:border-violet-500"
                  />
                </div>

                {/* Name */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Nazwa Smaku / Seria *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="np. Double Apple, Ragnarok"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-dark-900 border border-slate-800 text-sm text-white focus:outline-none focus:border-violet-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Type */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Typ produktu
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as LiquidType)}
                    className="w-full px-3 py-2.5 rounded-xl bg-dark-900 border border-slate-800 text-xs sm:text-sm text-white focus:outline-none focus:border-violet-500"
                  >
                    <option value="Longfill">Longfill (w butelce 60ml)</option>
                    <option value="Gotowy Liquid">Gotowy Liquid (10ml)</option>
                    <option value="Własny Samogon / Aromat">Własny Samogon / Aromat</option>
                  </select>
                </div>

                {/* Flavor Category */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Kategoria smaku
                  </label>
                  <select
                    value={flavorCategory}
                    onChange={(e) => setFlavorCategory(e.target.value as FlavorCategory)}
                    className="w-full px-3 py-2.5 rounded-xl bg-dark-900 border border-slate-800 text-xs sm:text-sm text-white focus:outline-none focus:border-violet-500"
                  >
                    <option value="Owocowe">Owocowe</option>
                    <option value="Menthol / Ice">Menthol / Ice</option>
                    <option value="Deserowe">Deserowe</option>
                    <option value="Kwaśne">Kwaśne</option>
                    <option value="Napoje">Napoje</option>
                    <option value="Tytoniowe">Tytoniowe</option>
                  </select>
                </div>

                {/* Aroma Volume */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Ilość aromatu w butelce
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="1"
                      max="60"
                      value={aromaVolume}
                      onChange={(e) => setAromaVolume(Number(e.target.value))}
                      className="w-full px-3 py-2.5 rounded-xl bg-dark-900 border border-slate-800 text-xs sm:text-sm text-white focus:outline-none focus:border-violet-500"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">ml</span>
                  </div>
                </div>
              </div>

              {/* Photo Upload & Compression */}
              <div className="p-4 rounded-2xl bg-dark-900/80 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                    <Camera className="w-4 h-4 text-cyan-400" />
                    Zdjęcie butelki (Auto-kompresja WebP ~50KB)
                  </span>
                  <div className="flex items-center gap-1 text-[11px]">
                    <button
                      type="button"
                      onClick={() => setImageMode('upload')}
                      className={`px-2 py-0.5 rounded-lg font-medium transition-colors ${
                        imageMode === 'upload' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' : 'text-slate-400'
                      }`}
                    >
                      Aparat / Plik
                    </button>
                    <button
                      type="button"
                      onClick={() => setImageMode('url')}
                      className={`px-2 py-0.5 rounded-lg font-medium transition-colors ${
                        imageMode === 'url' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' : 'text-slate-400'
                      }`}
                    >
                      Link URL
                    </button>
                  </div>
                </div>

                {imageMode === 'upload' ? (
                  <div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={handleImageFileChange}
                      className="hidden"
                    />

                    {compressedImage ? (
                      <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-900 border border-slate-800">
                        <img
                          src={compressedImage.dataUrl}
                          alt="Podgląd"
                          className="w-16 h-16 rounded-lg object-cover border border-slate-700 shrink-0"
                        />
                        <div className="text-xs flex-1">
                          <span className="text-emerald-400 font-bold flex items-center gap-1">
                            <Check className="w-3.5 h-3.5" /> Skompresowano do WebP!
                          </span>
                          <span className="text-slate-400 block mt-0.5">
                            Przed: {(compressedImage.originalSize / 1024).toFixed(0)} KB → Po: {(compressedImage.compressedSize / 1024).toFixed(0)} KB
                          </span>
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="text-violet-400 hover:text-violet-300 font-medium underline mt-1 text-[11px]"
                          >
                            Zmień zdjęcie
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isCompressing}
                        className="w-full py-4 px-3 rounded-xl border border-dashed border-slate-700 hover:border-violet-500 bg-slate-950/40 text-center text-xs text-slate-400 hover:text-white transition-all flex flex-col items-center justify-center gap-1.5"
                      >
                        <Camera className="w-5 h-5 text-violet-400" />
                        <span>{isCompressing ? 'Kompresowanie obrazka...' : 'Zrób zdjęcie aparatem lub wybierz z galerii'}</span>
                        <span className="text-[10px] text-slate-500">Maks. 800px, format WebP</span>
                      </button>
                    )}
                  </div>
                ) : (
                  <div>
                    <input
                      type="url"
                      value={imageUrlInput}
                      onChange={(e) => setImageUrlInput(e.target.value)}
                      placeholder="https://domena.pl/zdjecie-butelki.jpg"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs sm:text-sm text-white focus:outline-none focus:border-violet-500"
                    />
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* TAB 2: SELECT EXISTING LIQUID */
            <div className="space-y-3">
              <label className="block text-xs font-semibold text-slate-300">
                Wybierz oceniany liquid:
              </label>
              <select
                value={selectedLiquidId}
                onChange={(e) => setSelectedLiquidId(e.target.value)}
                className="w-full px-3.5 py-3 rounded-xl bg-dark-900 border border-slate-800 text-sm text-white focus:outline-none focus:border-violet-500 font-medium"
              >
                {liquids.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.brand} – {l.name} ({l.flavor_category}, {l.reviews.length} ocen)
                  </option>
                ))}
              </select>

              {selectedLiquidObj && (
                <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-900/60 border border-slate-800/80">
                  <div className="w-12 h-12 rounded-lg overflow-hidden bg-slate-950 shrink-0">
                    {selectedLiquidObj.image_url ? (
                      <img src={selectedLiquidObj.image_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <Droplet className="w-6 h-6 m-auto mt-3 text-violet-400" />
                    )}
                  </div>
                  <div className="text-xs">
                    <span className="font-bold text-white block">{selectedLiquidObj.name}</span>
                    <span className="text-slate-400">{selectedLiquidObj.brand} • {selectedLiquidObj.flavor_category}</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* SECTION 2: REVIEW FIELDS */}
          <div className="pt-4 border-t border-slate-800 space-y-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-violet-400 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" />
                2. Twoja Recenzja i Ocena
              </span>
            </div>

            {/* Reviewer Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Twoja ksywka / Imię testera *
              </label>
              <input
                type="text"
                list="reviewer-suggestions"
                required
                value={reviewerName}
                onChange={(e) => setReviewerName(e.target.value)}
                placeholder="Wpisz lub wybierz ksywkę z listy..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-dark-900 border border-slate-800 text-sm text-white focus:outline-none focus:border-violet-500"
              />
              <span className="text-[11px] text-slate-500 mt-1 block">
                Zapamiętujemy tę ksywkę na Twoim telefonie do kolejnych ocen.
              </span>
            </div>

            {/* Overall Rating Slider (1.0 - 10.0) */}
            <div className="p-4 rounded-2xl bg-dark-900/90 border border-slate-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-300">
                  Ocena ogólna (1.0 - 10.0)
                </span>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-black text-white">{overallRating.toFixed(1)}</span>
                  <span className="text-xs text-slate-400">/10</span>
                </div>
              </div>
              <input
                type="range"
                min="1.0"
                max="10.0"
                step="0.5"
                value={overallRating}
                onChange={(e) => handleRatingChange(parseFloat(e.target.value))}
                className="w-full h-2 rounded-lg bg-slate-800 appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                <span>1.0 (Tragedia)</span>
                <span>5.0 (Przeciętniak)</span>
                <span>10.0 (Bóg Liquidów)</span>
              </div>
            </div>

            {/* Verdict (3 Buttons) */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">
                Werdykt końcowy *
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setVerdict('ADV (All Day Vape - kupię ponownie)')}
                  className={`p-3 rounded-xl text-xs font-bold flex flex-col items-center gap-1 border transition-all ${
                    verdict.startsWith('ADV')
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500 shadow-lg shadow-amber-500/20'
                      : 'bg-dark-900 text-slate-400 border-slate-800 hover:text-white'
                  }`}
                >
                  <Flame className="w-5 h-5 text-amber-400" />
                  <span>ADV (All Day Vape)</span>
                  <span className="text-[10px] font-normal text-slate-400">Kupię ponownie</span>
                </button>

                <button
                  type="button"
                  onClick={() => setVerdict('Okazjonalnie')}
                  className={`p-3 rounded-xl text-xs font-bold flex flex-col items-center gap-1 border transition-all ${
                    verdict === 'Okazjonalnie'
                      ? 'bg-violet-500/20 text-violet-300 border-violet-500 shadow-lg shadow-violet-500/20'
                      : 'bg-dark-900 text-slate-400 border-slate-800 hover:text-white'
                  }`}
                >
                  <Check className="w-5 h-5 text-violet-400" />
                  <span>Okazjonalnie</span>
                  <span className="text-[10px] font-normal text-slate-400">Do kawy / raz na jakiś czas</span>
                </button>

                <button
                  type="button"
                  onClick={() => setVerdict('Do zlewu (Unikać)')}
                  className={`p-3 rounded-xl text-xs font-bold flex flex-col items-center gap-1 border transition-all ${
                    verdict.startsWith('Do zlewu')
                      ? 'bg-rose-500/20 text-rose-300 border-rose-500 shadow-lg shadow-rose-500/20'
                      : 'bg-dark-900 text-slate-400 border-slate-800 hover:text-white'
                  }`}
                >
                  <AlertCircle className="w-5 h-5 text-rose-400" />
                  <span>Do zlewu</span>
                  <span className="text-[10px] font-normal text-slate-400">Tragedia / Unikać</span>
                </button>
              </div>
            </div>

            {/* Sensory Profile 1-5 Sliders */}
            <div className="space-y-4 p-4 rounded-2xl bg-dark-900/60 border border-slate-800">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300 block">
                Parametry Odczuć (Skala 1 - 5)
              </span>

              {/* Słodycz */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-300 font-medium">Słodycz</span>
                  <span className="font-bold text-amber-400">{sweetness}/5</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={sweetness}
                  onChange={(e) => setSweetness(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-500">
                  <span>1 (Wytrawne / zero cukru)</span>
                  <span>5 (Ulepek / syrop)</span>
                </div>
              </div>

              {/* Chłodzik */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-300 font-medium">Chłodzik (Ice / Koolada)</span>
                  <span className="font-bold text-cyan-400">{cooling}/5</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={cooling}
                  onChange={(e) => setCooling(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-500">
                  <span>1 (Ciepły / Zero chłodu)</span>
                  <span>5 (Arktyka / Brainfreeze)</span>
                </div>
              </div>

              {/* Intensywność */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-300 font-medium">Intensywność aromatu</span>
                  <span className="font-bold text-slate-200">{intensity}/5</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={intensity}
                  onChange={(e) => setIntensity(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-500">
                  <span>1 (Płytki / sama baza)</span>
                  <span>5 (Gęsty i wyrazisty)</span>
                </div>
              </div>

              {/* Throat Hit */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-300 font-medium">Kop w gardło (Throat Hit)</span>
                  <span className="font-bold text-slate-200">{throatHit}/5</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={throatHit}
                  onChange={(e) => setThroatHit(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-500">
                  <span>1 (Gładki jak aksamit)</span>
                  <span>5 (Mocne drapanie)</span>
                </div>
              </div>

              {/* Żywotność Grzałki */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-300 font-medium">Żywotność grzałki / wata</span>
                  <span className={`font-bold ${coilLife <= 2 ? 'text-rose-400' : 'text-emerald-400'}`}>
                    {coilLife}/5
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={coilLife}
                  onChange={(e) => setCoilLife(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-500">
                  <span className="text-rose-400">1 (Coil Killer - pali po 2 dniach!)</span>
                  <span className="text-emerald-400">5 (Czysty jak łza)</span>
                </div>
              </div>
            </div>

            {/* Hardware & Mix Context (Device, Coil, Nicotine, Steeping) */}
            <div className="p-4 rounded-2xl bg-dark-900/60 border border-slate-800 space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300 block">
                Kontekst Sprzętowy i Parametry Mieszanki
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Device */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                    Sprzęt (Pod / Zasilanie)
                  </label>
                  <input
                    type="text"
                    value={deviceSetup}
                    onChange={(e) => setDeviceSetup(e.target.value)}
                    placeholder="np. OXVA Xlim Pro 2, XROS 4, RTA"
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white"
                  />
                </div>

                {/* Coil Resistance */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                    Oporność grzałki
                  </label>
                  <input
                    type="text"
                    value={coilResistance}
                    onChange={(e) => setCoilResistance(e.target.value)}
                    placeholder="np. 0.6 Ω, 0.8 Ω, 0.4 Ω"
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {/* Nicotine Type */}
                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 mb-1">
                    Typ nikotyny
                  </label>
                  <select
                    value={nicotineType}
                    onChange={(e) => setNicotineType(e.target.value as NicotineType)}
                    className="w-full px-2 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white"
                  >
                    <option value="Sól (Nicsalt)">Sól (Nicsalt)</option>
                    <option value="Zwykła (Freebase)">Zwykła (Freebase)</option>
                    <option value="Zerówka (0mg)">Zerówka (0mg)</option>
                  </select>
                </div>

                {/* Nicotine mg */}
                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 mb-1">
                    Moc (mg/ml)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="50"
                    value={nicotineMg}
                    onChange={(e) => setNicotineMg(Number(e.target.value))}
                    className="w-full px-2 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white"
                  />
                </div>

                {/* VG/PG Ratio */}
                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 mb-1">
                    Proporcje VG/PG
                  </label>
                  <input
                    type="text"
                    value={vgPgRatio}
                    onChange={(e) => setVgPgRatio(e.target.value)}
                    placeholder="50/50"
                    className="w-full px-2 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white"
                  />
                </div>

                {/* Steeping days */}
                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 mb-1">
                    Leżakowanie (dni)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="180"
                    value={steepingDays}
                    onChange={(e) => setSteepingDays(Number(e.target.value))}
                    className="w-full px-2 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white"
                  />
                </div>
              </div>
            </div>

            {/* Comment */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Subiektywny opis wrażeń i wskazówki dla ekipy
              </label>
              <textarea
                rows={3}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Napisz jak smakuje, czy czuć chemię, po ilu dniach leżakowania smakuje najlepiej..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-dark-900 border border-slate-800 text-xs sm:text-sm text-white focus:outline-none focus:border-violet-500 placeholder-slate-500"
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs sm:text-sm font-semibold transition-colors"
            >
              Anuluj
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-xs sm:text-sm font-bold shadow-lg shadow-violet-600/30 active:scale-95 transition-all disabled:opacity-50"
            >
              {isSubmitting ? 'Zapisywanie...' : 'Zapisz w Bazie Ekipy'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
