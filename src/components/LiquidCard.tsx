import React from 'react';
import { 
  Sparkles, 
  Flame, 
  Zap, 
  Target, 
  AlertTriangle, 
  Plus, 
  ChevronRight, 
  Droplet, 
  Snowflake, 
  HeartHandshake,
  Skull
} from 'lucide-react';
import { LiquidWithReviews, FlavorCategory } from '../types';

interface LiquidCardProps {
  liquid: LiquidWithReviews;
  onOpenDetails: (liquid: LiquidWithReviews) => void;
  onAddReview: (liquid: LiquidWithReviews) => void;
}

const CATEGORY_GRADIENTS: Record<FlavorCategory, string> = {
  'Owocowe': 'from-rose-500/20 to-orange-500/20 border-rose-500/30 text-rose-300',
  'Menthol / Ice': 'from-cyan-500/20 to-blue-500/20 border-cyan-500/30 text-cyan-300',
  'Deserowe': 'from-amber-500/20 to-yellow-600/20 border-amber-500/30 text-amber-300',
  'Kwaśne': 'from-lime-500/20 to-emerald-500/20 border-lime-500/30 text-lime-300',
  'Napoje': 'from-indigo-500/20 to-violet-500/20 border-indigo-500/30 text-indigo-300',
  'Tytoniowe': 'from-yellow-800/20 to-amber-950/20 border-amber-700/30 text-amber-200',
};

