import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  Image,
  TouchableOpacity,
} from 'react-native';
import { supabase } from '../lib/supabase';
import { useNavigation } from '@react-navigation/native';
import Footer from '../components/Footer';

type Product = {
  id: string;
  name: string;
  price: number;
  description?: string;
  image_url?: string;
};

export default function ProductListScreen() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation<any>();

  useEffect(() => {
    const fetchProducts = async () => {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData?.user?.id;
      if (!userId) return;

      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('owner_id', userId);

      if (!error && data) {
        setProducts(data);
      }

      setLoading(false);
    };

    fetchProducts();
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  if (products.length === 0) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyText}>🛒 No products listed yet.</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('AddProductScreen')}
        >
          <Text style={styles.addButtonText}>➕ Add New Product</Text>
        </TouchableOpacity>
        <Footer />
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.container}>
        <Text style={styles.title}>📦 Your Products</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('AddProductScreen')}
        >
          <Text style={styles.addButtonText}>➕ Add New Product</Text>
        </TouchableOpacity>

        <FlatList
          data={products}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.price}>${item.price.toFixed(2)}</Text>
              {item.image_url && (
                <Image
                  source={{ uri: item.image_url }}
                  style={styles.image}
                />
              )}
              <Text style={styles.description}>
                {item.description?.slice(0, 80)}...
              </Text>
            </View>
          )}
          contentContainerStyle={{ paddingBottom: 32 }}
        />
      </View>
      <Footer />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#F3F4F6',
    flex: 1,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1D4ED8',
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 20,
  },
  addButton: {
    backgroundColor: '#10B981',
    padding: 12,
    borderRadius: 8,
    alignSelf: 'center',
    marginBottom: 16,
  },
  addButtonText: {
    color: '#FFF',
    fontWeight: '600',
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
    color: '#111827',
  },
  price: {
    color: '#6B7280',
    fontSize: 14,
    marginBottom: 4,
  },
  description: {
    color: '#6B7280',
    fontSize: 13,
    marginTop: 6,
  },
  image: {
    width: '100%',
    height: 150,
    borderRadius: 8,
    marginTop: 8,
  },
});