export type LiquidType = 'Longfill' | 'Gotowy Liquid' | 'Własny Samogon / Aromat';

export type FlavorCategory = 
  | 'Owocowe' 
  | 'Menthol / Ice' 
  | 'Deserowe' 
  | 'Kwaśne' 
  | 'Napoje' 
  | 'Tytoniowe';

export type NicotineType = 
  | 'Sól (Nicsalt)' 
  | 'Zwykła (Freebase)' 
  | 'Zerówka (0mg)';

export type VerdictType = 
  | 'ADV (All Day Vape - kupię ponownie)' 
  | 'Okazjonalnie' 
  | 'Do zlewu (Unikać)';

export interface Review {
  id: string;
  liquid_id: string;
  reviewer_name: string;
  overall_rating: number; // 1.0 - 10.0
  sweetness: number;      // 1-5
  cooling: number;        // 1-5
  intensity: number;      // 1-5
  throat_hit: number;     // 1-5
  coil_life: number;      // 1-5 (1 = Coil killer, 5 = Czysty)
  device_setup?: string;
  coil_resistance?: string;
  nicotine_type?: NicotineType;
  nicotine_mg?: number;
  vg_pg_ratio?: string;
  steeping_days?: number;
  verdict: VerdictType;
  comment?: string;
  created_at: string;
}

export interface Liquid {
  id: string;
  name: string;
  brand: string;
  type: LiquidType;
  flavor_category: FlavorCategory;
  aroma_volume_ml?: number;
  image_url?: string;
  created_at: string;
}

export interface LiquidWithReviews extends Liquid {
  reviews: Review[];
  stats: {
    avgRating: number;
    reviewCount: number;
    avgSweetness: number;
    avgCooling: number;
    avgIntensity: number;
    avgThroatHit: number;
    avgCoilLife: number;
    ratingSpread: number; // max - min
    isControversial: boolean; // spread >= 3.5
    isConsensusFavorite: boolean; // spread <= 1.5 && avgRating >= 8.0 && count >= 2
    hasAdv: boolean;
    advCount: number;
    sinkCount: number;
  };
}

export type SortOption = 
  | 'rating_desc' 
  | 'rating_asc' 
  | 'reviews_count' 
  | 'newest' 
  | 'controversial'
  | 'coil_friendly';

export type QuickFilterPill = 
  | 'all' 
  | 'adv_only' 
  | 'no_cooling' 
  | 'coil_friendly' 
  | 'controversial' 
  | 'blacklist';

export interface FilterState {
  searchQuery: string;
  category: FlavorCategory | 'Wszystkie';
  reviewer: string | 'Wszyscy';
  quickFilter: QuickFilterPill;
  sortBy: SortOption;
}

export interface AppConfig {
  supabaseUrl: string;
  supabaseAnonKey: string;
  isCustomConfigured: boolean;
}
