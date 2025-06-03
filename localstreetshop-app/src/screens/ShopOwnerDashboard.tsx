import React, { useEffect, useState } from 'react';
import { View, Text, Button, ActivityIndicator, Alert, StyleSheet, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '../lib/supabase';
import Footer from '../components/Footer';

export default function ShopOwnerDashboard() {
  const navigation = useNavigation<any>();
  const [user, setUser] = useState<any>(null);
  const [shop, setShop] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchUserAndShop = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigation.navigate('LoginScreen');
        return;
      }
      setUser(user);

      if (!user.user_metadata?.isShopOwner) {
        navigation.navigate('ShopOwnerScreen');
        return;
      }

      const { data: shopData, error } = await supabase
        .from('shops')
        .select('*')
        .eq('owner_id', user.id)
        .eq('approved', true)
        .maybeSingle();

      if (error) {
        console.error('Error fetching shop:', error.message);
      } else {
        setShop(shopData);
      }
    };

    fetchUserAndShop();
  }, []);

  const shopStatus = user?.user_metadata?.shopStatus || 'pendingPayment';

  const handlePayment = async () => {
    setLoading(true);
    try {
      // Replace this with your real payment link or logic
      Alert.alert('Redirecting to payment...');
    } catch (err) {
      console.error(err);
      Alert.alert('Something went wrong during payment.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.header}>🛍️ Shop Owner Dashboard</Text>
        <Text style={styles.subtitle}>
          Welcome, <Text style={styles.email}>{user?.email}</Text>! This is your shop management area.
        </Text>

        {!shop ? (
          <View style={styles.cardYellow}>
            <Text style={styles.textBold}>🚨 You haven't added or claimed a shop yet.</Text>

            <View style={styles.buttonGroup}>
              <Button
                title="🔍 Check Existing Shops"
                onPress={() => navigation.navigate('ClaimShopScreen')}
                color="#3B82F6"
              />
              <Button
                title="➕ Add New Shop"
                onPress={() => navigation.navigate('AddShopScreen')}
                color="#10B981"
              />
            </View>

            <Text style={styles.note}>
              If your shop is already listed, you can claim it. Otherwise, add a new shop.
            </Text>
          </View>
        ) : (
          <>
            <View style={styles.cardGreen}>
              <Text>✅ <Text style={styles.textBold}>Your Shop:</Text> {shop.name} (on {shop.streetSlug})</Text>
            </View>

            {shopStatus === 'pendingPayment' ? (
              <View style={styles.cardYellow}>
                <Text>⚠️ Your shop is not active yet. Complete your $49 payment to unlock product management.</Text>
                <View style={{ marginTop: 12 }}>
                  <Button
                    title={loading ? 'Redirecting to payment...' : '💳 Complete Payment'}
                    onPress={handlePayment}
                    disabled={loading}
                    color="#10B981"
                  />
                </View>
              </View>
            ) : (
              <>
                <Button
                  title="➕ Add Product"
                  onPress={() => navigation.navigate('AddProductScreen')}
                  color="#10B981"
                />
                <View style={{ marginTop: 16 }}>
                  <Button
                    title="📦 Manage Products"
                    onPress={() => navigation.navigate('ManageProductsScreen')}
                    color="#3B82F6"
                  />
                </View>
                <View style={{ marginTop: 12 }}>
                  <Button
                    title="🧾 View Orders"
                    onPress={() => navigation.navigate('OrdersScreen')}
                    color="#6366F1"
                  />
                </View>
              </>
            )}
          </>
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
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1D4ED8',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#374151',
    marginBottom: 20,
    textAlign: 'center',
  },
  email: {
    fontWeight: 'bold',
    color: '#111827',
  },
  cardYellow: {
    backgroundColor: '#FEF9C3',
    padding: 16,
    borderRadius: 10,
    marginBottom: 20,
  },
  cardGreen: {
    backgroundColor: '#D1FAE5',
    padding: 16,
    borderRadius: 10,
    marginBottom: 20,
  },
  textBold: {
    fontWeight: 'bold',
  },
  note: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 10,
  },
  buttonGroup: {
    marginTop: 12,
    gap: 10,
  },
});