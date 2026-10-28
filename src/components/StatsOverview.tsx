import React from 'react';
import { 
  Trophy, 
  Flame, 
  Skull, 
  UserCheck, 
  Layers
} from 'lucide-react';
import { LiquidWithReviews, Review } from '../types';

interface StatsOverviewProps {
  liquids: LiquidWithReviews[];
  onSelectReviewerFilter?: (reviewerName: string) => void;
  onSelectLiquid?: (liquid: LiquidWithReviews) => void;
}

export const StatsOverview: React.FC<StatsOverviewProps> = ({
  liquids,
  onSelectReviewerFilter,
  onSelectLiquid,
}) => {
  const allReviews: Review[] = liquids.flatMap((l) => l.reviews);
  const totalLiquids = liquids.length;
  const totalReviews = allReviews.length;

  // 1. "Król ADV" - Highest avg rating with at least 1 review
  const liquidsWithRatings = liquids.filter((l) => l.reviews.length > 0);
  const kingAdv = liquidsWithRatings.length > 0
    ? [...liquidsWithRatings].sort((a, b) => b.stats.avgRating - a.stats.avgRating)[0]
    : null;

  // 2. "Największy Coil Killer" - Lowest avg coil_life
  const coilKillers = liquidsWithRatings.filter((l) => l.stats.avgCoilLife > 0);
  const worstCoilKiller = coilKillers.length > 0
    ? [...coilKillers].sort((a, b) => a.stats.avgCoilLife - b.stats.avgCoilLife)[0]
    : null;

  // 3. Najaktywniejszy tester (most reviews)
  const reviewerCounts: Record<string, number> = {};
  allReviews.forEach((r) => {
    const name = r.reviewer_name?.trim();
    if (name) {
      reviewerCounts[name] = (reviewerCounts[name] || 0) + 1;
    }
  });

  const sortedReviewers = Object.entries(reviewerCounts).sort((a, b) => b[1] - a[1]);
  const topTester = sortedReviewers.length > 0
    ? { name: sortedReviewers[0][0], count: sortedReviewers[0][1] }
    : null;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6">
      
      {/* 1. Liczba Liquidów i Ocen */}
      <div className="glass-card rounded-2xl p-4 flex items-center gap-3.5 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-24 h-24 bg-violet-500/10 rounded-full blur-2xl pointer-events-none group-hover:bg-violet-500/20 transition-colors" />
        <div className="w-12 h-12 rounded-xl bg-violet-500/20 text-violet-400 flex items-center justify-center shrink-0 border border-violet-500/30">
          <Layers className="w-6 h-6" />
        </div>
        <div>
          <div className="text-2xl font-black tracking-tight text-white flex items-baseline gap-1.5">
            {totalLiquids}
            <span className="text-xs font-normal text-slate-400">smaków</span>
          </div>
          <div className="text-xs text-slate-400 font-medium flex items-center gap-1">
            <span>{totalReviews} dodanych recenzji</span>
          </div>
        </div>
      </div>

      {/* 2. Król ADV */}
      <div 
        onClick={() => kingAdv && onSelectLiquid?.(kingAdv)}
        className={`glass-card rounded-2xl p-4 flex items-center gap-3.5 relative overflow-hidden group cursor-pointer transition-all hover:border-amber-500/40 ${
          !kingAdv ? 'opacity-60' : ''
        }`}
      >
        <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl pointer-events-none group-hover:bg-amber-500/20 transition-colors" />
        <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/30">
          <Trophy className="w-6 h-6" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400/90 flex items-center gap-1">
              <Flame className="w-3 h-3 inline text-amber-400" />
              Król ADV
            </span>
            {kingAdv && (
              <span className="text-xs font-extrabold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                {kingAdv.stats.avgRating.toFixed(1)}/10
              </span>
            )}
          </div>
          <div className="text-sm font-bold text-white truncate group-hover:text-amber-200 transition-colors">
            {kingAdv ? kingAdv.name : 'Brak danych'}
          </div>
          <div className="text-[11px] text-slate-400 truncate">
            {kingAdv ? kingAdv.brand : 'Dodaj pierwszą ocenę'}
          </div>
        </div>
      </div>

      {/* 3. Największy Coil Killer */}
      <div 
        onClick={() => worstCoilKiller && onSelectLiquid?.(worstCoilKiller)}
        className={`glass-card rounded-2xl p-4 flex items-center gap-3.5 relative overflow-hidden group cursor-pointer transition-all hover:border-rose-500/40 ${
          !worstCoilKiller ? 'opacity-60' : ''
        }`}
      >
        <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/10 rounded-full blur-2xl pointer-events-none group-hover:bg-rose-500/20 transition-colors" />
        <div className="w-12 h-12 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0 border border-rose-500/30">
          <Skull className="w-6 h-6" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-rose-400/90 flex items-center gap-1">
              Coil Killer
            </span>
            {worstCoilKiller && (
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                {worstCoilKiller.stats.avgCoilLife}/5 waty
              </span>
            )}
          </div>
          <div className="text-sm font-bold text-white truncate group-hover:text-rose-200 transition-colors">
            {worstCoilKiller ? worstCoilKiller.name : 'Brak danych'}
          </div>
          <div className="text-[11px] text-slate-400 truncate">
            {worstCoilKiller ? 'Pali grzałkę w 2 dni!' : 'Wszystkie czyste'}
          </div>
        </div>
      </div>

      {/* 4. Najaktywniejszy Tester */}
      <div 
        onClick={() => topTester && onSelectReviewerFilter?.(topTester.name)}
        className={`glass-card rounded-2xl p-4 flex items-center gap-3.5 relative overflow-hidden group cursor-pointer transition-all hover:border-cyan-500/40 ${
          !topTester ? 'opacity-60' : ''
        }`}
      >
        <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none group-hover:bg-cyan-500/20 transition-colors" />
        <div className="w-12 h-12 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0 border border-cyan-500/30">
          <UserCheck className="w-6 h-6" />
        </div>
        <div className="min-w-0 flex-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-400/90">
            Top Tester Ekipy
          </span>
          <div className="text-sm font-bold text-white truncate group-hover:text-cyan-200 transition-colors">
            {topTester ? topTester.name : 'Nikt jeszcze'}
          </div>
          <div className="text-[11px] text-slate-400 truncate">
            {topTester ? `${topTester.count} napisanych recenzji` : 'Bądź pierwszy!'}
          </div>
        </div>
      </div>

    </div>
  );
};
