import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
  Image,
  ScrollView,
} from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import { Picker } from '@react-native-picker/picker';
import { supabase } from '../lib/supabase';
import uuid from 'react-native-uuid';
import { useNavigation } from '@react-navigation/native';
import Footer from '../components/Footer';

export default function AddProductScreen() {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [shops, setShops] = useState<any[]>([]);
  const [selectedShop, setSelectedShop] = useState('');
  const navigation = useNavigation<any>();

  useEffect(() => {
    const fetchShops = async () => {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData?.user?.id;
      if (!userId) return;

      const { data, error } = await supabase
        .from('shops')
        .select('id, name')
        .eq('owner_id', userId);

      if (!error && data.length > 0) {
        setShops(data);
        setSelectedShop(data[0].id);
      }
    };

    fetchShops();
  }, []);

  const handlePickImage = async () => {
    const result = await launchImageLibrary({ mediaType: 'photo' });

    if (result.assets && result.assets.length > 0) {
      const file = result.assets[0];
      setImageUri(file.uri || null);
      setImageFile(file);
    }
  };

  const handleSubmit = async () => {
    if (!name || !price || !description || !imageFile || !selectedShop) {
      Alert.alert('Please fill in all fields and select an image.');
      return;
    }

    setLoading(true);

    try {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData?.user?.id;
      if (!userId) throw new Error('User not found');

      const ext = imageFile.fileName?.split('.').pop() || 'jpg';
      const fileName = `${uuid.v4()}.${ext}`;
      const response = await fetch(imageFile.uri);
      const blob = await response.blob();

      const { error: uploadError } = await supabase.storage
        .from('products')
        .upload(fileName, blob);

      if (uploadError) throw uploadError;

      const imageUrl = `${process.env.EXPO_PUBLIC_SUPABASE_URL}/storage/v1/object/public/products/${fileName}`;

      const { error: insertError } = await supabase.from('products').insert([
        {
          name,
          price: parseFloat(price),
          description,
          image_url: imageUrl,
          owner_id: userId,
          shop_id: selectedShop,
        },
      ]);

      if (insertError) throw insertError;

      Alert.alert('✅ Product added!');
      navigation.navigate('ProductListScreen');
    } catch (err: any) {
      console.error(err);
      Alert.alert('❌ Error', err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>➕ Add New Product</Text>

        <Picker
          selectedValue={selectedShop}
          onValueChange={(itemValue) => setSelectedShop(itemValue)}
          style={styles.input}
        >
          {shops.map((shop) => (
            <Picker.Item key={shop.id} label={shop.name} value={shop.id} />
          ))}
        </Picker>

        <TextInput
          placeholder="Product Name"
          value={name}
          onChangeText={setName}
          style={styles.input}
        />
        <TextInput
          placeholder="Price"
          value={price}
          onChangeText={setPrice}
          keyboardType="numeric"
          style={styles.input}
        />
        <TextInput
          placeholder="Description"
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={4}
          style={[styles.input, { height: 100 }]}
        />

        <TouchableOpacity onPress={handlePickImage} style={styles.uploadBtn}>
          <Text style={styles.uploadBtnText}>📷 {imageUri ? 'Change Image' : 'Select Image'}</Text>
        </TouchableOpacity>

        {imageUri && (
          <Image
            source={{ uri: imageUri }}
            style={{ width: '100%', height: 200, borderRadius: 10, marginBottom: 10 }}
          />
        )}

        {loading ? (
          <ActivityIndicator size="large" color="#10B981" />
        ) : (
          <Button title="Save Product" onPress={handleSubmit} color="#10B981" />
        )}
      </ScrollView>
      <Footer />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#F3F4F6',
    flexGrow: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#1D4ED8',
  },
  input: {
    backgroundColor: '#FFF',
    padding: 12,
    marginBottom: 12,
    borderRadius: 8,
  },
  uploadBtn: {
    backgroundColor: '#3B82F6',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  uploadBtnText: {
    color: '#FFF',
    fontWeight: '600',
    textAlign: 'center',
  },
});