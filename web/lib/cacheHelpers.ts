import { supabase } from '@/lib/supabaseClient';

const TTL_MS = 10 * 60 * 1000;

type CacheEntry<T> = {
  value: T;
  expiresAt: number;
};

const streetCache = new Map<string, CacheEntry<any>>();
const shopsByStreetCache = new Map<string, CacheEntry<any>>();
const shopsDetailByStreetCache = new Map<string, CacheEntry<any>>();
const shopsForAddressCache = new Map<string, CacheEntry<any>>();

const streetInflight = new Map<string, Promise<any>>();
const shopsByStreetInflight = new Map<string, Promise<any>>();
const shopsDetailByStreetInflight = new Map<string, Promise<any>>();
const shopsForAddressInflight = new Map<string, Promise<any>>();

function getFreshCachedValue<T>(cache: Map<string, CacheEntry<T>>, key: string): T | null {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() >= entry.expiresAt) {
    cache.delete(key);
    return null;
  }
  return entry.value;
}

function setCachedValue<T>(cache: Map<string, CacheEntry<T>>, key: string, value: T): T {
  cache.set(key, { value, expiresAt: Date.now() + TTL_MS });
  return value;
}

export async function getStreetBySlug(streetSlug: string) {
  const cacheKey = streetSlug.toLowerCase();
  const cached = getFreshCachedValue(streetCache, cacheKey);
  if (cached) return cached;

  const pending = streetInflight.get(cacheKey);
  if (pending) return pending;

  const request = (async () => {
    try {
      const result = await supabase
        .from('streets')
        .select(`
          id,
          name,
          slug,
          city:city_id (
            name,
            slug,
            province:province_id (
              slug
            )
          )
        `)
        .eq('slug', streetSlug)
        .single();

      return setCachedValue(streetCache, cacheKey, result);
    } finally {
      streetInflight.delete(cacheKey);
    }
  })();

  streetInflight.set(cacheKey, request);
  return request;
}

export async function getShopsByStreetId(streetId: string) {
  const cacheKey = streetId;
  const cached = getFreshCachedValue(shopsByStreetCache, cacheKey);
  if (cached) return cached;

  const pending = shopsByStreetInflight.get(cacheKey);
  if (pending) return pending;

  const request = (async () => {
    try {
      const result = await supabase
        .from('shops')
        .select(
          'id, name, slug, description, parking, address, category, phone, street_number, image_url'
        )
        .eq('street_id', streetId)
        .eq('approved', true)
        .order('street_number', { ascending: true });

      return setCachedValue(shopsByStreetCache, cacheKey, result);
    } finally {
      shopsByStreetInflight.delete(cacheKey);
    }
  })();

  shopsByStreetInflight.set(cacheKey, request);
  return request;
}

export async function getShopsDetailByStreetId(streetId: string) {
  const cacheKey = streetId;
  const cached = getFreshCachedValue(shopsDetailByStreetCache, cacheKey);
  if (cached) return cached;

  const pending = shopsDetailByStreetInflight.get(cacheKey);
  if (pending) return pending;

  const request = (async () => {
    try {
      const result = await supabase
        .from('shops')
        .select(
          'id, name, slug, owner_id, description, parking, image_url, story, hours, contact, address, category, phone, street_number, email, website, instagram, facebook'
        )
        .eq('street_id', streetId)
        .eq('approved', true)
        .order('street_number', { ascending: true });

      return setCachedValue(shopsDetailByStreetCache, cacheKey, result);
    } finally {
      shopsDetailByStreetInflight.delete(cacheKey);
    }
  })();

  shopsDetailByStreetInflight.set(cacheKey, request);
  return request;
}

export async function getShopsForAddressPage(streetId: string) {
  const cacheKey = streetId;
  const cached = getFreshCachedValue(shopsForAddressCache, cacheKey);
  if (cached) return cached;

  const pending = shopsForAddressInflight.get(cacheKey);
  if (pending) return pending;

  const request = (async () => {
    try {
      const result = await supabase
        .from('shops')
        .select(
          'id, name, slug, description, parking, address, category, phone, street_number, image_url'
        )
        .eq('street_id', streetId)
        .eq('approved', true)
        .order('street_number', { ascending: true });

      return setCachedValue(shopsForAddressCache, cacheKey, result);
    } finally {
      shopsForAddressInflight.delete(cacheKey);
    }
  })();

  shopsForAddressInflight.set(cacheKey, request);
  return request;
}
