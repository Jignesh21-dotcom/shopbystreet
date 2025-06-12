import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Switch,
  StyleSheet,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { supabase } from '../lib/supabase';
import Footer from '../components/Footer';

export default function SubmitShopFormScreen() {
  const [form, setForm] = useState({
    name: '',
    provinceId: '',
    cityId: '',
    streetId: '',
    parking: 'Paid Parking Nearby',
    wantsProducts: false,
  });

  const [provinces, setProvinces] = useState<any[]>([]);
  const [cities, setCities] = useState<any[]>([]);
  const [streets, setStreets] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (form.provinceId) {
      setForm((prev) => ({ ...prev, cityId: '', streetId: '' }));
      fetchCities();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.provinceId]);

  useEffect(() => {
    if (form.cityId) {
      setForm((prev) => ({ ...prev, streetId: '' }));
      fetchStreets();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.cityId]);

  const fetchInitialData = async () => {
    const { data: provs } = await supabase.from('provinces').select('id, name');
    setProvinces(provs || []);
  };

  const fetchCities = async () => {
    const { data: citiesData } = await supabase
      .from('cities')
      .select('id, name')
      .eq('province_id', form.provinceId);
    setCities(citiesData || []);
  };

  const fetchStreets = async () => {
    const { data: streetsData } = await supabase
      .from('streets')
      .select('id, name')
      .eq('city_id', form.cityId);
    setStreets(streetsData || []);
  };

  const handleSubmit = async () => {
    if (!form.name || !form.provinceId || !form.cityId || !form.streetId) {
      Alert.alert('Missing fields', 'Please fill all required fields.');
      return;
    }

    setLoading(true);

    const newShop = {
      name: form.name,
      slug: form.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
      street_id: form.streetId, // Use normalized street_id
      parking: form.parking,
      wantsProducts: form.wantsProducts,
      paid: false,
    };

    const { error } = await supabase.from('shops').insert([newShop]);

    setLoading(false);

    if (error) {
      Alert.alert('Error', 'Failed to submit shop.');
    } else {
      setSubmitted(true);
    }
  };

  if (submitted) {
    return (
      <View style={[styles.centered, { flex: 1 }]}>
        <Text style={styles.successText}>
          ✅ Shop submitted successfully! We’ll contact you if you selected product options.
        </Text>
        <Footer />
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Submit Your Shop</Text>

        <TextInput
          placeholder="Shop Name"
          value={form.name}
          onChangeText={(text) => setForm({ ...form, name: text })}
          style={styles.input}
        />

        <Picker
          selectedValue={form.provinceId}
          onValueChange={(value) => setForm({ ...form, provinceId: value })}
          style={styles.input}
        >
          <Picker.Item label="-- Select Province --" value="" />
          {provinces.map((prov) => (
            <Picker.Item key={prov.id} label={prov.name} value={prov.id} />
          ))}
        </Picker>

        <Picker
          selectedValue={form.cityId}
          enabled={!!form.provinceId}
          onValueChange={(value) => setForm({ ...form, cityId: value })}
          style={styles.input}
        >
          <Picker.Item label="-- Select City --" value="" />
          {cities.map((city) => (
            <Picker.Item key={city.id} label={city.name} value={city.id} />
          ))}
        </Picker>

        <Picker
          selectedValue={form.streetId}
          enabled={!!form.cityId}
          onValueChange={(value) => setForm({ ...form, streetId: value })}
          style={styles.input}
        >
          <Picker.Item label="-- Select Street --" value="" />
          {streets.map((street) => (
            <Picker.Item key={street.id} label={street.name} value={street.id} />
          ))}
        </Picker>

        <Picker
          selectedValue={form.parking}
          onValueChange={(value) => setForm({ ...form, parking: value })}
          style={styles.input}
        >
          <Picker.Item label="Paid Parking Nearby" value="Paid Parking Nearby" />
          <Picker.Item label="Street Parking Available" value="Street Parking Available" />
          <Picker.Item label="Free Parking Nearby" value="Free Parking Nearby" />
          <Picker.Item label="Free Parking Available" value="Free Parking Available" />
        </Picker>

        <View style={styles.switchRow}>
          <Switch
            value={form.wantsProducts}
            onValueChange={(value) => setForm({ ...form, wantsProducts: value })}
          />
          <Text style={styles.switchLabel}>Add products now ($49 one-time)</Text>
        </View>

        <TouchableOpacity
          onPress={handleSubmit}
          style={[styles.button, loading && { opacity: 0.7 }]}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Submit Shop</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
      <Footer />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff',
    flexGrow: 1,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1D4ED8',
    marginBottom: 18,
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#f3f4f6',
    borderColor: '#d1d5db',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 14,
    fontSize: 16,
    color: '#1e293b',
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
  },
  switchLabel: {
    marginLeft: 10,
    fontSize: 15,
    color: '#374151',
  },
  button: {
    backgroundColor: '#16a34a',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 24,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  successText: {
    color: '#16a34a',
    fontWeight: 'bold',
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 24,
  },
});