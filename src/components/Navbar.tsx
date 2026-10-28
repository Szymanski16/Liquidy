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
      <header className="sticky top-0 z-30 w-full border-b border-slate-800/80 bg-dark-950/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-600 shadow-lg shadow-violet-500/20 text-white">
              <Flame className="w-5 h-5 text-violet-100" />
              <Sparkles className="w-3 h-3 text-cyan-300 absolute -top-1 -right-1" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg sm:text-xl tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                  Liquid Reviews
                </span>
                <span className="hidden sm:inline-flex px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded-full bg-violet-500/10 text-violet-300 border border-violet-500/20">
                  Ekipa Hub
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden xs:block">
                Katalog i rzetelne oceny longfilli ({liquidsCount})
              </p>
            </div>
          </div>

          {/* Desktop Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Supabase status indicator button */}
            <button
              onClick={onOpenConfigModal}
              title={isSupabaseActive ? 'Baza danych: Supabase Live' : 'Baza danych: Tryb Lokalny Demo (Kliknij, aby podpiąć Supabase)'}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                isSupabaseActive
                  ? 'bg-emerald-950/40 text-emerald-300 border-emerald-500/30 hover:bg-emerald-900/40'
                  : 'bg-amber-950/40 text-amber-300 border-amber-500/30 hover:bg-amber-900/40'
              }`}
            >
              {isSupabaseActive ? (
                <>
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  <Wifi className="w-3.5 h-3.5 hidden sm:inline" />
                  <span className="hidden sm:inline">Supabase Live</span>
                  <span className="sm:hidden text-[11px]">Cloud</span>
                </>
              ) : (
                <>
                  <span className="inline-flex rounded-full h-2 w-2 bg-amber-400"></span>
                  <WifiOff className="w-3.5 h-3.5 hidden sm:inline" />
                  <span className="hidden sm:inline">Tryb Demo</span>
                  <span className="sm:hidden text-[11px]">Demo</span>
                </>
              )}
            </button>

            {/* Calculator Button */}
            <button
              onClick={onOpenCalcModal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-slate-900/80 hover:bg-slate-800 text-slate-200 border border-slate-700/60 transition-colors"
            >
              <Calculator className="w-4 h-4 text-cyan-400" />
              <span className="hidden md:inline">Kalkulator</span>
              <span className="hidden md:inline text-slate-400">Longfilli</span>
            </button>

            {/* Supabase / SQL Script Button */}
            <button
              onClick={onOpenConfigModal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-slate-900/80 hover:bg-slate-800 text-slate-200 border border-slate-700/60 transition-colors"
            >
              <Database className="w-4 h-4 text-violet-400" />
              <span className="hidden lg:inline">Baza & SQL</span>
            </button>

            {/* Add Liquid Button */}
            <button
              onClick={onOpenAddModal}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white shadow-lg shadow-violet-600/25 border border-violet-400/20 active:scale-95 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Dodaj Liquid</span>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Floating Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-30 sm:hidden bg-dark-950/95 backdrop-blur-lg border-t border-slate-800 px-4 py-2 pb-safe">
        <div className="flex items-center justify-around gap-2">
          <button
            onClick={onOpenCalcModal}
            className="flex flex-col items-center gap-1 py-1 px-3 text-slate-300 hover:text-cyan-400 active:scale-95 transition-transform"
          >
            <Calculator className="w-5 h-5 text-cyan-400" />
            <span className="text-[10px] font-medium">Kalkulator</span>
          </button>

          <button
            onClick={onOpenAddModal}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-bold text-xs shadow-lg shadow-violet-600/30 active:scale-95 transition-transform -mt-5 border-2 border-dark-950"
          >
            <Plus className="w-4 h-4" />
            <span>Oceń Liquid</span>
          </button>

          <button
            onClick={onOpenConfigModal}
            className="flex flex-col items-center gap-1 py-1 px-3 text-slate-300 hover:text-violet-400 active:scale-95 transition-transform"
          >
            <Database className="w-5 h-5 text-violet-400" />
            <span className="text-[10px] font-medium">Połączenie</span>
          </button>
        </div>
      </div>
    </>
  );
};
