import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Image,
} from 'react-native';

const { width } = Dimensions.get('window');
const numColumns = 2;
const cardSize = (width - 60) / numColumns;

const backgroundColors = ['#E3F2FD', '#FCE4EC', '#FFF3E0', '#E8F5E9', '#F3E5F5'];

type Province = {
  id: string;
  name: string;
  slug: string;
};

const getFlag = (slug: string) => {
  switch (slug) {
    case 'ontario':
      return require('../../assets/flags/ontario.png');
    case 'quebec':
      return require('../../assets/flags/quebec.png');
    case 'british-columbia':
      return require('../../assets/flags/british-columbia.png');
    case 'alberta':
      return require('../../assets/flags/alberta.png');
    case 'nova-scotia':
      return require('../../assets/flags/nova-scotia.png');
    case 'newfoundland-and-labrador':
      return require('../../assets/flags/newfoundland-and-labrador.png');
    case 'saskatchewan':
      return require('../../assets/flags/saskatchewan.png');
    case 'manitoba':
      return require('../../assets/flags/manitoba.png');
    case 'prince-edward-island':
      return require('../../assets/flags/prince-edward-island.png');
    case 'new-brunswick':
      return require('../../assets/flags/new-brunswick.png');
    case 'northwest-territories':
      return require('../../assets/flags/northwest-territories.png');
    case 'yukon':
      return require('../../assets/flags/yukon.png');
    case 'nunavut':
      return require('../../assets/flags/nunavut.png');
    default:
      return require('../../assets/flags/ontario.png'); // fallback
  }
};

export default function ProvincesScreen({ navigation }: any) {
  const [provinces, setProvinces] = useState<Province[]>([]);

  useEffect(() => {
    fetch(
      'https://qdyjfdruhrpcwwmdwpzd.supabase.co/rest/v1/provinces?select=id,name,slug',
      {
        headers: {
          apikey:
            'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFkeWpmZHJ1aHJwY3d3bWR3cHpkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYzMTcxMDIsImV4cCI6MjA2MTg5MzEwMn0.rAXHAnIiOlhuNPIHqNNzzXXGzZNNhcWLsbFO-PsJXiQ',
          Authorization:
            'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFkeWpmZHJ1aHJwY3d3bWR3cHpkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYzMTcxMDIsImV4cCI6MjA2MTg5MzEwMn0.rAXHAnIiOlhuNPIHqNNzzXXGzZNNhcWLsbFO-PsJXiQ',
        },
      }
    )
      .then((res) => res.json())
      .then((data) => setProvinces(data))
      .catch((err) => console.error(err));
  }, []);

  const renderItem = ({ item, index }: { item: Province; index: number }) => (
    <TouchableOpacity
      style={[
        styles.card,
        { backgroundColor: backgroundColors[index % backgroundColors.length] },
      ]}
      onPress={() =>
        navigation.navigate('Cities', { provinceSlug: item.slug })
      }
    >
      <Image source={getFlag(item.slug)} style={styles.flag} resizeMode="contain" />
      <Text style={styles.name}>{item.name}</Text>
    </TouchableOpacity>
  );

  return (
    <FlatList
      data={provinces}
      renderItem={renderItem}
      keyExtractor={(item) => item.id}
      numColumns={numColumns}
      columnWrapperStyle={styles.row}
      contentContainerStyle={styles.grid}
    />
  );
}

const styles = StyleSheet.create({
  grid: {
    padding: 16,
    paddingBottom: 32,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  card: {
    width: cardSize,
    height: cardSize,
    borderRadius: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
  },
  flag: {
    width: 50,
    height: 30,
    marginBottom: 10,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
});
