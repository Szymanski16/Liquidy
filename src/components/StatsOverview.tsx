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
    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3.5 mb-4 sm:mb-6">
      
      {/* 1. Liczba Liquidów i Ocen */}
      <div className="glass-card rounded-2xl p-2.5 sm:p-4 flex items-center gap-2 sm:gap-3.5 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-24 h-24 bg-violet-500/10 rounded-full blur-2xl pointer-events-none group-hover:bg-violet-500/20 transition-colors" />
        <div className="w-8 h-8 sm:w-11 sm:h-11 rounded-xl bg-violet-500/20 text-violet-400 flex items-center justify-center shrink-0 border border-violet-500/30">
          <Layers className="w-4 h-4 sm:w-5 sm:h-5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-lg sm:text-2xl font-black tracking-tight text-white flex items-baseline gap-1">
            {totalLiquids}
            <span className="text-[10px] sm:text-xs font-normal text-slate-400">smaków</span>
          </div>
          <div className="text-[10px] sm:text-xs text-slate-400 font-medium truncate">
            {totalReviews} ocen ekipy
          </div>
        </div>
      </div>

      {/* 2. Król ADV */}
      <div 
        onClick={() => kingAdv && onSelectLiquid?.(kingAdv)}
        className={`glass-card rounded-2xl p-2.5 sm:p-4 flex items-center gap-2 sm:gap-3.5 relative overflow-hidden group cursor-pointer transition-all hover:border-amber-500/40 ${
          !kingAdv ? 'opacity-60' : ''
        }`}
      >
        <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl pointer-events-none group-hover:bg-amber-500/20 transition-colors" />
        <div className="w-8 h-8 sm:w-11 sm:h-11 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/30">
          <Trophy className="w-4 h-4 sm:w-5 sm:h-5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-1">
            <span className="text-[9px] sm:text-[11px] font-bold uppercase tracking-wider text-amber-400/90 flex items-center gap-0.5">
              <Flame className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-amber-400" />
              Król ADV
            </span>
            {kingAdv && (
              <span className="text-[10px] sm:text-xs font-black px-1 sm:px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                {kingAdv.stats.avgRating.toFixed(1)}
              </span>
            )}
          </div>
          <div className="text-xs sm:text-sm font-bold text-white truncate group-hover:text-amber-200 transition-colors">
            {kingAdv ? kingAdv.name : 'Brak ocen'}
          </div>
          <div className="text-[10px] sm:text-[11px] text-slate-400 truncate">
            {kingAdv ? kingAdv.brand : 'Bądź pierwszy'}
          </div>
        </div>
      </div>

      {/* 3. Największy Coil Killer */}
      <div 
        onClick={() => worstCoilKiller && onSelectLiquid?.(worstCoilKiller)}
        className={`glass-card rounded-2xl p-2.5 sm:p-4 flex items-center gap-2 sm:gap-3.5 relative overflow-hidden group cursor-pointer transition-all hover:border-rose-500/40 ${
          !worstCoilKiller ? 'opacity-60' : ''
        }`}
      >
        <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/10 rounded-full blur-2xl pointer-events-none group-hover:bg-rose-500/20 transition-colors" />
        <div className="w-8 h-8 sm:w-11 sm:h-11 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0 border border-rose-500/30">
          <Skull className="w-4 h-4 sm:w-5 sm:h-5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-1">
            <span className="text-[9px] sm:text-[11px] font-bold uppercase tracking-wider text-rose-400/90">
              Coil Killer
            </span>
            {worstCoilKiller && (
              <span className="text-[10px] sm:text-xs font-black px-1 sm:px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                {worstCoilKiller.stats.avgCoilLife}/5
              </span>
            )}
          </div>
          <div className="text-xs sm:text-sm font-bold text-white truncate group-hover:text-rose-200 transition-colors">
            {worstCoilKiller ? worstCoilKiller.name : 'Brak danych'}
          </div>
          <div className="text-[10px] sm:text-[11px] text-slate-400 truncate">
            {worstCoilKiller ? 'Pali watę w 2 dni!' : 'Wszystkie czyste'}
          </div>
        </div>
      </div>

      {/* 4. Najaktywniejszy Tester */}
      <div 
        onClick={() => topTester && onSelectReviewerFilter?.(topTester.name)}
        className={`glass-card rounded-2xl p-2.5 sm:p-4 flex items-center gap-2 sm:gap-3.5 relative overflow-hidden group cursor-pointer transition-all hover:border-cyan-500/40 ${
          !topTester ? 'opacity-60' : ''
        }`}
      >
        <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none group-hover:bg-cyan-500/20 transition-colors" />
        <div className="w-8 h-8 sm:w-11 sm:h-11 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0 border border-cyan-500/30">
          <UserCheck className="w-4 h-4 sm:w-5 sm:h-5" />
        </div>
        <div className="min-w-0 flex-1">
          <span className="text-[9px] sm:text-[11px] font-bold uppercase tracking-wider text-cyan-400/90 block">
            Top Tester
          </span>
          <div className="text-xs sm:text-sm font-bold text-white truncate group-hover:text-cyan-200 transition-colors">
            {topTester ? topTester.name : 'Nikt jeszcze'}
          </div>
          <div className="text-[10px] sm:text-[11px] text-slate-400 truncate">
            {topTester ? `${topTester.count} recenzji` : 'Napisz pierwszą!'}
          </div>
        </div>
      </div>

    </div>
  );
};
