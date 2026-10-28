import React from 'react';
import { 
  Search, 
  X, 
  SlidersHorizontal, 
  Sparkles, 
  Flame, 
  Snowflake, 
  Zap, 
  Trash2, 
  ShieldCheck, 
  ArrowUpDown,
  User
} from 'lucide-react';
import { FlavorCategory, FilterState, QuickFilterPill, SortOption } from '../types';

interface FilterBarProps {
  filter: FilterState;
  onChangeFilter: (newFilter: FilterState) => void;
  availableReviewers: string[];
  totalResults: number;
}

const CATEGORIES: (FlavorCategory | 'Wszystkie')[] = [
  'Wszystkie',
  'Owocowe',
  'Menthol / Ice',
  'Deserowe',
  'Kwaśne',
  'Napoje',
  'Tytoniowe',
];

export const FilterBar: React.FC<FilterBarProps> = ({
  filter,
  onChangeFilter,
  availableReviewers,
  totalResults,
}) => {
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChangeFilter({ ...filter, searchQuery: e.target.value });
  };

  const handleClearSearch = () => {
    onChangeFilter({ ...filter, searchQuery: '' });
  };

  const handleCategoryChange = (cat: FlavorCategory | 'Wszystkie') => {
    onChangeFilter({ ...filter, category: cat });
  };

  const handleQuickPillChange = (pill: QuickFilterPill) => {
    onChangeFilter({
      ...filter,
      quickFilter: filter.quickFilter === pill ? 'all' : pill,
    });
  };

  const handleReviewerChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChangeFilter({ ...filter, reviewer: e.target.value });
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChangeFilter({ ...filter, sortBy: e.target.value as SortOption });
  };

  const isAnyFilterActive =
    filter.searchQuery.trim() !== '' ||
    filter.category !== 'Wszystkie' ||
    filter.reviewer !== 'Wszyscy' ||
    filter.quickFilter !== 'all' ||
    filter.sortBy !== 'rating_desc';

  const resetAllFilters = () => {
    onChangeFilter({
      searchQuery: '',
      category: 'Wszystkie',
      reviewer: 'Wszyscy',
      quickFilter: 'all',
      sortBy: 'rating_desc',
    });
  };

  return (
    <div className="space-y-4 mb-6">
      {/* Search Input & Selectors Row */}
      <div className="flex flex-col md:flex-row gap-2.5 sm:gap-3 items-stretch md:items-center">
        
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={filter.searchQuery}
            onChange={handleSearchChange}
            placeholder="Szukaj po smaku, marce, opisie lub sprzęcie..."
            className="w-full pl-10 pr-9 py-2.5 rounded-xl bg-dark-900/90 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all shadow-inner"
          />
          {filter.searchQuery && (
            <button
              onClick={handleClearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-0.5 rounded-md"
              title="Wyczyść szukanie"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Reviewer Filter Select */}
        <div className="flex items-center gap-2">
          <div className="relative min-w-[160px] flex-1 sm:flex-initial">
            <User className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-cyan-400 pointer-events-none" />
            <select
              value={filter.reviewer}
              onChange={handleReviewerChange}
              className="w-full pl-8 pr-8 py-2.5 rounded-xl bg-dark-900/90 border border-slate-800 text-xs sm:text-sm text-slate-200 focus:outline-none focus:border-cyan-500 appearance-none cursor-pointer"
            >
              <option value="Wszyscy">Ekipa: Wszyscy</option>
              {availableReviewers.map((name) => (
                <option key={name} value={name}>
                  Tester: {name}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">
              ▼
            </div>
          </div>

          {/* Sort Select */}
          <div className="relative min-w-[160px] flex-1 sm:flex-initial">
            <ArrowUpDown className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-violet-400 pointer-events-none" />
            <select
              value={filter.sortBy}
              onChange={handleSortChange}
              className="w-full pl-8 pr-8 py-2.5 rounded-xl bg-dark-900/90 border border-slate-800 text-xs sm:text-sm text-slate-200 focus:outline-none focus:border-violet-500 appearance-none cursor-pointer"
            >
              <option value="rating_desc">Najwyższa średnia</option>
              <option value="reviews_count">Najwięcej ocen</option>
              <option value="newest">Najnowsze</option>
              <option value="controversial">⚡ Podzielone opinie</option>
              <option value="coil_friendly">Czysta grzałka</option>
              <option value="rating_asc">Najniższa ocena</option>
            </select>
            <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">
              ▼
            </div>
          </div>
        </div>
      </div>

      {/* Flavor Category Horizontal Scrollable Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none no-scrollbar text-xs">
        {CATEGORIES.map((cat) => {
          const isSelected = filter.category === cat;
          return (
            <button
              key={cat}
              onClick={() => handleCategoryChange(cat)}
              className={`px-3 py-1.5 rounded-xl font-medium whitespace-nowrap transition-all border ${
                isSelected
                  ? 'bg-violet-600 text-white border-violet-500 shadow-md shadow-violet-600/30'
                  : 'bg-dark-900/80 hover:bg-slate-800 text-slate-300 border-slate-800/80 hover:text-white'
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* Quick Pills (Tylko ADV, Bez Chłodzika, Przyjazne Grzałkom, Kontrowersyjne, Do Zlewu) */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-800/50 text-xs">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-slate-500 text-[11px] font-semibold uppercase tracking-wider mr-1 hidden sm:inline">
            Filtry:
          </span>

          {/* ADV Only */}
          <button
            onClick={() => handleQuickPillChange('adv_only')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-medium transition-all border ${
              filter.quickFilter === 'adv_only'
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-sm shadow-amber-500/20'
                : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:text-slate-200'
            }`}
          >
            <Flame className="w-3 h-3 text-amber-400" />
            <span>Tylko ADV</span>
          </button>

          {/* Bez chłodzika */}
          <button
            onClick={() => handleQuickPillChange('no_cooling')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-medium transition-all border ${
              filter.quickFilter === 'no_cooling'
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 shadow-sm shadow-cyan-500/20'
                : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:text-slate-200'
            }`}
          >
            <Snowflake className="w-3 h-3 text-cyan-400" />
            <span>Bez chłodzika (Zero Ice)</span>
          </button>

          {/* Przyjazne grzałkom */}
          <button
            onClick={() => handleQuickPillChange('coil_friendly')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-medium transition-all border ${
              filter.quickFilter === 'coil_friendly'
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 shadow-sm shadow-emerald-500/20'
                : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="w-3 h-3 text-emerald-400" />
            <span>Czysta wata (Coil ≥ 4)</span>
          </button>

          {/* Kontrowersyjne */}
          <button
            onClick={() => handleQuickPillChange('controversial')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-medium transition-all border ${
              filter.quickFilter === 'controversial'
                ? 'bg-fuchsia-500/20 text-fuchsia-300 border-fuchsia-500/50 shadow-sm shadow-fuchsia-500/20'
                : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:text-slate-200'
            }`}
          >
            <Zap className="w-3 h-3 text-fuchsia-400" />
            <span>⚡ Kontrowersyjne</span>
          </button>

          {/* Do zlewu */}
          <button
            onClick={() => handleQuickPillChange('blacklist')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-medium transition-all border ${
              filter.quickFilter === 'blacklist'
                ? 'bg-rose-500/20 text-rose-300 border-rose-500/50 shadow-sm shadow-rose-500/20'
                : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:text-slate-200'
            }`}
          >
            <Trash2 className="w-3 h-3 text-rose-400" />
            <span>Czarna lista (Zlew)</span>
          </button>
        </div>

        {/* Results counter and reset */}
        <div className="flex items-center gap-2">
          <span className="text-slate-400 text-xs">
            Znaleziono: <strong className="text-white">{totalResults}</strong>
          </span>
          {isAnyFilterActive && (
            <button
              onClick={resetAllFilters}
              className="text-violet-400 hover:text-violet-300 text-xs font-semibold underline underline-offset-2 ml-1"
            >
              Resetuj
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
