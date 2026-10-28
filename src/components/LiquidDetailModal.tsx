import React, { useState } from 'react';
import { 
  X, 
  Plus, 
  Trash2, 
  Flame, 
  Zap, 
  Target, 
  Clock, 
  Droplet, 
  Snowflake, 
  ShieldAlert, 
  Calendar, 
  Cpu, 
  Gauge, 
  Beaker,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Share2
} from 'lucide-react';
import { LiquidWithReviews, Review } from '../types';

interface LiquidDetailModalProps {
  liquid: LiquidWithReviews | null;
  onClose: () => void;
  onAddReview: (liquid: LiquidWithReviews) => void;
  onDeleteLiquid: (liquidId: string) => Promise<void>;
  onDeleteReview: (reviewId: string) => Promise<void>;
  onShareOrCopy?: (liquid: LiquidWithReviews) => void;
}

export const LiquidDetailModal: React.FC<LiquidDetailModalProps> = ({
  liquid,
  onClose,
  onAddReview,
  onDeleteLiquid,
  onDeleteReview,
}) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmDeleteLiquid, setConfirmDeleteLiquid] = useState(false);
  const [deletingReviewId, setDeletingReviewId] = useState<string | null>(null);

  if (!liquid) return null;

  const { stats, reviews } = liquid;

  const getVerdictBadge = (verdict: string) => {
    if (verdict.startsWith('ADV')) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
          <Flame className="w-3.5 h-3.5 text-amber-400" />
          ADV (Kupię ponownie)
        </span>
      );
    }
    if (verdict.startsWith('Do zlewu')) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40">
          <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
          Do zlewu (Unikać)
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-800 text-slate-300 border border-slate-700">
        <CheckCircle2 className="w-3.5 h-3.5 text-slate-400" />
        Okazjonalnie
      </span>
    );
  };

  const handleDeleteLiquidConfirm = async () => {
    setIsDeleting(true);
    await onDeleteLiquid(liquid.id);
    setIsDeleting(false);
    onClose();
  };

  const handleDeleteReviewItem = async (reviewId: string) => {
    setDeletingReviewId(reviewId);
    await onDeleteReview(reviewId);
    setDeletingReviewId(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto bg-black/80 backdrop-blur-md animate-fade-in">
      <div 
        className="glass-modal rounded-3xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden shadow-2xl border border-slate-800"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Modal Top Header */}
        <div className="relative p-5 sm:p-6 border-b border-slate-800 flex items-start justify-between gap-4 bg-gradient-to-b from-dark-900 to-dark-950">
          <div className="flex items-center gap-4">
            {/* Bottle Picture */}
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 shrink-0 flex items-center justify-center shadow-md">
              {liquid.image_url ? (
                <img
                  src={liquid.image_url}
                  alt={liquid.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <Droplet className="w-8 h-8 text-violet-400" />
              )}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-violet-400 uppercase tracking-widest">
                  {liquid.brand}
                </span>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-800 text-slate-300 border border-slate-700">
                  {liquid.type}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-0.5">
                {liquid.name}
              </h2>
              <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                <span>Kategoria: <strong className="text-slate-200">{liquid.flavor_category}</strong></span>
                {liquid.aroma_volume_ml && (
                  <span>Aromat: <strong className="text-slate-200">{liquid.aroma_volume_ml} ml</strong> w 60ml</span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white bg-slate-900/80 hover:bg-slate-800 border border-slate-800 transition-colors"
              aria-label="Zamknij"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body (Scrollable) */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6">
          
          {/* Summary / Consensus Section */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {/* Overall score */}
            <div className="glass-card rounded-2xl p-4 text-center">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Średnia Ekipy
              </span>
              <div className="text-3xl font-black text-white flex items-center justify-center gap-1">
                <span>{stats.reviewCount > 0 ? stats.avgRating.toFixed(1) : '–'}</span>
                <span className="text-sm font-normal text-slate-500">/10</span>
              </div>
              <span className="text-[11px] text-slate-400 mt-1 block">
                Z {stats.reviewCount} {stats.reviewCount === 1 ? 'recenzji' : 'recenzji'}
              </span>
            </div>

            {/* Rozstrzał ocen / Zgodność */}
            <div className="glass-card rounded-2xl p-4 text-center">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Zgodność Ocen
              </span>
              <div className="text-2xl font-black text-white mt-1">
                {stats.isControversial ? (
                  <span className="text-fuchsia-400 text-lg flex items-center justify-center gap-1 font-bold">
                    <Zap className="w-4 h-4 inline" /> Rozstrzelone
                  </span>
                ) : stats.isConsensusFavorite ? (
                  <span className="text-emerald-400 text-lg flex items-center justify-center gap-1 font-bold">
                    <Target className="w-4 h-4 inline" /> Zgodny faworyt
                  </span>
                ) : (
                  <span className="text-slate-300 text-lg">Umiarkowana</span>
                )}
              </div>
              <span className="text-[11px] text-slate-400 mt-1 block">
                Rozstęp: {stats.ratingSpread} pkt
              </span>
            </div>

            {/* Żywotność Grzałki */}
            <div className="glass-card rounded-2xl p-4 text-center">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Wpływ na Grzałkę
              </span>
              <div className="text-2xl font-black text-white mt-1">
                <span className={stats.avgCoilLife >= 4 ? 'text-emerald-400' : stats.avgCoilLife <= 2 ? 'text-rose-400' : 'text-amber-400'}>
                  {stats.avgCoilLife}/5
                </span>
              </div>
              <span className="text-[11px] text-slate-400 mt-1 block">
                {stats.avgCoilLife <= 2 ? 'Coil Killer!' : stats.avgCoilLife >= 4 ? 'Bardzo czysta wata' : 'Standardowa'}
              </span>
            </div>

            {/* Chłodzik & Słodycz */}
            <div className="glass-card rounded-2xl p-4 text-center">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Profil Smaku
              </span>
              <div className="text-xs font-semibold text-slate-200 space-y-1 mt-1">
                <div className="flex justify-between">
                  <span className="text-slate-400">Słodycz:</span>
                  <span className="text-amber-400 font-bold">{stats.avgSweetness}/5</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Chłód:</span>
                  <span className="text-cyan-400 font-bold">{stats.avgCooling}/5</span>
                </div>
              </div>
            </div>
          </div>

          {/* Controversy / Highlight Alert box */}
          {stats.isControversial && (
            <div className="p-4 rounded-2xl bg-fuchsia-950/40 border border-fuchsia-500/30 flex items-start gap-3">
              <Zap className="w-5 h-5 text-fuchsia-400 shrink-0 mt-0.5" />
              <div className="text-xs sm:text-sm text-fuchsia-200">
                <strong className="font-bold text-white block mb-0.5">
                  ⚡ Oceny ekipy są mocno podzielone!
                </strong>
                Rozstęp między najwyższą a najniższą notą to aż {stats.ratingSpread} pkt. Sprawdź poniżej opisy i sprzęt, na którym był palony – często zależy to od oporności grzałki lub czasu leżakowania!
              </div>
            </div>
          )}

          {/* SECTION: ZESTAWIENIE OCEN EKIPY (Side-by-side or Grid) */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <span>Zestawienie Ocen Ekipy</span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/30">
                    {reviews.length} {reviews.length === 1 ? 'opinia' : 'opinie'}
                  </span>
                </h3>
                <p className="text-xs text-slate-400">
                  Porównaj sprzęt, moc nikotyny i subiektywne wrażenia poszczególnych osób.
                </p>
              </div>

              <button
                onClick={() => onAddReview(liquid)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold shadow-md shadow-violet-600/30 transition-all active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>Dodaj swoją ocenę</span>
              </button>
            </div>

            {reviews.length === 0 ? (
              <div className="text-center py-12 rounded-2xl border border-dashed border-slate-800 p-6">
                <HelpCircle className="w-10 h-10 text-slate-600 mx-auto mb-2" />
                <p className="text-sm font-semibold text-slate-300">Nikt z ekipy jeszcze nie ocenił tego liquidu</p>
                <p className="text-xs text-slate-500 mt-1 mb-4">Bądź pierwszą osobą, która podzieli się wrażeniami z testów.</p>
                <button
                  onClick={() => onAddReview(liquid)}
                  className="px-4 py-2 rounded-xl bg-violet-600 text-white text-xs font-semibold"
                >
                  Napisz pierwszą recenzję
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {reviews.map((rev) => (
                  <div
                    key={rev.id}
                    className="glass-card rounded-2xl p-4 sm:p-5 flex flex-col justify-between border-slate-800/80 relative group"
                  >
                    <div>
                      {/* Review Header: Reviewer Name + Score + Verdict */}
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-violet-600 to-indigo-600 text-white font-black text-sm flex items-center justify-center shrink-0 shadow-md">
                            {rev.reviewer_name.slice(0, 1).toUpperCase()}
                          </div>
                          <div>
                            <span className="font-bold text-white text-sm block">
                              {rev.reviewer_name}
                            </span>
                            <span className="text-[10px] text-slate-500 flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {new Date(rev.created_at).toLocaleDateString('pl-PL')}
                            </span>
                          </div>
                        </div>

                        {/* Rating & Verdict */}
                        <div className="flex flex-col items-end gap-1">
                          <div className="flex items-baseline gap-1 bg-slate-900 px-2.5 py-1 rounded-xl border border-slate-800">
                            <span className="text-lg font-black text-white">
                              {rev.overall_rating}
                            </span>
                            <span className="text-xs text-slate-400">/10</span>
                          </div>
                        </div>
                      </div>

                      {/* Verdict Badge */}
                      <div className="mb-3">
                        {getVerdictBadge(rev.verdict)}
                      </div>

                      {/* Hardware and Mix Context Tags */}
                      <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800/80 space-y-1.5 text-xs text-slate-300 mb-3">
                        {/* Device & Coil */}
                        {(rev.device_setup || rev.coil_resistance) && (
                          <div className="flex items-center gap-1.5 text-slate-300">
                            <Cpu className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                            <span className="font-medium text-white">{rev.device_setup || 'Nie podano'}</span>
                            {rev.coil_resistance && (
                              <span className="px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-300 border border-cyan-800/50 text-[10px] font-mono">
                                {rev.coil_resistance}
                              </span>
                            )}
                          </div>
                        )}

                        {/* Nicotine & Ratio */}
                        {(rev.nicotine_type || rev.nicotine_mg !== undefined || rev.vg_pg_ratio) && (
                          <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                            <Beaker className="w-3.5 h-3.5 text-violet-400 shrink-0" />
                            <span>
                              {rev.nicotine_type || 'Baza'}
                              {rev.nicotine_mg !== undefined ? ` • ${rev.nicotine_mg} mg` : ''}
                              {rev.vg_pg_ratio ? ` • VG/PG ${rev.vg_pg_ratio}` : ''}
                            </span>
                          </div>
                        )}

                        {/* Steeping days */}
                        {rev.steeping_days !== undefined && (
                          <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                            <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                            <span>
                              {rev.steeping_days === 0
                                ? 'Shake & Vape (bez leżakowania)'
                                : `Leżakowane: ${rev.steeping_days} dni`}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Attribute Mini Scores Grid */}
                      <div className="grid grid-cols-5 gap-1 text-center py-2 border-t border-slate-800/60 mb-3 text-[10px]">
                        <div>
                          <span className="text-slate-500 block">Słodycz</span>
                          <span className="font-bold text-amber-300">{rev.sweetness}/5</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block">Chłód</span>
                          <span className="font-bold text-cyan-300">{rev.cooling}/5</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block">Aromat</span>
                          <span className="font-bold text-slate-200">{rev.intensity}/5</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block">ThroatHit</span>
                          <span className="font-bold text-slate-200">{rev.throat_hit}/5</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block">Wata</span>
                          <span className={`font-bold ${rev.coil_life <= 2 ? 'text-rose-400' : 'text-emerald-400'}`}>
                            {rev.coil_life}/5
                          </span>
                        </div>
                      </div>

                      {/* Comment */}
                      {rev.comment && (
                        <p className="text-xs sm:text-sm text-slate-300 italic bg-dark-950/40 p-3 rounded-xl border border-slate-800/50">
                          „{rev.comment}”
                        </p>
                      )}
                    </div>

                    {/* Delete single review action */}
                    <div className="flex justify-end pt-3 mt-2 border-t border-slate-800/40 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleDeleteReviewItem(rev.id)}
                        disabled={deletingReviewId === rev.id}
                        className="text-[11px] text-slate-500 hover:text-rose-400 flex items-center gap-1 transition-colors"
                        title="Usuń tę recenzję"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Usuń recenzję</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Delete Whole Liquid Button */}
          <div className="pt-4 border-t border-slate-800/60 flex items-center justify-between text-xs">
            {!confirmDeleteLiquid ? (
              <button
                onClick={() => setConfirmDeleteLiquid(true)}
                className="text-slate-500 hover:text-rose-400 flex items-center gap-1.5 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                <span>Usuń ten liquid z bazy</span>
              </button>
            ) : (
              <div className="flex items-center gap-2 bg-rose-950/60 border border-rose-500/40 p-2 rounded-xl">
                <span className="text-rose-200 text-xs">Czy na pewno usunąć cały produkt i wszystkie recenzje?</span>
                <button
                  onClick={handleDeleteLiquidConfirm}
                  disabled={isDeleting}
                  className="px-2.5 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded-lg font-bold"
                >
                  Tak, usuń
                </button>
                <button
                  onClick={() => setConfirmDeleteLiquid(false)}
                  className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg"
                >
                  Anuluj
                </button>
              </div>
            )}

            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold"
            >
              Zamknij
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
