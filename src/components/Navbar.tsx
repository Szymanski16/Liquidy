import React from 'react';
import { 
  Flame, 
  Database, 
  Calculator, 
  Plus, 
  Sparkles,
  Wifi,
  WifiOff
} from 'lucide-react';

interface NavbarProps {
  isSupabaseActive: boolean;
  onOpenAddModal: () => void;
  onOpenCalcModal: () => void;
  onOpenConfigModal: () => void;
  liquidsCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  isSupabaseActive,
  onOpenAddModal,
  onOpenCalcModal,
  onOpenConfigModal,
  liquidsCount,
}) => {
  return (
    <>
      {/* Top Navbar */}
      <header className="sticky top-0 z-30 w-full border-b border-slate-800/80 bg-dark-950/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between gap-2">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="relative flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-600 shadow-lg shadow-violet-500/20 text-white shrink-0">
              <Flame className="w-4 h-4 sm:w-5 sm:h-5 text-violet-100" />
              <Sparkles className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-cyan-300 absolute -top-0.5 -right-0.5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-base sm:text-xl tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent truncate">
                  Liquid Reviews
                </span>
                <span className="hidden sm:inline-flex px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded-full bg-violet-500/10 text-violet-300 border border-violet-500/20 shrink-0">
                  Ekipa Hub
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-400 hidden xs:block truncate">
                Katalog i recenzje ({liquidsCount})
              </p>
            </div>
          </div>

          {/* Right Header Actions */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            
            {/* Supabase status indicator button (Visible on both mobile & desktop) */}
            <button
              onClick={onOpenConfigModal}
              title={isSupabaseActive ? 'Baza danych: Supabase Live' : 'Baza danych: Tryb Lokalny Demo'}
              className={`flex items-center gap-1.5 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                isSupabaseActive
                  ? 'bg-emerald-950/40 text-emerald-300 border-emerald-500/40 hover:bg-emerald-900/40'
                  : 'bg-amber-950/40 text-amber-300 border-amber-500/40 hover:bg-amber-900/40'
              }`}
            >
              {isSupabaseActive ? (
                <>
                  <span className="relative flex h-2 w-2 shrink-0">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  <Wifi className="w-3.5 h-3.5 hidden sm:inline" />
                  <span className="text-[11px] sm:text-xs font-bold">Cloud</span>
                </>
              ) : (
                <>
                  <span className="inline-flex rounded-full h-2 w-2 bg-amber-400 shrink-0"></span>
                  <WifiOff className="w-3.5 h-3.5 hidden sm:inline" />
                  <span className="text-[11px] sm:text-xs font-bold">Demo</span>
                </>
              )}
            </button>

            {/* Desktop Only: Calculator Button (Hidden on mobile to prevent overflow; available in bottom nav) */}
            <button
              onClick={onOpenCalcModal}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-slate-900/80 hover:bg-slate-800 text-slate-200 border border-slate-700/60 transition-colors"
            >
              <Calculator className="w-4 h-4 text-cyan-400" />
              <span>Kalkulator</span>
            </button>

            {/* Desktop Only: Supabase / SQL Script Button */}
            <button
              onClick={onOpenConfigModal}
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-slate-900/80 hover:bg-slate-800 text-slate-200 border border-slate-700/60 transition-colors"
            >
              <Database className="w-4 h-4 text-violet-400" />
              <span>Baza & SQL</span>
            </button>

            {/* Desktop Only: Add Liquid Button */}
            <button
              onClick={onOpenAddModal}
              className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white shadow-lg shadow-violet-600/25 border border-violet-400/20 active:scale-95 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Dodaj Liquid</span>
            </button>

          </div>
        </div>
      </header>

      {/* Mobile Floating Bottom Navigation Bar */}
      <nav 
        aria-label="Nawigacja mobilna"
        className="fixed bottom-0 left-0 right-0 z-40 sm:hidden bg-dark-950/95 backdrop-blur-xl border-t border-slate-800/80 px-4 py-1.5"
        style={{ paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom))' }}
      >
        <div className="flex items-center justify-around gap-2 max-w-md mx-auto">
          
          {/* Kalkulator */}
          <button
            onClick={onOpenCalcModal}
            className="flex flex-col items-center justify-center gap-1 py-1 px-4 text-slate-300 hover:text-cyan-400 active:scale-95 transition-transform"
          >
            <div className="w-7 h-7 rounded-lg bg-cyan-950/40 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
              <Calculator className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-semibold tracking-tight">Kalkulator</span>
          </button>

          {/* Główny przycisk dodawania (Center Pill) */}
          <button
            onClick={onOpenAddModal}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-bold text-xs shadow-lg shadow-violet-600/40 active:scale-95 transition-transform -mt-4 border-2 border-dark-950"
          >
            <Plus className="w-4 h-4" />
            <span>Oceń Liquid</span>
          </button>

          {/* Połączenie / Baza */}
          <button
            onClick={onOpenConfigModal}
            className="flex flex-col items-center justify-center gap-1 py-1 px-4 text-slate-300 hover:text-violet-400 active:scale-95 transition-transform"
          >
            <div className="w-7 h-7 rounded-lg bg-violet-950/40 border border-violet-500/20 flex items-center justify-center text-violet-400">
              <Database className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-semibold tracking-tight">Baza & SQL</span>
          </button>

        </div>
      </nav>
    </>
  );
};
