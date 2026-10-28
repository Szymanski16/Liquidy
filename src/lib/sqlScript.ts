/**
 * Production-ready SQL script to initialize tables, RLS policies,
 * indexes, and the storage bucket in Supabase for the Liquid Reviews app.
 */

export const SUPABASE_SQL_SCRIPT = `-- ==============================================================================
-- LIQUID REVIEWS - SUPABASE SETUP SCRIPT (Database + Storage + RLS)
-- Wklej ten skrypt w Supabase SQL Editor (Dashboard -> SQL Editor -> New Query)
-- i kliknij RUN.
-- ==============================================================================

-- 1. TABELA LIQUIDÓW / LONGFILLI (Katalog)
CREATE TABLE IF NOT EXISTS public.liquids (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    brand TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'Longfill',
    flavor_category TEXT NOT NULL DEFAULT 'Owocowe',
    aroma_volume_ml NUMERIC DEFAULT 10,
    image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 2. TABELA RECENZJI (Relacja 1-do-wielu: produkt -> oceny znajomych)
CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    liquid_id UUID NOT NULL REFERENCES public.liquids(id) ON DELETE CASCADE,
    reviewer_name TEXT NOT NULL,
    overall_rating NUMERIC(3, 1) NOT NULL CHECK (overall_rating >= 1.0 AND overall_rating <= 10.0),
    sweetness INTEGER NOT NULL CHECK (sweetness >= 1 AND sweetness <= 5),
    cooling INTEGER NOT NULL CHECK (cooling >= 1 AND cooling <= 5),
    intensity INTEGER NOT NULL CHECK (intensity >= 1 AND intensity <= 5),
    throat_hit INTEGER NOT NULL CHECK (throat_hit >= 1 AND throat_hit <= 5),
    coil_life INTEGER NOT NULL CHECK (coil_life >= 1 AND coil_life <= 5),
    device_setup TEXT,
    coil_resistance TEXT,
    nicotine_type TEXT,
    nicotine_mg NUMERIC,
    vg_pg_ratio TEXT,
    steeping_days INTEGER DEFAULT 0,
    verdict TEXT NOT NULL,
    comment TEXT,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 3. INDEKSY DLA SZYBKIEGO WYSZUKIWANIA I SORTOWANIA
CREATE INDEX IF NOT EXISTS idx_reviews_liquid_id ON public.reviews(liquid_id);
CREATE INDEX IF NOT EXISTS idx_reviews_reviewer ON public.reviews(reviewer_name);
CREATE INDEX IF NOT EXISTS idx_liquids_brand ON public.liquids(brand);
CREATE INDEX IF NOT EXISTS idx_liquids_category ON public.liquids(flavor_category);

-- 4. WŁĄCZENIE ROW LEVEL SECURITY (RLS)
ALTER TABLE public.liquids ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- 5. POLITYKI DOSTĘPU DLA ZNAJOMYCH (Rola Anon / Public - odczyt, dodawanie, edycja i usuwanie)
-- liquids:
DROP POLICY IF EXISTS "Public can view liquids" ON public.liquids;
CREATE POLICY "Public can view liquids" ON public.liquids FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public can insert liquids" ON public.liquids;
CREATE POLICY "Public can insert liquids" ON public.liquids FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Public can update liquids" ON public.liquids;
CREATE POLICY "Public can update liquids" ON public.liquids FOR UPDATE USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public can delete liquids" ON public.liquids;
CREATE POLICY "Public can delete liquids" ON public.liquids FOR DELETE USING (true);

-- reviews:
DROP POLICY IF EXISTS "Public can view reviews" ON public.reviews;
CREATE POLICY "Public can view reviews" ON public.reviews FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public can insert reviews" ON public.reviews;
CREATE POLICY "Public can insert reviews" ON public.reviews FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Public can update reviews" ON public.reviews;
CREATE POLICY "Public can update reviews" ON public.reviews FOR UPDATE USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public can delete reviews" ON public.reviews;
CREATE POLICY "Public can delete reviews" ON public.reviews FOR DELETE USING (true);

-- 6. PUBLICZNY STORAGE BUCKET NA ZDJĘCIA BUTELEK ('liquid-images')
INSERT INTO storage.buckets (id, name, public)
VALUES ('liquid-images', 'liquid-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Polityki dla Storage (odczyt publiczny, upload dla anon)
DROP POLICY IF EXISTS "Public images read" ON storage.objects;
CREATE POLICY "Public images read" ON storage.objects
    FOR SELECT USING (bucket_id = 'liquid-images');

DROP POLICY IF EXISTS "Public images upload" ON storage.objects;
CREATE POLICY "Public images upload" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'liquid-images');

DROP POLICY IF EXISTS "Public images update" ON storage.objects;
CREATE POLICY "Public images update" ON storage.objects
    FOR UPDATE USING (bucket_id = 'liquid-images');

DROP POLICY IF EXISTS "Public images delete" ON storage.objects;
CREATE POLICY "Public images delete" ON storage.objects
    FOR DELETE USING (bucket_id = 'liquid-images');

-- ==============================================================================
-- GOTOWE! Twoja baza Supabase jest w pełni przygotowana do obsługi aplikacji.
-- ==============================================================================
`;
