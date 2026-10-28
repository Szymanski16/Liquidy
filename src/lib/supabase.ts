import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Hardcoded Default Supabase Credentials (Podłączone na sztywno)
export const DEFAULT_SUPABASE_URL = 'https://rxliulqkfhhsfdzajlvk.supabase.co';
export const DEFAULT_SUPABASE_ANON_KEY = 'sb_publishable_Ci50MjPab9Jy1l6579jGKQ_elPCDB3z';

const STORAGE_KEY_URL = 'liquid_reviews_supabase_url';
const STORAGE_KEY_KEY = 'liquid_reviews_supabase_anon_key';

export interface SupabaseConfig {
  url: string;
  anonKey: string;
  isConfigured: boolean;
  isCustom: boolean;
}

export function getStoredSupabaseConfig(): SupabaseConfig {
  const customUrl = localStorage.getItem(STORAGE_KEY_URL)?.trim() || '';
  const customKey = localStorage.getItem(STORAGE_KEY_KEY)?.trim() || '';

  const envUrl = (import.meta.env.VITE_SUPABASE_URL as string | undefined)?.trim() || '';
  const envKey = (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined)?.trim() || '';

  // Priority: 1. User custom in localStorage -> 2. Environment variables -> 3. Hardcoded defaults
  const effectiveUrl = customUrl || envUrl || DEFAULT_SUPABASE_URL;
  const effectiveKey = customKey || envKey || DEFAULT_SUPABASE_ANON_KEY;

  if (effectiveUrl && effectiveKey) {
    return {
      url: effectiveUrl,
      anonKey: effectiveKey,
      isConfigured: true,
      isCustom: Boolean(customUrl && customKey),
    };
  }

  return {
    url: '',
    anonKey: '',
    isConfigured: false,
    isCustom: false,
  };
}

export function saveStoredSupabaseConfig(url: string, anonKey: string): void {
  if (url && anonKey) {
    localStorage.setItem(STORAGE_KEY_URL, url.trim());
    localStorage.setItem(STORAGE_KEY_KEY, anonKey.trim());
  } else {
    localStorage.removeItem(STORAGE_KEY_URL);
    localStorage.removeItem(STORAGE_KEY_KEY);
  }
}

export function clearStoredSupabaseConfig(): void {
  localStorage.removeItem(STORAGE_KEY_URL);
  localStorage.removeItem(STORAGE_KEY_KEY);
}

let cachedClient: SupabaseClient | null = null;
let cachedConfigKey = '';

export function getSupabaseClient(): SupabaseClient | null {
  const config = getStoredSupabaseConfig();
  if (!config.isConfigured) {
    cachedClient = null;
    return null;
  }

  const currentKey = `${config.url}::${config.anonKey}`;
  if (cachedClient && cachedConfigKey === currentKey) {
    return cachedClient;
  }

  try {
    cachedClient = createClient(config.url, config.anonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
    cachedConfigKey = currentKey;
    return cachedClient;
  } catch (err) {
    console.error('Failed to create Supabase client:', err);
    return null;
  }
}

export async function testSupabaseConnection(url: string, anonKey: string): Promise<{ success: boolean; message: string }> {
  try {
    const tempClient = createClient(url, anonKey, {
      auth: { persistSession: false },
    });

    // Test query on liquids table
    const { error } = await tempClient.from('liquids').select('id').limit(1);

    if (error) {
      if (error.code === '42P01') {
        return {
          success: false,
          message: 'Połączono z bazą, ale tabela "liquids" nie istnieje! Uruchom skrypt SQL w Supabase SQL Editor.',
        };
      }
      return {
        success: false,
        message: `Błąd połączenia: ${error.message} (kod: ${error.code})`,
      };
    }

    return {
      success: true,
      message: 'Połączenie z bazą Supabase powiodło się! Tabele są gotowe.',
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return {
      success: false,
      message: `Nie udało się połączyć z podanym adresem URL: ${errorMsg}`,
    };
  }
}

export async function uploadLiquidImage(fileBlob: Blob, liquidId: string): Promise<string | null> {
  const client = getSupabaseClient();
  if (!client) return null;

  try {
    const fileExt = fileBlob.type === 'image/jpeg' ? 'jpg' : 'webp';
    const filePath = `liquid_${liquidId}_${Date.now()}.${fileExt}`;

    const { error: uploadError } = await client.storage
      .from('liquid-images')
      .upload(filePath, fileBlob, {
        contentType: fileBlob.type,
        upsert: true,
      });

    if (uploadError) {
      console.warn('Storage upload error, continuing with fallback:', uploadError);
      return null;
    }

    const { data } = client.storage.from('liquid-images').getPublicUrl(filePath);
    return data.publicUrl;
  } catch (err) {
    console.error('Exception during image upload:', err);
    return null;
  }
}
