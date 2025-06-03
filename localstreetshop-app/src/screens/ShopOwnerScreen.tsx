import React, { useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '../lib/supabase';
import Footer from '../components/Footer';

export default function ShopOwnerScreen() {
  const navigation = useNavigation<any>();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();
  }, []);

  // ✅ Auto-redirect to dashboard if user is a shop owner
  useEffect(() => {
    if (user?.user_metadata?.isShopOwner) {
      navigation.navigate('ShopOwnerDashboard'); // Make sure this screen exists in your navigator
    }
  }, [user]);

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.container}>
        <Text style={styles.header}>🏪 Shop Owner Area</Text>
        <Text style={styles.description}>
          Welcome to the ShopStreet Shop Owner section!
          List your shop, manage your products, and reach new customers across Canada.
        </Text>

        <View style={styles.buttonGroup}>
          <Button
            title="📝 Sign Up as Shop Owner"
            color="#34D399"
            onPress={() => navigation.navigate('SignupScreen')}
          />
          <Button
            title="🔑 Login"
            color="#3B82F6"
            onPress={() => navigation.navigate('LoginScreen')}
          />
        </View>

        <Text style={styles.footer}>
          Already a shop owner? Log in to manage your products.
        </Text>
      </View>
      <Footer />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  header: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#1D4ED8',
    marginBottom: 12,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: '#374151',
    textAlign: 'center',
    marginBottom: 24,
  },
  buttonGroup: {
    gap: 12,
    width: '100%',
    marginBottom: 20,
  },
  footer: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 10,
    textAlign: 'center',
  },
});