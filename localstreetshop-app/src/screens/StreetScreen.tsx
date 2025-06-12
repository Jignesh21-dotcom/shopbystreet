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

type Street = {
  id: string;
  name: string | null;
  slug: string;
  display_name: string | null;
};

export default function StreetScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute();
  const { cityId, cityName } = route.params as { cityId: string; cityName: string };

  const [streets, setStreets] = useState<Street[]>([]);
  const [filteredStreets, setFilteredStreets] = useState<Street[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStreets();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchStreets = async () => {
    const pageSize = 1000;
    let allResults: Street[] = [];
    let from = 0;
    let to = pageSize - 1;

    while (true) {
      const { data, error } = await supabase
        .from('streets')
        .select('id, name, slug, display_name')
        .eq('city_id', cityId)
        .order('name')
        .range(from, to);

      if (error) {
        console.error('❌ Supabase error:', error.message);
        break;
      }

      if (data && data.length > 0) {
        allResults = [...allResults, ...data];
        console.log(`🔄 Fetched rows ${from}–${to}, total so far: ${allResults.length}`);
      }

      if (!data || data.length < pageSize) {
        break; // Done fetching
      }

      from += pageSize;
      to += pageSize;
    }

    console.log('✅ Total streets fetched:', allResults.length);
    setStreets(allResults);
    setFilteredStreets(allResults);
    setLoading(false);
  };

  const handleSearch = (text: string) => {
    setSearch(text);
    const normalized = text.trim().toLowerCase();

    const filtered = streets.filter((street) => {
      const name = (street.display_name || street.name || '').toLowerCase();
      return name.includes(normalized);
    });

    setFilteredStreets(filtered);
  };

  const handleStreetPress = (street: Street) => {
    navigation.navigate('ShopListScreen', {
      streetId: street.id, // Use normalized street id
      streetName: street.display_name || street.name,
    });
  };

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

        <Text style={styles.title}>
          Streets in {cityName}
        </Text>

        <TextInput
          value={search}
          onChangeText={handleSearch}
          placeholder="Search streets..."
          style={styles.searchBar}
          placeholderTextColor="#777"
        />

        {loading ? (
          <ActivityIndicator size="large" color="#000" />
        ) : (
          <FlatList
            data={filteredStreets}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => handleStreetPress(item)}
                style={styles.streetItem}
              >
                <Text style={styles.streetName}>
                  {item.display_name || item.name}
                </Text>
              </TouchableOpacity>
            )}
            initialNumToRender={20}
            maxToRenderPerBatch={20}
            windowSize={10}
            removeClippedSubviews={true}
            contentContainerStyle={{ paddingBottom: 32 }}
          />
        )}
      </View>
      <Footer />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  searchBar: {
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontSize: 16,
    color: '#333',
  },
  streetItem: {
    padding: 16,
    borderBottomColor: '#eee',
    borderBottomWidth: 1,
  },
  streetName: {
    fontSize: 18,
    color: '#222',
  },
});