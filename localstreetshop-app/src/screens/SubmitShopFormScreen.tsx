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
    provinceSlug: '',
    citySlug: '',
    streetSlug: '',
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
    if (form.provinceSlug) {
      setForm((prev) => ({ ...prev, citySlug: '', streetSlug: '' }));
      fetchCities();
    }
  }, [form.provinceSlug]);

  useEffect(() => {
    if (form.citySlug) {
      setForm((prev) => ({ ...prev, streetSlug: '' }));
      fetchStreets();
    }
  }, [form.citySlug]);

  const fetchInitialData = async () => {
    const { data: provs } = await supabase.from('provinces').select();
    setProvinces(provs || []);
  };

  const fetchCities = async () => {
    const { data: citiesData } = await supabase
      .from('cities')
      .select()
      .eq('provinceSlug', form.provinceSlug);
    setCities(citiesData || []);
  };

  const fetchStreets = async () => {
    const { data: streetsData } = await supabase
      .from('streets')
      .select()
      .eq('citySlug', form.citySlug);
    setStreets(streetsData || []);
  };

  const handleSubmit = async () => {
    if (!form.name || !form.provinceSlug || !form.citySlug || !form.streetSlug) {
      Alert.alert('Missing fields', 'Please fill all required fields.');
      return;
    }

    setLoading(true);

    const newShop = {
      name: form.name,
      slug: form.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
      streetSlug: form.streetSlug,
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
          selectedValue={form.provinceSlug}
          onValueChange={(value) => setForm({ ...form, provinceSlug: value })}
          style={styles.input}
        >
          <Picker.Item label="-- Select Province --" value="" />
          {provinces.map((prov) => (
            <Picker.Item key={prov.slug} label={prov.name} value={prov.slug} />
          ))}
        </Picker>

        <Picker
          selectedValue={form.citySlug}
          enabled={!!form.provinceSlug}
          onValueChange={(value) => setForm({ ...form, citySlug: value })}
          style={styles.input}
        >
          <Picker.Item label="-- Select City --" value="" />
          {cities.map((city) => (
            <Picker.Item key={city.slug} label={city.name} value={city.slug} />
          ))}
        </Picker>

        <Picker
          selectedValue={form.streetSlug}
          enabled={!!form.citySlug}
          onValueChange={(value) => setForm({ ...form, streetSlug: value })}
          style={styles.input}
        >
          <Picker.Item label="-- Select Street --" value="" />
          {streets.map((street) => (
            <Picker.Item key={street.slug} label={street.name} value={street.slug} />
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