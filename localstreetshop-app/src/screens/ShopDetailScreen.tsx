import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, Linking, ScrollView } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { supabase } from '../lib/supabase';
import Footer from '../components/Footer';

type Shop = {
  id: string;
  name: string;
  slug: string;
  description?: string;
  parking?: string;
  address?: string;
  lat?: number;
  lng?: number;
  contact?: string;
  hours?: string;
};

export default function ShopDetailScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { shopSlug } = route.params as { shopSlug: string };

  const [shop, setShop] = useState<Shop | null>(null);
  const [loading, setLoading] = useState(true);
  const [showContact, setShowContact] = useState(false);
  const [showHours, setShowHours] = useState(false);

  useEffect(() => {
    fetchShop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchShop = async () => {
    const { data, error } = await supabase
      .from('shops')
      .select('*')
      .eq('slug', shopSlug)
      .maybeSingle();

    if (error) {
      console.error('❌ Supabase shop error:', error.message);
    } else {
      setShop(data);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2563eb" />
        <Footer />
      </View>
    );
  }

  if (!shop) {
    return (
      <View style={styles.center}>
        <Text style={{ fontSize: 18, color: 'red' }}>No shop found.</Text>
        <Footer />
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.container}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Text style={styles.backButtonText}>{'\u2190'} Back</Text>
        </TouchableOpacity>

        <Text style={styles.header}>{shop.name}</Text>
        <Text style={styles.address}>{shop.description || 'No address available'}</Text>
        {shop.parking && <Text style={styles.info}>🚗 Parking: {shop.parking}</Text>}

        {/* Collapsible Contact Section */}
        <TouchableOpacity
          style={styles.collapseHeader}
          onPress={() => setShowContact((prev) => !prev)}
        >
          <Text style={styles.collapseHeaderText}>
            {showContact ? '▼' : '►'} Contact Info
          </Text>
        </TouchableOpacity>
        {showContact && (
          <View style={styles.collapseContent}>
            {shop.contact ? (
              <TouchableOpacity onPress={() => Linking.openURL(`tel:${shop.contact}`)}>
                <Text style={[styles.info, { color: '#2563eb', textDecorationLine: 'underline' }]}>
                  📞 {shop.contact}
                </Text>
              </TouchableOpacity>
            ) : (
              <Text style={styles.info}>Contact info not available</Text>
            )}
          </View>
        )}

        {/* Collapsible Hours Section */}
        <TouchableOpacity
          style={styles.collapseHeader}
          onPress={() => setShowHours((prev) => !prev)}
        >
          <Text style={styles.collapseHeaderText}>
            {showHours ? '▼' : '►'} Hours
          </Text>
        </TouchableOpacity>
        {showHours && (
          <View style={styles.collapseContent}>
            {shop.hours ? (
              <Text style={styles.info}>{shop.hours}</Text>
            ) : (
              <Text style={styles.info}>Hours not available</Text>
            )}
          </View>
        )}

        {shop.lat && shop.lng && (
          <TouchableOpacity
            style={styles.mapButton}
            onPress={() =>
              Linking.openURL(
                `https://www.google.com/maps/search/?api=1&query=${shop.lat},${shop.lng}`
              )
            }
          >
            <Text style={styles.mapButtonText}>📍 View on Map</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={styles.productsButton}
          onPress={() => navigation.navigate('ProductListScreen', { shopId: shop.id })}
        >
          <Text style={styles.productsButtonText}>🛒 View Products</Text>
        </TouchableOpacity>
      </ScrollView>
      <Footer />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    backgroundColor: '#fff',
    flexGrow: 1,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  header: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#1D4ED8',
  },
  address: {
    fontSize: 16,
    color: '#374151',
    marginBottom: 8,
  },
  info: {
    fontSize: 15,
    color: '#374151',
    marginBottom: 6,
  },
  mapButton: {
    backgroundColor: '#2563eb',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginVertical: 12,
  },
  mapButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  productsButton: {
    backgroundColor: '#10B981',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 24,
  },
  productsButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  collapseHeader: {
    marginTop: 16,
    marginBottom: 4,
    paddingVertical: 8,
    paddingHorizontal: 0,
  },
  collapseHeaderText: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#1D4ED8',
  },
  collapseContent: {
    marginBottom: 8,
    marginLeft: 8,
  },
});