import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  ScrollView,
  Alert,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '../lib/supabase';
import Footer from '../components/Footer';

export default function ClaimShopScreen() {
  const navigation = useNavigation<any>();
  const [user, setUser] = useState<any>(null);
  const [search, setSearch] = useState('');
  const [shops, setShops] = useState<any[]>([]);
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);

  // ✅ Get logged-in user
  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigation.navigate('LoginScreen');
      } else {
        setUser(user);
      }
    };

    fetchUser();
  }, []);

  // ✅ Handle shop search (with street/city join)
  const handleSearch = async () => {
    if (!search.trim()) return;
    setLoading(true);

    const { data, error } = await supabase
      .from('shops')
      .select(`
        id,
        name,
        street:street_id (
          name,
          city:city_id (
            name
          )
        )
      `)
      .ilike('name', `%${search}%`)
      .limit(10);

    if (error) {
      Alert.alert('Search Failed', error.message);
    } else {
      // Normalize street and city to objects (not arrays)
      const normalized = (data || []).map((shop: any) => {
        let street = shop.street;
        if (Array.isArray(street)) street = street[0] || null;
        if (street && Array.isArray(street.city)) street.city = street.city[0] || null;
        return { ...shop, street };
      });
      setShops(normalized);
    }

    setLoading(false);
  };

  // ✅ Submit a claim
  const handleClaim = async (shopId: string) => {
    if (!user) return;

    setSubmitting(true);

    const { error } = await supabase.from('shop_claims').insert([
      {
        shop_id: shopId,
        user_id: user.id,
        message,
      },
    ]);

    if (error) {
      Alert.alert('❌ Claim Failed', 'You may have already submitted one.');
      console.error(error.message);
    } else {
      Alert.alert('✅ Claim Sent', 'Your request was submitted for review.');
      setMessage('');
    }

    setSubmitting(false);
  };

  return (
    <View style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>🔍 Claim Your Shop</Text>
        <Text style={styles.description}>
          Search your shop below. If it's listed, you can request access to manage it.
        </Text>

        <View style={styles.searchRow}>
          <TextInput
            style={styles.input}
            placeholder="Enter shop name"
            value={search}
            onChangeText={setSearch}
          />
          <Button title="Search" onPress={handleSearch} />
        </View>

        {loading && <ActivityIndicator size="small" color="#000" style={{ marginTop: 12 }} />}

        {shops.length > 0 && (
          <View style={{ marginTop: 16 }}>
            {shops.map((shop) => (
              <View key={shop.id} style={styles.shopCard}>
                <Text style={styles.shopName}>{shop.name}</Text>
                <Text style={styles.streetInfo}>
                  {shop.street?.name
                    ? `Street: ${shop.street.name}${shop.street.city?.name ? `, ${shop.street.city.name}` : ''}`
                    : 'Street: N/A'}
                </Text>

                <TextInput
                  style={styles.messageBox}
                  placeholder="Add a message for the admin (optional)"
                  value={message}
                  onChangeText={setMessage}
                  multiline
                />

                <Button
                  title={submitting ? 'Submitting...' : '📩 Request Access'}
                  onPress={() => handleClaim(shop.id)}
                  disabled={submitting}
                />
              </View>
            ))}
          </View>
        )}
      </ScrollView>
      <Footer />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1D4ED8',
    marginBottom: 10,
  },
  description: {
    fontSize: 14,
    color: '#4B5563',
    marginBottom: 20,
  },
  searchRow: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },
  input: {
    flex: 1,
    borderColor: '#D1D5DB',
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
  },
  shopCard: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  shopName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  streetInfo: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 8,
  },
  messageBox: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 6,
    padding: 10,
    height: 60,
    marginBottom: 12,
  },
});