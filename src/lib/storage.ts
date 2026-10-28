import { Liquid, Review, LiquidWithReviews } from '../types';
import { INITIAL_LIQUIDS, INITIAL_REVIEWS } from './initialData';
import { getSupabaseClient, uploadLiquidImage } from './supabase';

const LOCAL_STORAGE_LIQUIDS = 'liquid_reviews_liquids';
const LOCAL_STORAGE_REVIEWS = 'liquid_reviews_reviews';
const LOCAL_STORAGE_LAST_REVIEWER = 'liquid_reviews_last_reviewer';

/**
 * Calculates aggregated statistics for a liquid based on its reviews.
 */
export function calculateLiquidStats(reviews: Review[]): LiquidWithReviews['stats'] {
  if (reviews.length === 0) {
    return {
      avgRating: 0,
      reviewCount: 0,
      avgSweetness: 0,
      avgCooling: 0,
      avgIntensity: 0,
      avgThroatHit: 0,
      avgCoilLife: 0,
      ratingSpread: 0,
      isControversial: false,
      isConsensusFavorite: false,
      hasAdv: false,
      advCount: 0,
      sinkCount: 0,
    };
  }

  const ratings = reviews.map((r) => Number(r.overall_rating));
  const minRating = Math.min(...ratings);
  const maxRating = Math.max(...ratings);
  const ratingSpread = Number((maxRating - minRating).toFixed(1));

  const sumRating = ratings.reduce((a, b) => a + b, 0);
  const avgRating = Number((sumRating / reviews.length).toFixed(1));

  const avgSweetness = Number(
    (reviews.reduce((a, b) => a + (b.sweetness || 0), 0) / reviews.length).toFixed(1)
  );
  const avgCooling = Number(
    (reviews.reduce((a, b) => a + (b.cooling || 0), 0) / reviews.length).toFixed(1)
  );
  const avgIntensity = Number(
    (reviews.reduce((a, b) => a + (b.intensity || 0), 0) / reviews.length).toFixed(1)
  );
  const avgThroatHit = Number(
    (reviews.reduce((a, b) => a + (b.throat_hit || 0), 0) / reviews.length).toFixed(1)
  );
  const avgCoilLife = Number(
    (reviews.reduce((a, b) => a + (b.coil_life || 0), 0) / reviews.length).toFixed(1)
  );

  const advCount = reviews.filter((r) => r.verdict.startsWith('ADV')).length;
  const sinkCount = reviews.filter((r) => r.verdict.startsWith('Do zlewu')).length;

  const isControversial = reviews.length >= 2 && ratingSpread >= 3.5;
  const isConsensusFavorite = reviews.length >= 2 && ratingSpread <= 1.5 && avgRating >= 8.0;

  return {
    avgRating,
    reviewCount: reviews.length,
    avgSweetness,
    avgCooling,
    avgIntensity,
    avgThroatHit,
    avgCoilLife,
    ratingSpread,
    isControversial,
    isConsensusFavorite,
    hasAdv: advCount > 0,
    advCount,
    sinkCount,
  };
}

// Local storage helpers
function getLocalLiquids(): Liquid[] {
  const data = localStorage.getItem(LOCAL_STORAGE_LIQUIDS);
  if (!data) {
    localStorage.setItem(LOCAL_STORAGE_LIQUIDS, JSON.stringify(INITIAL_LIQUIDS));
    return INITIAL_LIQUIDS;
  }
  try {
    return JSON.parse(data);
  } catch {
    return INITIAL_LIQUIDS;
  }
}

function saveLocalLiquids(liquids: Liquid[]): void {
  localStorage.setItem(LOCAL_STORAGE_LIQUIDS, JSON.stringify(liquids));
}

function getLocalReviews(): Review[] {
  const data = localStorage.getItem(LOCAL_STORAGE_REVIEWS);
  if (!data) {
    localStorage.setItem(LOCAL_STORAGE_REVIEWS, JSON.stringify(INITIAL_REVIEWS));
    return INITIAL_REVIEWS;
  }
  try {
    return JSON.parse(data);
  } catch {
    return INITIAL_REVIEWS;
  }
}

function saveLocalReviews(reviews: Review[]): void {
  localStorage.setItem(LOCAL_STORAGE_REVIEWS, JSON.stringify(reviews));
}

// Last Reviewer persistence
export function getLastReviewer(): string {
  return localStorage.getItem(LOCAL_STORAGE_LAST_REVIEWER) || '';
}

export function setLastReviewer(name: string): void {
  if (name.trim()) {
    localStorage.setItem(LOCAL_STORAGE_LAST_REVIEWER, name.trim());
  }
}

