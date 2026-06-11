import { unstable_cache } from 'next/cache';
import { supabase } from '@/lib/supabaseClient';

/**
 * Cache street data by slug for 10 minutes (600 seconds)
 */
export const getStreetBySlug = unstable_cache(
  async (streetSlug: string) => {
    return supabase
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
  },
  ['street-by-slug'],
  { revalidate: 600 }
);

/**
 * Cache shops by street_id for 10 minutes (600 seconds)
 */
export const getShopsByStreetId = unstable_cache(
  async (streetId: string) => {
    return supabase
      .from('shops')
      .select(
        'id, name, slug, description, parking, address, category, phone, street_number, image_url'
      )
      .eq('street_id', streetId)
      .eq('approved', true)
      .order('street_number', { ascending: true });
  },
  ['shops-by-street-id'],
  { revalidate: 600 }
);

/**
 * Cache shops with full details by street_id for 10 minutes
 */
export const getShopsDetailByStreetId = unstable_cache(
  async (streetId: string) => {
    return supabase
      .from('shops')
      .select(
        'id, name, slug, owner_id, description, parking, image_url, story, hours, contact, address, category, phone, street_number, email, website, instagram, facebook'
      )
      .eq('street_id', streetId)
      .eq('approved', true)
      .order('street_number', { ascending: true });
  },
  ['shops-detail-by-street-id'],
  { revalidate: 600 }
);

/**
 * Cache shops for address page by street_id for 10 minutes
 */
export const getShopsForAddressPage = unstable_cache(
  async (streetId: string) => {
    return supabase
      .from('shops')
      .select(
        'id, name, slug, description, parking, address, category, phone, street_number, image_url'
      )
      .eq('street_id', streetId)
      .eq('approved', true)
      .order('street_number', { ascending: true });
  },
  ['shops-address-page'],
  { revalidate: 600 }
);
