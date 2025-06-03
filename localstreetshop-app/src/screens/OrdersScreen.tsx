import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Footer from '../components/Footer';

export default function OrdersScreen() {
  return (
    <View style={{ flex: 1 }}>
      <View style={styles.container}>
        <Text style={styles.title}>📦 Orders</Text>
        <Text style={styles.description}>
          This page will show all your orders. 🚧 (Coming soon)
        </Text>
      </View>
      <Footer />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1D4ED8',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: '#374151',
    textAlign: 'center',
  },
});