export const LiquidCard: React.FC<LiquidCardProps> = ({
  liquid,
  onOpenDetails,
  onAddReview,
}) => {
  const { stats, reviews } = liquid;

  // Determine overall score color
  const getRatingBadgeClass = (rating: number) => {
    if (rating >= 8.5) return 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-emerald-500/25';
    if (rating >= 7.0) return 'bg-gradient-to-br from-violet-500 to-indigo-600 text-white shadow-violet-500/25';
    if (rating >= 5.0) return 'bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-amber-500/25';
    return 'bg-gradient-to-br from-rose-500 to-red-600 text-white shadow-rose-500/25';
  };

  // Coil life color badge: 1 = red, 2 = orange, 3 = yellow, 4 = emerald, 5 = cyan
  const getCoilLifeInfo = (score: number) => {
    if (score <= 1.8) return { label: 'Coil Killer!', color: 'text-rose-400 bg-rose-500/10 border-rose-500/30', icon: Skull };
    if (score <= 2.8) return { label: 'Słaba trwałość', color: 'text-amber-400 bg-amber-500/10 border-amber-500/30', icon: AlertTriangle };
    if (score <= 3.8) return { label: 'Przeciętna', color: 'text-slate-300 bg-slate-800 border-slate-700', icon: HeartHandshake };
    return { label: 'Czysta jak łza', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30', icon: Sparkles };
  };

  const coilInfo = getCoilLifeInfo(stats.avgCoilLife);
  const CoilIcon = coilInfo.icon;

  return (
    <div className="glass-card glass-card-hover rounded-2xl p-3 sm:p-4 flex flex-col justify-between relative overflow-hidden group w-full min-w-0">
      
      {/* Top Section: Badges & Header */}
      <div>
        {/* Indicators Bar (Controversy, Consensus, ADV) */}
        <div className="flex flex-wrap items-center gap-1.5 mb-3">
          {stats.isControversial && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-fuchsia-950/80 text-fuchsia-300 border border-fuchsia-500/40 shadow-sm animate-pulse-subtle">
              <Zap className="w-3 h-3 text-fuchsia-400" />
              ⚡ Kontrowersyjny (Rozstrzał {stats.ratingSpread} pkt)
            </span>
          )}

          {stats.isConsensusFavorite && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 shadow-sm">
              <Target className="w-3 h-3 text-emerald-400" />
              🎯 Zgodny faworyt
            </span>
          )}

          {stats.hasAdv && !stats.isConsensusFavorite && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-950/80 text-amber-300 border border-amber-500/40">
              <Flame className="w-3 h-3 text-amber-400" />
              {stats.advCount}x ADV
            </span>
          )}

          {stats.sinkCount > 0 && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-rose-950/80 text-rose-300 border border-rose-500/40">
              {stats.sinkCount}x Do zlewu
            </span>
          )}
        </div>

        {/* Liquid Info + Photo Row */}
        <div className="flex items-start gap-3.5 mb-3.5">
          {/* Bottle Thumbnail */}
          <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden bg-slate-900 border border-slate-800 shrink-0 flex items-center justify-center">
            {liquid.image_url ? (
              <img
                src={liquid.image_url}
                alt={liquid.name}
                loading="lazy"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            ) : null}
            {/* Fallback Placeholder with Category Gradient */}
            <div className={`absolute inset-0 flex flex-col items-center justify-center p-2 text-center bg-gradient-to-br ${CATEGORY_GRADIENTS[liquid.flavor_category]} ${liquid.image_url ? '-z-10' : ''}`}>
              <Droplet className="w-7 h-7 mb-1 opacity-70" />
              <span className="text-[10px] font-semibold leading-tight line-clamp-1">{liquid.flavor_category}</span>
            </div>

            {/* Type badge overlay */}
            <div className="absolute bottom-1 left-1 right-1 bg-dark-950/85 backdrop-blur-sm rounded px-1 py-0.5 text-[9px] font-semibold text-slate-300 text-center truncate border border-white/5">
              {liquid.type}
            </div>
          </div>

          {/* Details */}
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block truncate">
                  {liquid.brand}
                </span>
                <h3 
                  onClick={() => onOpenDetails(liquid)}
                  className="text-base sm:text-lg font-bold text-white hover:text-violet-300 transition-colors cursor-pointer truncate"
                  title={liquid.name}
                >
                  {liquid.name}
                </h3>
              </div>

              {/* Overall Rating Badge */}
              <div className="flex flex-col items-end shrink-0">
                <div className={`px-2.5 py-1 rounded-xl font-extrabold text-sm sm:text-base shadow-lg ${getRatingBadgeClass(stats.avgRating)}`}>
                  {stats.reviewCount > 0 ? stats.avgRating.toFixed(1) : '–'}
                </div>
                <span className="text-[10px] text-slate-400 mt-0.5">
                  {stats.reviewCount} {stats.reviewCount === 1 ? 'ocena' : stats.reviewCount < 5 ? 'oceny' : 'ocen'}
                </span>
              </div>
            </div>

            {/* Category Pill & Aroma Volume */}
            <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
              <span className={`px-2 py-0.5 rounded-lg text-[11px] font-medium border ${CATEGORY_GRADIENTS[liquid.flavor_category]}`}>
                {liquid.flavor_category}
              </span>
              {liquid.aroma_volume_ml && (
                <span className="px-2 py-0.5 rounded-lg text-[11px] font-medium bg-slate-800/80 text-slate-300 border border-slate-700/60">
                  {liquid.aroma_volume_ml} ml aromatu
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Parameter Progress Bars (Sweetness, Cooling, Intensity, Throat Hit) */}
        {stats.reviewCount > 0 ? (
          <div className="space-y-2 py-2 border-y border-slate-800/60 my-3 text-xs">
            {/* Słodycz */}
            <div className="flex items-center justify-between gap-2">
              <span className="text-slate-400 text-[11px] w-20 shrink-0">Słodycz</span>
              <div className="flex-1 h-2 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 to-rose-500 rounded-full"
                  style={{ width: `${(stats.avgSweetness / 5) * 100}%` }}
                />
              </div>
              <span className="text-[11px] font-semibold text-slate-300 w-6 text-right">
                {stats.avgSweetness}
              </span>
            </div>

            {/* Chłodzik */}
            <div className="flex items-center justify-between gap-2">
              <span className="text-slate-400 text-[11px] w-20 shrink-0 flex items-center gap-1">
                <Snowflake className="w-2.5 h-2.5 text-cyan-400" />
                Chłodzik
              </span>
              <div className="flex-1 h-2 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full"
                  style={{ width: `${(stats.avgCooling / 5) * 100}%` }}
                />
              </div>
              <span className="text-[11px] font-semibold text-slate-300 w-6 text-right">
                {stats.avgCooling}
              </span>
            </div>

            {/* Żywotność Grzałki (Coil Life) Highlight */}
            <div className="flex items-center justify-between gap-2 pt-0.5">
              <span className="text-slate-400 text-[11px] w-20 shrink-0">Wata / Grzałka</span>
              <div className="flex-1 h-2 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className={`h-full rounded-full ${
                    stats.avgCoilLife >= 4
                      ? 'bg-emerald-500'
                      : stats.avgCoilLife >= 3
                      ? 'bg-yellow-500'
                      : stats.avgCoilLife >= 2
                      ? 'bg-orange-500'
                      : 'bg-rose-500'
                  }`}
                  style={{ width: `${(stats.avgCoilLife / 5) * 100}%` }}
                />
              </div>
              <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded border ${coilInfo.color}`}>
                {stats.avgCoilLife}/5
              </span>
            </div>
          </div>
        ) : (
          <div className="py-4 my-2 text-center text-xs text-slate-500 border-y border-slate-800/40">
            Brak recenzji. Bądź pierwszym, który oceni ten liquid!
          </div>
        )}

        {/* Reviewers Avatar / Score Bubbles Preview */}
        {reviews.length > 0 && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
            <span className="text-[10px] text-slate-500 font-semibold uppercase mr-0.5">
              Ekipa:
            </span>
            {reviews.map((rev) => (
              <span
                key={rev.id}
                title={`${rev.reviewer_name}: ${rev.overall_rating}/10 (${rev.verdict})`}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-slate-900 border border-slate-800 text-[11px] text-slate-300 whitespace-nowrap shrink-0"
              >
                <span className="font-medium text-slate-400">{rev.reviewer_name}</span>
                <span className={`font-bold ${
                  rev.overall_rating >= 8.5 ? 'text-emerald-400' :
                  rev.overall_rating >= 7 ? 'text-violet-400' :
                  rev.overall_rating >= 5 ? 'text-amber-400' : 'text-rose-400'
                }`}>
                  {rev.overall_rating}
                </span>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Card Actions Footer */}
      <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-800/60 mt-2">
        <button
          onClick={() => onOpenDetails(liquid)}
          className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs font-semibold text-slate-200 border border-slate-700/60 transition-colors"
        >
          <span>Oceny Ekipy</span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        </button>

        <button
          onClick={() => onAddReview(liquid)}
          className="flex items-center justify-center gap-1 py-2 px-3 rounded-xl bg-violet-600/20 hover:bg-violet-600/30 text-violet-300 border border-violet-500/30 text-xs font-semibold active:scale-95 transition-all"
        >
          <Plus className="w-3.5 h-3.5 text-violet-400" />
          <span>+ Twoja Ocena</span>
        </button>
      </div>

    </div>
  );
};
