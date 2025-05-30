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

const API_URL = 'https://qdyjfdruhrpcwwmdwpzd.supabase.co/rest/v1';
const API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFkeWpmZHJ1aHJwY3d3bWR3cHpkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYzMTcxMDIsImV4cCI6MjA2MTg5MzEwMn0.rAXHAnIiOlhuNPIHqNNzzXXGzZNNhcWLsbFO-PsJXiQ';

const { width } = Dimensions.get('window');
const backgroundColors = ['#E3F2FD', '#FFF3E0', '#E8F5E9', '#FCE4EC', '#F3E5F5'];

export default function CitiesScreen({ navigation }: any) {
  const route = useRoute<any>();
  const { provinceSlug } = route.params;

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
        navigation.navigate('Streets', {
          citySlug: item.slug,
          provinceSlug: provinceSlug,
        })
      }
    >
      <Text style={styles.cityName}>{item.name}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
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
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
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