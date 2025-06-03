import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import Footer from '../components/Footer';

type Street = {
  name: string;
  slug: string;
  citySlug: string;
  provinceSlug?: string;
};

const streets: Street[] = [
  { name: 'Main Street', slug: 'main-street', citySlug: 'city-1', provinceSlug: 'province-1' },
  { name: 'Second Street', slug: 'second-street', citySlug: 'city-2' },
  { name: 'Third Street', slug: 'third-street', citySlug: 'city-3', provinceSlug: 'province-2' },
];

export default function SubmitShopScreen() {
  return (
    <View style={{ flex: 1 }}>
      <View style={styles.container}>
        <Text style={styles.title}>Submit Your Shop</Text>
        <FlatList
          data={streets}
          keyExtractor={(item) => item.slug}
          renderItem={({ item }) => (
            <View style={styles.item}>
              <Text style={styles.text}>
                {item.name} — {item.citySlug}
                {item.provinceSlug ? `, ${item.provinceSlug}` : ''}
              </Text>
            </View>
          )}
        />
      </View>
      <Footer />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff',
    flex: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#1F2937',
  },
  item: {
    paddingVertical: 8,
    borderBottomColor: '#E5E7EB',
    borderBottomWidth: 1,
  },
  text: {
    fontSize: 16,
    color: '#374151',
  },
});