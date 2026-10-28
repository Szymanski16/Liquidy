import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Plus, 
  Flame, 
  Sparkles, 
  Search, 
  HelpCircle, 
  RefreshCw,
  Droplet
} from 'lucide-react';
import { 
  Liquid, 
  Review, 
  LiquidWithReviews, 
  FilterState 
} from './types';
import { DataService } from './lib/storage';
import { getStoredSupabaseConfig } from './lib/supabase';
import { Navbar } from './components/Navbar';
import { StatsOverview } from './components/StatsOverview';
import { FilterBar } from './components/FilterBar';
import { LiquidCard } from './components/LiquidCard';
import { LiquidDetailModal } from './components/LiquidDetailModal';
import { AddLiquidModal } from './components/AddLiquidModal';
import { LongfillCalculatorModal } from './components/LongfillCalculatorModal';
import { SupabaseConfigModal } from './components/SupabaseConfigModal';
import { ToastContainer, ToastMessage } from './components/Toast';

export function App() {
  const [liquids, setLiquids] = useState<LiquidWithReviews[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSupabaseActive, setIsSupabaseActive] = useState<boolean>(false);

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [isCalcModalOpen, setIsCalcModalOpen] = useState<boolean>(false);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState<boolean>(false);
  const [selectedLiquidForDetails, setSelectedLiquidForDetails] = useState<LiquidWithReviews | null>(null);
  const [preselectedLiquidForReview, setPreselectedLiquidForReview] = useState<LiquidWithReviews | null>(null);

  // Toast notifications
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = useCallback((text: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = crypto.randomUUID();
    setToasts((prev) => [...prev, { id, text, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const handleDismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Filter state
  const [filter, setFilter] = useState<FilterState>({
    searchQuery: '',
    category: 'Wszystkie',
    reviewer: 'Wszyscy',
    quickFilter: 'all',
    sortBy: 'rating_desc',
  });

  // Load all data
  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await DataService.getLiquidsWithReviews();
      setLiquids(result.liquids);
      setIsSupabaseActive(result.isSupabase);

      if (result.error) {
        showToast(result.error, 'error');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      showToast(`Błąd ładowania danych: ${msg}`, 'error');
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Update selectedLiquidForDetails if liquids list changed
  useEffect(() => {
    if (selectedLiquidForDetails) {
      const updated = liquids.find((l) => l.id === selectedLiquidForDetails.id);
      if (updated) {
        setSelectedLiquidForDetails(updated);
      }
    }
  }, [liquids, selectedLiquidForDetails]);

  // Extract all known reviewers
  const allReviews = useMemo(() => liquids.flatMap((l) => l.reviews), [liquids]);
  const knownReviewers = useMemo(() => DataService.getKnownReviewerNames(allReviews), [allReviews]);

  // Handle adding new liquid
  const handleSaveNewLiquid = async (
    liquidData: Omit<Liquid, 'id' | 'created_at'>,
    imageBlob?: Blob,
    initialReview?: Omit<Review, 'id' | 'liquid_id' | 'created_at'>
  ) => {
    await DataService.addLiquid(liquidData, imageBlob, initialReview);
    await loadData();
    showToast('Dodano nowy liquid do katalogu!', 'success');
  };

  // Handle adding review to liquid
  const handleSaveReview = async (reviewData: Omit<Review, 'id' | 'created_at'>) => {
    await DataService.addReview(reviewData);
    await loadData();
    showToast('Dodano Twoją recenzję!', 'success');
  };

  // Handle delete liquid
  const handleDeleteLiquid = async (liquidId: string) => {
    await DataService.deleteLiquid(liquidId);
    await loadData();
    showToast('Liquid został usunięty.', 'info');
  };

  // Handle delete single review
  const handleDeleteReview = async (reviewId: string) => {
    await DataService.deleteReview(reviewId);
    await loadData();
    showToast('Recenzja została usunięta.', 'info');
  };

  // Export JSON
  const handleExportJson = () => {
    const rawLiquids: Liquid[] = liquids.map(({ reviews, stats, ...rest }) => rest);
    const jsonStr = DataService.exportData(rawLiquids, allReviews);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `liquid-reviews-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('Pobrano plik kopii zapasowej (.json)', 'success');
  };

  // Import JSON
  const handleImportJson = async (jsonContent: string) => {
    const result = await DataService.importData(jsonContent);
    await loadData();
    showToast(`Zaimportowano ${result.liquidsCount} liquidów i ${result.reviewsCount} recenzji!`, 'success');
  };

  // Reset Demo Data
  const handleResetDemoData = async () => {
    DataService.resetToDemoData();
    await loadData();
    showToast('Przywrócono domyślne dane demo.', 'info');
  };

  // Open add review pre-selected for specific liquid
  const handleOpenAddReviewForLiquid = (liquid: LiquidWithReviews) => {
    setPreselectedLiquidForReview(liquid);
    setIsAddModalOpen(true);
  };

  // Filter & Sort Logic
  const filteredLiquids = useMemo(() => {
    return liquids
      .filter((liquid) => {
        // Search query filter (checks name, brand, and review comments)
        if (filter.searchQuery.trim()) {
          const query = filter.searchQuery.toLowerCase().trim();
          const matchesName = liquid.name.toLowerCase().includes(query);
          const matchesBrand = liquid.brand.toLowerCase().includes(query);
          const matchesComment = liquid.reviews.some((r) =>
            r.comment?.toLowerCase().includes(query)
          );
          const matchesDevice = liquid.reviews.some((r) =>
            r.device_setup?.toLowerCase().includes(query)
          );
          if (!matchesName && !matchesBrand && !matchesComment && !matchesDevice) {
            return false;
          }
        }

        // Category filter
        if (filter.category !== 'Wszystkie') {
          if (liquid.flavor_category !== filter.category) {
            return false;
          }
        }

        // Reviewer filter ("Pokaż oceniane przez: [Ksywka]")
        if (filter.reviewer !== 'Wszyscy') {
          const hasReviewFromPerson = liquid.reviews.some(
            (r) => r.reviewer_name?.trim() === filter.reviewer
          );
          if (!hasReviewFromPerson) {
            return false;
          }
        }

        // Quick pills filter
        if (filter.quickFilter === 'adv_only') {
          if (!liquid.stats.hasAdv) return false;
        } else if (filter.quickFilter === 'no_cooling') {
          if (liquid.stats.avgCooling > 1.5) return false;
        } else if (filter.quickFilter === 'coil_friendly') {
          if (liquid.stats.avgCoilLife < 3.8) return false;
        } else if (filter.quickFilter === 'controversial') {
          if (!liquid.stats.isControversial) return false;
        } else if (filter.quickFilter === 'blacklist') {
          if (liquid.stats.sinkCount === 0) return false;
        }

        return true;
      })
      .sort((a, b) => {
        switch (filter.sortBy) {
          case 'rating_asc':
            return a.stats.avgRating - b.stats.avgRating;
          case 'reviews_count':
            return b.stats.reviewCount - a.stats.reviewCount;
          case 'newest':
            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
          case 'controversial':
            return b.stats.ratingSpread - a.stats.ratingSpread;
          case 'coil_friendly':
            return b.stats.avgCoilLife - a.stats.avgCoilLife;
          case 'rating_desc':
          default:
            return b.stats.avgRating - a.stats.avgRating;
        }
      });
  }, [liquids, filter]);

  return (
    <div className="min-h-screen flex flex-col bg-dark-950 pb-24 sm:pb-8 overflow-x-hidden w-full max-w-full">
      {/* Toast notifications */}
      <ToastContainer toasts={toasts} onDismiss={handleDismissToast} />

      {/* Navigation bar */}
      <Navbar
        isSupabaseActive={isSupabaseActive}
        onOpenAddModal={() => {
          setPreselectedLiquidForReview(null);
          setIsAddModalOpen(true);
        }}
        onOpenCalcModal={() => setIsCalcModalOpen(true)}
        onOpenConfigModal={() => setIsConfigModalOpen(true)}
        liquidsCount={liquids.length}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6">
        
        {/* Banner with top statistics */}
        <StatsOverview
          liquids={liquids}
          onSelectReviewerFilter={(name) => setFilter({ ...filter, reviewer: name })}
          onSelectLiquid={(liquid) => setSelectedLiquidForDetails(liquid)}
        />

        {/* Filters, search, category pills & quick switches */}
        <FilterBar
          filter={filter}
          onChangeFilter={setFilter}
          availableReviewers={knownReviewers}
          totalResults={filteredLiquids.length}
        />

        {/* Loading state */}
        {isLoading ? (
          <div className="py-24 flex flex-col items-center justify-center text-slate-400 gap-3">
            <RefreshCw className="w-8 h-8 animate-spin text-violet-500" />
            <p className="text-sm font-semibold">Wczytywanie bazy liquidów...</p>
          </div>
        ) : filteredLiquids.length === 0 ? (
          /* Empty Search / Filter Results */
          <div className="glass-card rounded-3xl p-10 text-center max-w-md mx-auto my-12 border-dashed border-slate-800">
            <Droplet className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-white mb-1">
              Brak wyników dla wybranych kryteriów
            </h3>
            <p className="text-xs text-slate-400 mb-6">
              Spróbuj wyczyścić wyszukiwarkę lub wybrać inną kategorię smaku.
            </p>
            <button
              onClick={() => {
                setFilter({
                  searchQuery: '',
                  category: 'Wszystkie',
                  reviewer: 'Wszyscy',
                  quickFilter: 'all',
                  sortBy: 'rating_desc',
                });
              }}
              className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold"
            >
              Zresetuj wszystkie filtry
            </button>
          </div>
        ) : (
          /* Grid of Liquid Cards */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {filteredLiquids.map((liquid) => (
              <LiquidCard
                key={liquid.id}
                liquid={liquid}
                onOpenDetails={(liq) => setSelectedLiquidForDetails(liq)}
                onAddReview={(liq) => handleOpenAddReviewForLiquid(liq)}
              />
            ))}
          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="w-full border-t border-slate-800/80 bg-dark-950/60 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-300">Liquid Reviews</span>
            <span>•</span>
            <span>Wspólny katalog grupy znajomych</span>
          </div>
          <div className="flex items-center gap-4 text-[11px] text-slate-400">
            <span>Tryb: {isSupabaseActive ? '🟢 Supabase Cloud' : '🟡 Local Demo'}</span>
            <span>•</span>
            <button
              onClick={() => setIsConfigModalOpen(true)}
              className="text-violet-400 hover:text-violet-300 underline"
            >
              Ustawienia bazy
            </button>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <LiquidDetailModal
        liquid={selectedLiquidForDetails}
        onClose={() => setSelectedLiquidForDetails(null)}
        onAddReview={(liq) => {
          setSelectedLiquidForDetails(null);
          handleOpenAddReviewForLiquid(liq);
        }}
        onDeleteLiquid={handleDeleteLiquid}
        onDeleteReview={handleDeleteReview}
      />

      <AddLiquidModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setPreselectedLiquidForReview(null);
        }}
        liquids={liquids}
        preselectedLiquid={preselectedLiquidForReview}
        knownReviewers={knownReviewers}
        onSaveNewLiquid={handleSaveNewLiquid}
        onSaveReview={handleSaveReview}
      />

      <LongfillCalculatorModal
        isOpen={isCalcModalOpen}
        onClose={() => setIsCalcModalOpen(false)}
      />

      <SupabaseConfigModal
        isOpen={isConfigModalOpen}
        onClose={() => setIsConfigModalOpen(false)}
        isSupabaseActive={isSupabaseActive}
        liquids={liquids}
        onRefreshData={loadData}
        onExportJson={handleExportJson}
        onImportJson={handleImportJson}
        onResetDemoData={handleResetDemoData}
        onShowToast={showToast}
      />
    </div>
  );
}

export default App;
