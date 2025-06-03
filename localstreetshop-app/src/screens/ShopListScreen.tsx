import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  StyleSheet,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { supabase } from '../lib/supabase';
import Footer from '../components/Footer';

type Shop = {
  id: string;
  name: string;
  slug: string;
  description?: string;
  parking?: string;
};

type ShopGroup = {
  plaza: string;
  shops: Shop[];
};

export default function ShopListScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute();
  const { streetSlug, streetName } = route.params as {
    streetSlug: string;
    streetName: string;
  };

  const [shops, setShops] = useState<Shop[]>([]);
  const [filteredGroups, setFilteredGroups] = useState<ShopGroup[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchShops();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchShops = async () => {
    const { data, error } = await supabase
      .from('shops')
      .select('id, name, slug, description, parking')
      .eq('streetSlug', streetSlug)
      .eq('approved', true);

    if (error) {
      console.error('❌ Supabase shop error:', error.message);
    } else {
      setShops(data || []);
      filterAndGroupShops(data || [], search);
    }

    setLoading(false);
  };

  const getBaseAddress = (description?: string): number => {
    if (!description) return Infinity;
    const match = description.match(/^(\d+)/);
    return match ? parseInt(match[1], 10) : Infinity;
  };

  const getPlazaName = (description?: string): string => {
    if (!description) return 'Other';
    const match = description.match(/(.+?\b(Plaza|Mall|Centre|Center)\b.*?)/i);
    if (match) return match[1].trim();

    const base = description
      .replace(/(Unit|Suite|#)\s*\d+/i, '')
      .replace(/,.*$/, '')
      .trim();
    return base || 'Other';
  };

  const filterAndGroupShops = (allShops: Shop[], searchText: string) => {
    const normalized = searchText.toLowerCase().trim();

    const filtered = allShops
      .filter((shop) => {
        const nameMatch = shop.name.toLowerCase().includes(normalized);
        const descMatch = shop.description?.toLowerCase().includes(normalized) ?? false;
        return nameMatch || descMatch;
      })
      .sort((a, b) => getBaseAddress(a.description) - getBaseAddress(b.description));

    const groups: Record<string, Shop[]> = {};
    for (const shop of filtered) {
      const plaza = getPlazaName(shop.description);
      if (!groups[plaza]) groups[plaza] = [];
      groups[plaza].push(shop);
    }

    const grouped: ShopGroup[] = Object.entries(groups).map(([plaza, shops]) => ({
      plaza,
      shops,
    }));

    setFilteredGroups(grouped);
  };

  const handleSearch = (text: string) => {
    setSearch(text);
    filterAndGroupShops(shops, text);
  };

  const handleShopPress = (shop: Shop) => {
    navigation.navigate('ShopDetailScreen', {
      shopSlug: shop.slug,
    });
  };

  const renderShopItem = (shop: Shop) => (
    <TouchableOpacity
      key={shop.id}
      style={styles.card}
      onPress={() => handleShopPress(shop)}
    >
      <Text style={styles.shopName}>{shop.name}</Text>
      <Text style={styles.shopDesc}>{shop.description || 'No address'}</Text>
      {shop.parking && <Text style={styles.shopDesc}>🚗 Parking: {shop.parking}</Text>}
    </TouchableOpacity>
  );

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.container}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Text style={styles.backButtonText}>{'\u2190'} Back</Text>
        </TouchableOpacity>

        <Text style={styles.header}>Shops on {streetName}</Text>

        <TextInput
          value={search}
          onChangeText={handleSearch}
          placeholder="Search by name or number..."
          style={styles.searchBar}
        />

        {loading ? (
          <ActivityIndicator size="large" color="#000" />
        ) : filteredGroups.length === 0 ? (
          <Text style={{ fontSize: 16, marginTop: 20 }}>No shops found.</Text>
        ) : (
          <FlatList
            data={filteredGroups}
            keyExtractor={(item) => item.plaza}
            renderItem={({ item }) => (
              <View style={styles.groupBlock}>
                <Text style={styles.groupTitle}>{item.plaza}</Text>
                {item.shops.map(renderShopItem)}
              </View>
            )}
            initialNumToRender={5}
            maxToRenderPerBatch={10}
            windowSize={10}
            contentContainerStyle={{ paddingBottom: 30 }}
          />
        )}
      </View>
      <Footer />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginTop: 8,
    marginBottom: 4,
    alignSelf: 'flex-start',
  },
  backButtonText: {
    fontSize: 17,
    color: '#2563eb',
    fontWeight: '600',
  },
  header: { fontSize: 24, fontWeight: 'bold', marginBottom: 10 },
  searchBar: {
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontSize: 16,
  },
  groupBlock: {
    marginBottom: 24,
  },
  groupTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    backgroundColor: '#eef',
    padding: 6,
    borderRadius: 6,
  },
  card: {
    backgroundColor: '#f9f9f9',
    padding: 14,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  shopName: {
    fontSize: 16,
    fontWeight: '600',
  },
  shopDesc: {
    fontSize: 14,
    color: '#555',
    marginTop: 4,
  },
});