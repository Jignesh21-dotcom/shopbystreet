import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '../lib/supabase';

export default function PaymentSuccessScreen() {
  const navigation = useNavigation<any>();

  useEffect(() => {
    const activateShop = async () => {
      await supabase.auth.updateUser({
        data: { shopStatus: 'active' },
      });

      // Redirect to shop owner dashboard after a short delay
      setTimeout(() => {
        navigation.navigate('ShopOwnerDashboard');
      }, 2000);
    };

    activateShop();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.message}>✅ Payment successful! Activating your shop...</Text>
      <ActivityIndicator size="large" color="#10B981" style={{ marginTop: 20 }} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  message: {
    fontSize: 18,
    color: '#059669',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
