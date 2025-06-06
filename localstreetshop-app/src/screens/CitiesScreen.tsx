import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { useRoute } from '@react-navigation/native';
import Footer from '../components/Footer';

const API_URL = 'https://qdyjfdruhrpcwwmdwpzd.supabase.co/rest/v1';
const API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFkeWpmZHJ1aHJwY3d3bWR3cHpkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYzMTcxMDIsImV4cCI6MjA2MTg5MzEwMn0.rAXHAnIiOlhuNPIHqNNzzXXGzZNNhcWLsbFO-PsJXiQ'; // Replace with secure env value

const { width } = Dimensions.get('window');
const backgroundColors = ['#E3F2FD', '#FFF3E0', '#E8F5E9', '#FCE4EC', '#F3E5F5'];

export default function CitiesScreen({ navigation }: any) {
  const route = useRoute<any>();
  const { provinceSlug } = route.params || {};

  const [cities, setCities] = useState<{ id: string; name: string; slug: string }[]>([]);
  const [filteredCities, setFilteredCities] = useState(cities);
  const [searchText, setSearchText] = useState('');

  const convertSlugToName = (slug: string) => {
    return slug
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  useEffect(() => {
    if (!provinceSlug) return;

    const provinceName = convertSlugToName(provinceSlug);

    fetch(`${API_URL}/cities?select=id,name,slug&province=eq.${provinceName}`, {
      headers: {
        apikey: API_KEY,
        Authorization: `Bearer ${API_KEY}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setCities(data);
        setFilteredCities(data);
      })
      .catch((err) => console.error('Error fetching cities:', err));
  }, [provinceSlug]);

  useEffect(() => {
    const filtered = cities.filter((city) =>
      city.name.toLowerCase().includes(searchText.toLowerCase())
    );
    setFilteredCities(filtered);
  }, [searchText, cities]);

  const renderItem = ({ item, index }: { item: any; index: number }) => (
    <TouchableOpacity
      style={[
        styles.cityItem,
        { backgroundColor: backgroundColors[index % backgroundColors.length] },
      ]}
      onPress={() =>
        navigation.navigate('StreetScreen', {
          cityId: item.id,
          cityName: item.name,
        })
      }
    >
      <Text style={styles.cityName}>{item.name}</Text>
    </TouchableOpacity>
  );

  if (!provinceSlug) {
    return (
      <View style={styles.container}>
        <Text style={{ fontSize: 18, color: 'red' }}>
          ❌ Missing province slug. Please go back and try again.
        </Text>
      </View>
    );
  }

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
        <TextInput
          style={styles.searchBar}
          placeholder="Search city..."
          value={searchText}
          onChangeText={setSearchText}
          placeholderTextColor="#777"
        />
        <FlatList
          data={filteredCities}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
        />
      </View>
      <Footer />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
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
  searchBar: {
    height: 48,
    borderRadius: 12,
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 16,
    marginBottom: 16,
    fontSize: 16,
    color: '#333',
  },
  listContent: {
    paddingBottom: 32,
  },
  cityItem: {
    padding: 20,
    marginBottom: 16,
    borderRadius: 14,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  cityName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
});