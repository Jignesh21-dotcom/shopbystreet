
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';

export default function StreetPage({ params }: { params: { city: string; street: string } }) {
  const [shopsGrouped, setShopsGrouped] = useState<{
    [baseAddress: string]: {
      id: string;
      name: string;
      slug: string;
      description: string;
      parking?: string;
      address?: string;
    }[];
  }>({});
  const [sortedBaseAddresses, setSortedBaseAddresses] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { city, street } = params;

  useEffect(() => {
    const fetchShops = async () => {
      setLoading(true);
      setError(null);

      console.log('➡️ Fetching street ID for slug:', street);

      // 1️⃣ First get the street's ID
      const { data: streetData, error: streetError } = await supabase
        .from('streets')
        .select('id, name')
        .eq('slug', street)
        .single();

      if (streetError || !streetData) {
        console.error('❌ Street not found:', streetError);
        setError('Street not found.');
        setLoading(false);
        return;
      }

      console.log('✅ Found street ID:', streetData.id);

      // 2️⃣ Fetch shops linked to that street_id
      const { data: shopsData, error: shopsError } = await supabase
        .from('shops')
        .select('*')
        .eq('street_id', streetData.id);

      if (shopsError) {
        console.error('❌ Error fetching shops:', shopsError);
        setError('Failed to load shops.');
        setLoading(false);
        return;
      }

      console.log(`✅ Fetched ${shopsData.length} shops:`, shopsData);

      const grouped: { [baseAddress: string]: typeof shopsData } = {};

      shopsData.forEach((shop) => {
        const match = shop.description?.match(/^(\d+)/);
        const baseNumber = match ? match[1] : 'Other';
        const baseAddress = baseNumber
          ? `${baseNumber} ${getStreetName(shop.description)}`
          : 'Other';

        if (!grouped[baseAddress]) grouped[baseAddress] = [];
        grouped[baseAddress].push(shop);
      });

      const sortedAddresses = Object.keys(grouped).sort((a, b) => {
        const numA = parseInt(a.match(/^(\d+)/)?.[1] || '0');
        const numB = parseInt(b.match(/^(\d+)/)?.[1] || '0');
        return numA - numB;
      });

      setShopsGrouped(grouped);
      setSortedBaseAddresses(sortedAddresses);
      setLoading(false);
    };

    fetchShops();
  }, [street]);

  function getStreetName(fullAddress: string | undefined) {
    if (!fullAddress) return 'Unknown Street';
    const noNumber = fullAddress.replace(/^(\d+)\s*/, '');
    const noUnit = noNumber.split(/unit|#/i)[0].trim();
    return noUnit;
  }

  return (
    <div className="min-h-screen p-8 bg-gray-50 flex flex-col items-center">
      {/* ✅ Back to Streets button */}
      <Link
        href={`/cities/${city}`}
        className="self-start mb-6 text-blue-700 hover:text-blue-900 hover:underline"
      >
        ← Back to Streets
      </Link>

      <h1 className="text-4xl font-bold text-blue-700 mb-8 capitalize">
        🏙️ {decodeURIComponent(street).replace(/-/g, ' ')}
      </h1>

      {loading && <p className="text-gray-600 text-lg">Loading shops...</p>}

      {error && <p className="text-red-600 text-lg">{error}</p>}

      {!loading && !error && sortedBaseAddresses.length === 0 && (
        <p className="text-gray-600 text-lg">No shops found on this street yet.</p>
      )}

      {!loading &&
        !error &&
        sortedBaseAddresses.map((baseAddress) => (
          <div key={baseAddress} className="mb-10 w-full max-w-6xl">
            <h2 className="text-2xl font-bold text-blue-600 mb-4">{baseAddress}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {shopsGrouped[baseAddress].map((shop) => (
                <Link
                  key={shop.id}
                  href={`/cities/${city}/${street}/${shop.slug}`}
                  className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition flex flex-col justify-between"
                >
                  <h3 className="text-xl font-semibold text-blue-700 mb-2">{shop.name}</h3>
                  <p className="text-gray-600 flex-1">{shop.description || 'No description provided.'}</p>
                  {shop.parking && (
                    <p className="text-sm text-gray-500 mt-4">🚗 Parking: {shop.parking}</p>
                  )}
                  {shop.description && (
                    <p className="text-sm text-gray-500 mt-2">📍 {shop.description}</p>
                  )}
                </Link>
              ))}
            </div>
          </div>
        ))}
    </div>
  );
}