/**
 * Main Data Access Service
 */
export const DataService = {
  /**
   * Fetch all liquids joined with their reviews and computed stats.
   */
  async getLiquidsWithReviews(): Promise<{
    liquids: LiquidWithReviews[];
    isSupabase: boolean;
    error?: string;
  }> {
    const client = getSupabaseClient();

    if (client) {
      try {
        const [liquidsRes, reviewsRes] = await Promise.all([
          client.from('liquids').select('*').order('created_at', { ascending: false }),
          client.from('reviews').select('*').order('created_at', { ascending: false }),
        ]);

        if (liquidsRes.error) {
          throw liquidsRes.error;
        }
        if (reviewsRes.error) {
          throw reviewsRes.error;
        }

        const rawLiquids: Liquid[] = liquidsRes.data || [];
        const rawReviews: Review[] = reviewsRes.data || [];

        // If connected Supabase is brand new and empty, auto-seed with initial data
        if (rawLiquids.length === 0) {
          try {
            await client.from('liquids').insert(INITIAL_LIQUIDS);
            await client.from('reviews').insert(INITIAL_REVIEWS);
            return {
              liquids: INITIAL_LIQUIDS.map((liquid) => {
                const liquidReviews = INITIAL_REVIEWS.filter((r) => r.liquid_id === liquid.id);
                return {
                  ...liquid,
                  reviews: liquidReviews,
                  stats: calculateLiquidStats(liquidReviews),
                };
              }),
              isSupabase: true,
            };
          } catch (seedErr) {
            console.warn('Auto-seed to Supabase failed:', seedErr);
          }
        }

        const liquidsWithReviews: LiquidWithReviews[] = rawLiquids.map((liquid) => {
          const liquidReviews = rawReviews.filter((r) => r.liquid_id === liquid.id);
          return {
            ...liquid,
            reviews: liquidReviews,
            stats: calculateLiquidStats(liquidReviews),
          };
        });

        return {
          liquids: liquidsWithReviews,
          isSupabase: true,
        };
      } catch (err: unknown) {
        console.warn('Supabase fetch failed, falling back to local data:', err);
        const errorMsg = err instanceof Error ? err.message : String(err);
        const fallback = this.getLocalLiquidsWithReviews();
        return {
          liquids: fallback,
          isSupabase: false,
          error: `Supabase: ${errorMsg}. Użyto danych lokalnych.`,
        };
      }
    }

    // Local Demo Mode
    return {
      liquids: this.getLocalLiquidsWithReviews(),
      isSupabase: false,
    };
  },

  getLocalLiquidsWithReviews(): LiquidWithReviews[] {
    const rawLiquids = getLocalLiquids();
    const rawReviews = getLocalReviews();

    return rawLiquids.map((liquid) => {
      const liquidReviews = rawReviews.filter((r) => r.liquid_id === liquid.id);
      return {
        ...liquid,
        reviews: liquidReviews,
        stats: calculateLiquidStats(liquidReviews),
      };
    });
  },

  /**
   * Add a new liquid, optionally with an initial review.
   */
  async addLiquid(
    liquidData: Omit<Liquid, 'id' | 'created_at'>,
    imageBlob?: Blob,
    initialReview?: Omit<Review, 'id' | 'liquid_id' | 'created_at'>
  ): Promise<{ liquid: Liquid; review?: Review }> {
    const client = getSupabaseClient();
    const newLiquidId = crypto.randomUUID();
    const now = new Date().toISOString();

    let finalImageUrl = liquidData.image_url || '';

    // If there is an image blob and Supabase is active, upload it to bucket
    if (imageBlob && client) {
      const uploadedUrl = await uploadLiquidImage(imageBlob, newLiquidId);
      if (uploadedUrl) {
        finalImageUrl = uploadedUrl;
      }
    }

    const newLiquid: Liquid = {
      ...liquidData,
      id: newLiquidId,
      image_url: finalImageUrl,
      created_at: now,
    };

    let newReview: Review | undefined;
    if (initialReview) {
      newReview = {
        ...initialReview,
        id: crypto.randomUUID(),
        liquid_id: newLiquidId,
        created_at: now,
      };
      setLastReviewer(initialReview.reviewer_name);
    }

    if (client) {
      try {
        const { error: liquidErr } = await client.from('liquids').insert([newLiquid]);
        if (liquidErr) throw liquidErr;

        if (newReview) {
          const { error: reviewErr } = await client.from('reviews').insert([newReview]);
          if (reviewErr) throw reviewErr;
        }

        return { liquid: newLiquid, review: newReview };
      } catch (err) {
        console.warn('Failed saving to Supabase, saving to local storage as fallback:', err);
      }
    }

    // Local Mode
    const localLiquids = getLocalLiquids();
    saveLocalLiquids([newLiquid, ...localLiquids]);

    if (newReview) {
      const localReviews = getLocalReviews();
      saveLocalReviews([newReview, ...localReviews]);
    }

    return { liquid: newLiquid, review: newReview };
  },

  /**
   * Add a review to an existing liquid.
   */
  async addReview(
    reviewData: Omit<Review, 'id' | 'created_at'>
  ): Promise<Review> {
    const client = getSupabaseClient();
    const newReview: Review = {
      ...reviewData,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
    };

    setLastReviewer(reviewData.reviewer_name);

    if (client) {
      try {
        const { error } = await client.from('reviews').insert([newReview]);
        if (error) throw error;
        return newReview;
      } catch (err) {
        console.warn('Supabase addReview failed, saving locally:', err);
      }
    }

    // Local Mode
    const localReviews = getLocalReviews();
    saveLocalReviews([newReview, ...localReviews]);
    return newReview;
  },

  /**
   * Delete a liquid and all of its reviews.
   */
  async deleteLiquid(liquidId: string): Promise<void> {
    const client = getSupabaseClient();
    if (client) {
      try {
        const { error } = await client.from('liquids').delete().eq('id', liquidId);
        if (error) throw error;
        return;
      } catch (err) {
        console.warn('Supabase deleteLiquid failed, falling back to local:', err);
      }
    }

    // Local Mode
    const localLiquids = getLocalLiquids().filter((l) => l.id !== liquidId);
    const localReviews = getLocalReviews().filter((r) => r.liquid_id !== liquidId);
    saveLocalLiquids(localLiquids);
    saveLocalReviews(localReviews);
  },

  /**
   * Delete a single review.
   */
  async deleteReview(reviewId: string): Promise<void> {
    const client = getSupabaseClient();
    if (client) {
      try {
        const { error } = await client.from('reviews').delete().eq('id', reviewId);
        if (error) throw error;
        return;
      } catch (err) {
        console.warn('Supabase deleteReview failed, falling back to local:', err);
      }
    }

    // Local Mode
    const localReviews = getLocalReviews().filter((r) => r.id !== reviewId);
    saveLocalReviews(localReviews);
  },

  /**
   * Get unique reviewer names for datalist & filter options.
   */
  getKnownReviewerNames(allReviews: Review[]): string[] {
    const names = new Set<string>();
    allReviews.forEach((r) => {
      if (r.reviewer_name?.trim()) {
        names.add(r.reviewer_name.trim());
      }
    });
    return Array.from(names).sort((a, b) => a.localeCompare(b, 'pl'));
  },

  /**
   * Export all database data to JSON.
   */
  exportData(liquids: Liquid[], reviews: Review[]): string {
    const exportObject = {
      app: 'Liquid Reviews',
      version: '1.0',
      exported_at: new Date().toISOString(),
      liquids,
      reviews,
    };
    return JSON.stringify(exportObject, null, 2);
  },

  /**
   * Import data from JSON into local storage (and optionally to Supabase).
   */
  async importData(jsonContent: string): Promise<{ liquidsCount: number; reviewsCount: number }> {
    const parsed = JSON.parse(jsonContent);
    if (!parsed.liquids || !Array.isArray(parsed.liquids)) {
      throw new Error('Nieprawidłowy format pliku JSON: brak tablicy "liquids".');
    }
    const liquids: Liquid[] = parsed.liquids;
    const reviews: Review[] = Array.isArray(parsed.reviews) ? parsed.reviews : [];

    // Save to local storage
    saveLocalLiquids(liquids);
    saveLocalReviews(reviews);

    // If Supabase is connected, attempt to sync/insert
    const client = getSupabaseClient();
    if (client) {
      try {
        if (liquids.length > 0) {
          await client.from('liquids').upsert(liquids);
        }
        if (reviews.length > 0) {
          await client.from('reviews').upsert(reviews);
        }
      } catch (err) {
        console.warn('Failed to upsert imported data to Supabase:', err);
      }
    }

    return {
      liquidsCount: liquids.length,
      reviewsCount: reviews.length,
    };
  },

  /**
   * Reset local storage data back to initial demo seeds.
   */
  resetToDemoData(): void {
    localStorage.setItem(LOCAL_STORAGE_LIQUIDS, JSON.stringify(INITIAL_LIQUIDS));
    localStorage.setItem(LOCAL_STORAGE_REVIEWS, JSON.stringify(INITIAL_REVIEWS));
  },
};
