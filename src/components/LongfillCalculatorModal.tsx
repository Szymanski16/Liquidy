import React, { useState } from 'react';
import { 
  X, 
  Calculator, 
  AlertTriangle, 
  CheckCircle2, 
  Sparkles, 
  Info, 
  RotateCcw,
  Coins
} from 'lucide-react';

interface LongfillCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LongfillCalculatorModal: React.FC<LongfillCalculatorModalProps> = ({
  isOpen,
  onClose,
}) => {
  // Bottle & recipe state
  const [bottleCapacity, setBottleCapacity] = useState<number>(60); // ml
  const [aromaVolume, setAromaVolume] = useState<number>(10);      // ml
  const [shotStrength, setShotStrength] = useState<number>(20);     // mg/ml
  const [targetStrength, setTargetStrength] = useState<number>(6);  // mg/ml

  // Financial inputs (optional)
  const [longfillPrice, setLongfillPrice] = useState<number>(28);   // PLN
  const [shotPrice, setShotPrice] = useState<number>(8.5);         // PLN / 10ml
  const [basePricePer100ml, setBasePricePer100ml] = useState<number>(12); // PLN / 100ml

  if (!isOpen) return null;

  // Space left in bottle for base + shots
  const availableSpace = Math.max(0, bottleCapacity - aromaVolume);

  // Required nicotine in total mg = bottleCapacity * targetStrength
  const totalNicotineNeededMg = bottleCapacity * targetStrength;

  // Milliliters of nicotine shot needed
  const nicShotVolumeNeeded = shotStrength > 0 
    ? Number((totalNicotineNeededMg / shotStrength).toFixed(1))
    : 0;

  // Number of 10ml shot bottles needed
  const shotBottlesCount = (nicShotVolumeNeeded / 10).toFixed(1);

  // Milliliters of 0mg base needed
  const base0mgVolumeNeeded = Number((availableSpace - nicShotVolumeNeeded).toFixed(1));

  // Max achievable strength in this bottle with this shot strength
  const maxPossibleStrength = Number(((availableSpace * shotStrength) / bottleCapacity).toFixed(1));

  // Is target strength impossible?
  const isImpossible = nicShotVolumeNeeded > availableSpace;

  // Financial calculation:
  const totalCost = Number(
    (
      longfillPrice + 
      (nicShotVolumeNeeded / 10) * shotPrice + 
      Math.max(0, base0mgVolumeNeeded / 100) * basePricePer100ml
    ).toFixed(2)
  );
  const costPer10ml = Number(((totalCost / bottleCapacity) * 10).toFixed(2));
  const estimatedStorePricePer10ml = 19.00; // typical 10ml store liquid cost in Poland
  const totalSavings = Number(
    ((estimatedStorePricePer10ml * (bottleCapacity / 10)) - totalCost).toFixed(2)
  );

  // Preset quick buttons
  const applyPreset = (preset: {
    bottle: number;
    aroma: number;
    shot: number;
    target: number;
  }) => {
    setBottleCapacity(preset.bottle);
    setAromaVolume(preset.aroma);
    setShotStrength(preset.shot);
    setTargetStrength(preset.target);
  };

  // Proportions for visual bottle graphic
  const aromaPercent = Math.min(100, (aromaVolume / bottleCapacity) * 100);
  const shotPercent = Math.min(100 - aromaPercent, Math.max(0, (nicShotVolumeNeeded / bottleCapacity) * 100));
  const basePercent = isImpossible
    ? 0
    : Math.max(0, 100 - (aromaPercent + shotPercent));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-5 overflow-y-auto bg-black/80 backdrop-blur-md animate-fade-in">
      <div 
        className="glass-modal rounded-2xl sm:rounded-3xl w-full max-w-2xl max-h-[94vh] flex flex-col overflow-hidden shadow-2xl border border-slate-800"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-dark-900">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center shrink-0">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white tracking-tight">
                Kalkulator Rozrabiania Longfilli
              </h2>
              <p className="text-xs text-slate-400">
                Precyzyjne proporcje shotów, bazy 0mg oraz kalkulacja oszczędności
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white bg-slate-900 border border-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6">
          
          {/* Quick Presets */}
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
              Szybkie Presety:
            </span>
            <div className="flex flex-wrap gap-2 text-xs">
              <button
                type="button"
                onClick={() => applyPreset({ bottle: 60, aroma: 6, shot: 20, target: 12 })}
                className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 font-medium transition-colors"
              >
                60ml (6ml aromat) → 12mg Sól
              </button>
              <button
                type="button"
                onClick={() => applyPreset({ bottle: 60, aroma: 10, shot: 18, target: 6 })}
                className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 font-medium transition-colors"
              >
                60ml (10ml aromat) → 6mg Klasyk
              </button>
              <button
                type="button"
                onClick={() => applyPreset({ bottle: 60, aroma: 10, shot: 18, target: 3 })}
                className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 font-medium transition-colors"
              >
                60ml (10ml aromat) → 3mg Sub-Ohm
              </button>
            </div>
          </div>

          {/* Inputs Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl bg-dark-900/70 border border-slate-800">
            {/* Pojemność butelki */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                Pojemność butelki
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="10"
                  max="500"
                  value={bottleCapacity}
                  onChange={(e) => setBottleCapacity(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white font-bold"
                />
                <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400">ml</span>
              </div>
            </div>

            {/* Ilość aromatu */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                Aromat w butelce
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="1"
                  max={bottleCapacity}
                  value={aromaVolume}
                  onChange={(e) => setAromaVolume(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white font-bold"
                />
                <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400">ml</span>
              </div>
            </div>

            {/* Moc shota */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                Moc shota nikotyny
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={shotStrength}
                  onChange={(e) => setShotStrength(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white font-bold"
                />
                <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400">mg</span>
              </div>
            </div>

            {/* Docelowa moc */}
            <div>
              <label className="block text-[11px] font-semibold text-cyan-300 mb-1">
                Docelowa moc płynu
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  max="50"
                  step="0.5"
                  value={targetStrength}
                  onChange={(e) => setTargetStrength(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-cyan-500/50 text-sm text-cyan-200 font-black"
                />
                <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-cyan-400">mg</span>
              </div>
            </div>
          </div>

          {/* Visual Bottle Representation */}
          <div className="p-4 rounded-2xl bg-dark-900/60 border border-slate-800 space-y-3">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Wizualizacja zawartości butelki ({bottleCapacity} ml):
            </span>

            {/* Progress / Bottle Bar */}
            <div className="h-7 w-full bg-slate-950 rounded-xl overflow-hidden flex border border-slate-800 p-0.5 gap-0.5">
              {/* Aroma */}
              <div
                style={{ width: `${aromaPercent}%` }}
                className="bg-violet-600 rounded-lg flex items-center justify-center text-[10px] font-bold text-white transition-all overflow-hidden"
                title={`Aromat: ${aromaVolume} ml`}
              >
                {aromaPercent > 12 ? `${aromaVolume}ml` : ''}
              </div>

              {/* Nic Shots */}
              <div
                style={{ width: `${shotPercent}%` }}
                className={`${isImpossible ? 'bg-rose-600' : 'bg-cyan-500'} rounded-lg flex items-center justify-center text-[10px] font-bold text-white transition-all overflow-hidden`}
                title={`Shoty: ${nicShotVolumeNeeded} ml`}
              >
                {shotPercent > 12 ? `${nicShotVolumeNeeded}ml` : ''}
              </div>

              {/* Pure Base 0mg */}
              {!isImpossible && basePercent > 0 && (
                <div
                  style={{ width: `${basePercent}%` }}
                  className="bg-emerald-600 rounded-lg flex items-center justify-center text-[10px] font-bold text-white transition-all overflow-hidden"
                  title={`Czysta baza 0mg: ${base0mgVolumeNeeded} ml`}
                >
                  {basePercent > 12 ? `${base0mgVolumeNeeded}ml` : ''}
                </div>
              )}
            </div>

            {/* Legend */}
            <div className="flex flex-wrap items-center justify-between gap-2 text-[11px]">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-violet-600"></span>
                <span className="text-slate-300">Aromat ({aromaVolume} ml)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-500"></span>
                <span className="text-slate-300">Shoty {shotStrength}mg ({nicShotVolumeNeeded} ml)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
                <span className="text-slate-300">Baza 0mg ({isImpossible ? 0 : base0mgVolumeNeeded} ml)</span>
              </div>
            </div>
          </div>

          {/* Results Cards */}
          {isImpossible ? (
            <div className="p-4 rounded-2xl bg-rose-950/70 border border-rose-500/50 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <div className="text-xs sm:text-sm text-rose-200">
                <strong className="font-bold text-white block mb-1">
                  Brak miejsca w butelce na uzyskanie {targetStrength} mg/ml!
                </strong>
                W butelce {bottleCapacity} ml (po odliczeniu {aromaVolume} ml aromatu) zostało tylko {availableSpace} ml wolnego miejsca. Maksymalna możliwa moc przy shotach {shotStrength} mg wynosi <strong className="text-white underline">{maxPossibleStrength} mg/ml</strong>. Użyj mocniejszych shotów (np. 20mg zamiast 18mg) lub zmniejsz moc docelową.
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Shoty do wlania */}
              <div className="glass-card rounded-2xl p-5 border-cyan-500/30 bg-cyan-950/20">
                <span className="text-xs font-bold text-cyan-300 uppercase tracking-wider block mb-1">
                  1. Wlej Shoty Nikotynowe ({shotStrength} mg/ml)
                </span>
                <div className="text-3xl font-black text-white flex items-baseline gap-2">
                  <span>{nicShotVolumeNeeded} ml</span>
                  <span className="text-xs font-normal text-cyan-300">
                    ({shotBottlesCount} butelek 10ml)
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-2">
                  Dla {shotBottlesCount} but. 10ml: wlej {Math.floor(nicShotVolumeNeeded / 10)} pełnych butelek oraz {Number((nicShotVolumeNeeded % 10).toFixed(1))} ml z kolejnej.
                </p>
              </div>

              {/* Baza 0mg do dopełnienia */}
              <div className="glass-card rounded-2xl p-5 border-emerald-500/30 bg-emerald-950/20">
                <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider block mb-1">
                  2. Dopełnij Czystą Bazą (0 mg/ml)
                </span>
                <div className="text-3xl font-black text-white flex items-baseline gap-2">
                  <span>{base0mgVolumeNeeded} ml</span>
                  <span className="text-xs font-normal text-emerald-300">
                    do krawędzi butelki
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-2">
                  Dolej czystą bazę VG/PG (np. 50/50 lub 70/30) do pełna (60 ml), zakręć butelkę i mocno wstrząśnij przez 60 sekund.
                </p>
              </div>

            </div>
          )}

          {/* Financials / Savings Calculator */}
          <div className="p-4 rounded-2xl bg-dark-900/80 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <Coins className="w-4 h-4" />
                Koszty i Oszczędność vs Sklep
              </span>
              <span className="text-xs text-emerald-400 font-bold">
                Oszczędzasz ok. {totalSavings > 0 ? `${totalSavings} PLN` : '0 PLN'} na butelce!
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-[10px] text-slate-400 mb-0.5">Cena Longfilla</label>
                <input
                  type="number"
                  step="0.5"
                  value={longfillPrice}
                  onChange={(e) => setLongfillPrice(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white"
                />
              </div>
              <div>
                <label className="block text-[10px] text-slate-400 mb-0.5">Cena shota (10ml)</label>
                <input
                  type="number"
                  step="0.5"
                  value={shotPrice}
                  onChange={(e) => setShotPrice(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white"
                />
              </div>
              <div>
                <label className="block text-[10px] text-slate-400 mb-0.5">Koszt 100ml bazy 0mg</label>
                <input
                  type="number"
                  step="0.5"
                  value={basePricePer100ml}
                  onChange={(e) => setBasePricePer100ml(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-800/60 text-xs">
              <div>
                <span className="text-slate-400">Łączny koszt butelki: </span>
                <strong className="text-white">{totalCost} PLN</strong>
              </div>
              <div className="text-right">
                <span className="text-slate-400">Koszt za 10 ml: </span>
                <strong className="text-emerald-400 text-sm font-black">{costPer10ml} PLN</strong>
                <span className="text-[10px] text-slate-500 block">w sklepie gotowy ~19.00 PLN</span>
              </div>
            </div>
          </div>

          {/* Action button */}
          <div className="flex justify-end pt-2">
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold transition-all"
            >
              Rozumiem, zamknij
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
