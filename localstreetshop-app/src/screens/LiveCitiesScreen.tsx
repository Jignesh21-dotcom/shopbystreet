import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { supabase } from '../lib/supabase';
import type { RootStackParamList } from '../../App';
import Footer from '../components/Footer';

type City = {
  slug: string;
  name: string;
  shop_count: number;
};

export default function LiveCitiesScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLiveCities = async () => {
      const { data, error } = await supabase.rpc('get_live_cities_with_shops');
      if (error) {
        console.error('Error fetching live cities:', error);
      } else {
        setCities(data);
      }
      setLoading(false);
    };

    fetchLiveCities();
  }, []);

  const handleCityPress = async (city: City) => {
    const { data, error } = await supabase
      .from('cities')
      .select('id, province')
      .eq('slug', city.slug)
      .single();

    if (error || !data?.id || !data?.province) {
      console.error('❌ Failed to get city ID or province for:', city.slug, error?.message);
      alert('Missing province. Please go back and try again.');
      return;
    }

    navigation.navigate('StreetScreen', {
      cityId: data.id.toString(),
      cityName: city.name,
      provinceSlug: data.province,
    });
  };

  const numColumns = 2;
  const screenWidth = Dimensions.get('window').width;
  const cardWidth = screenWidth / numColumns - 24;

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

        <Text style={styles.title}>🏙️ Cities with Live Shops</Text>

        {loading ? (
          <ActivityIndicator size="large" color="#007AFF" />
        ) : (
          <FlatList
            data={cities}
            keyExtractor={(item) => item.slug}
            numColumns={numColumns}
            columnWrapperStyle={{ justifyContent: 'space-between' }}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[styles.card, { width: cardWidth }]}
                onPress={() => handleCityPress(item)}
              >
                <Text style={styles.cityName}>{item.name}</Text>
                <Text style={styles.shopCount}>{item.shop_count} shops</Text>
              </TouchableOpacity>
            )}
            contentContainerStyle={{ paddingBottom: 30 }}
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
    backgroundColor: '#fff',
    padding: 16,
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
    marginBottom: 16,
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#e0f2fe',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cityName: {
    fontSize: 18,
    fontWeight: '600',
  },
  shopCount: {
    fontSize: 14,
    color: '#555',
    marginTop: 4,
  },
});