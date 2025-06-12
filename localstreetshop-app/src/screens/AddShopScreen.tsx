import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { supabase } from '../lib/supabase';
import { useNavigation } from '@react-navigation/native';
import Footer from '../components/Footer';

export default function AddShopScreen() {
  const navigation = useNavigation();

  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [parking, setParking] = useState('');
  const [loading, setLoading] = useState(false);

  const [countries, setCountries] = useState<any[]>([]);
  const [provinces, setProvinces] = useState<any[]>([]);
  const [cities, setCities] = useState<any[]>([]);
  const [streets, setStreets] = useState<any[]>([]);

  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedProvince, setSelectedProvince] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedStreet, setSelectedStreet] = useState('');

  useEffect(() => {
    const fetchCountries = async () => {
      const { data } = await supabase.from('countries').select('id, name').order('name');
      if (data) setCountries(data);
    };
    fetchCountries();
  }, []);

  useEffect(() => {
    if (!selectedCountry) return;
    const fetchProvinces = async () => {
      const { data } = await supabase
        .from('provinces')
        .select('id, name')
        .eq('country_id', selectedCountry)
        .order('name');
      setProvinces(data || []);
      setSelectedProvince('');
      setSelectedCity('');
      setSelectedStreet('');
      setCities([]);
      setStreets([]);
    };
    fetchProvinces();
  }, [selectedCountry]);

  useEffect(() => {
    if (!selectedProvince) return;
    const fetchCities = async () => {
      const { data } = await supabase
        .from('cities')
        .select('id, name')
        .eq('province_id', selectedProvince)
        .order('name');
      setCities(data || []);
      setSelectedCity('');
      setSelectedStreet('');
      setStreets([]);
    };
    fetchCities();
  }, [selectedProvince]);

  useEffect(() => {
    if (!selectedCity) return;
    const fetchStreets = async () => {
      const { data } = await supabase
        .from('streets')
        .select('id, name, slug')
        .eq('city_id', selectedCity)
        .order('name');
      setStreets(data || []);
      setSelectedStreet('');
    };
    fetchStreets();
  }, [selectedCity]);

  const handleSubmit = async () => {
    if (!name || !slug || !selectedStreet) {
      Alert.alert('Error', 'Please fill in all required fields.');
      return;
    }

    setLoading(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user) throw new Error('Not logged in.');

      const { error } = await supabase.from('shops').insert([{
        name,
        slug,
        street_id: selectedStreet, // Use normalized street_id
        description,
        parking,
        owner_id: userData.user.id,
      }]);

      if (error) throw error;

      Alert.alert('Success', 'Shop added successfully!');
      navigation.navigate('ShopOwnerDashboard' as never);
    } catch (err: any) {
      console.error(err);
      Alert.alert('Error', err.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>🏪 Add Your Shop</Text>

        <TextInput
          placeholder="Shop Name"
          value={name}
          onChangeText={setName}
          style={styles.input}
        />

        <TextInput
          placeholder="Slug (e.g., joes-coffee)"
          value={slug}
          onChangeText={setSlug}
          style={styles.input}
        />

        <Picker
          selectedValue={selectedCountry}
          onValueChange={(val) => setSelectedCountry(val)}
          style={styles.input}
        >
          <Picker.Item label="Select Country" value="" />
          {countries.map((c) => (
            <Picker.Item key={c.id} label={c.name} value={c.id} />
          ))}
        </Picker>

        {provinces.length > 0 && (
          <Picker
            selectedValue={selectedProvince}
            onValueChange={(val) => setSelectedProvince(val)}
            style={styles.input}
          >
            <Picker.Item label="Select Province" value="" />
            {provinces.map((p) => (
              <Picker.Item key={p.id} label={p.name} value={p.id} />
            ))}
          </Picker>
        )}

        {cities.length > 0 && (
          <Picker
            selectedValue={selectedCity}
            onValueChange={(val) => setSelectedCity(val)}
            style={styles.input}
          >
            <Picker.Item label="Select City" value="" />
            {cities.map((c) => (
              <Picker.Item key={c.id} label={c.name} value={c.id} />
            ))}
          </Picker>
        )}

        {streets.length > 0 && (
          <Picker
            selectedValue={selectedStreet}
            onValueChange={(val) => setSelectedStreet(val)}
            style={styles.input}
          >
            <Picker.Item label="Select Street" value="" />
            {streets.map((s) => (
              <Picker.Item key={s.id} label={s.name} value={s.id} />
            ))}
          </Picker>
        )}

        <TextInput
          placeholder="Description (optional)"
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={3}
          style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
        />

        <TextInput
          placeholder="Parking Info (optional)"
          value={parking}
          onChangeText={setParking}
          style={styles.input}
        />

        <TouchableOpacity
          onPress={handleSubmit}
          disabled={loading}
          style={[styles.button, loading && { opacity: 0.7 }]}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Save Shop</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
      <Footer />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#fff',
    flexGrow: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
    color: '#2563eb',
  },
  input: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#f1f5f9',
    marginBottom: 14,
    color: '#1e293b',
  },
  button: {
    backgroundColor: '#10B981',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 24,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});