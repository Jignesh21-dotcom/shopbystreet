import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet, ScrollView } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as EmailJS from '@emailjs/browser';
import { supabase } from '../lib/supabase';
import Footer from '../components/Footer';

export default function SubmitStreetScreen() {
  const [form, setForm] = useState({
    name: '',
    provinceSlug: '',
    citySlug: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [provinces, setProvinces] = useState<any[]>([]);
  const [cities, setCities] = useState<any[]>([]);

  useEffect(() => {
    const fetchProvinces = async () => {
      const { data, error } = await supabase.from('provinces').select('*');
      if (!error) setProvinces(data || []);
    };
    fetchProvinces();
  }, []);

  useEffect(() => {
    if (form.provinceSlug) {
      const fetchCities = async () => {
        const { data, error } = await supabase
          .from('cities')
          .select('*')
          .eq('province_slug', form.provinceSlug);
        if (!error) setCities(data || []);
      };
      fetchCities();
    } else {
      setCities([]);
    }
  }, [form.provinceSlug]);

  const handleChange = (key: string, value: string) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
      ...(key === 'provinceSlug' ? { citySlug: '' } : {}),
    }));
  };

  const handleSubmit = async () => {
    if (!form.name || !form.provinceSlug || !form.citySlug) {
      Alert.alert('Missing fields', 'Please fill all required fields.');
      return;
    }

    const newStreet = {
      name: form.name,
      slug: form.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
      citySlug: form.citySlug,
      provinceSlug: form.provinceSlug,
      approved: false,
    };

    try {
      const pending = await AsyncStorage.getItem('pendingStreets');
      const list = pending ? JSON.parse(pending) : [];
      list.push(newStreet);
      await AsyncStorage.setItem('pendingStreets', JSON.stringify(list));

      await EmailJS.send(
        'service_ra938k5',
        'template_p1vwnzp',
        {
          street_name: form.name,
          city: form.citySlug,
          province: form.provinceSlug,
        },
        'ddd-F-k7CZdBPSiOm'
      );

      setSubmitted(true);
    } catch (error) {
      Alert.alert('Submission Failed', 'Please try again later.');
      console.error('Submission error:', error);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>🚧 Suggest a New Street</Text>

        {submitted ? (
          <Text style={styles.successText}>
            ✅ Street submitted for review! Thank you.
          </Text>
        ) : (
          <>
            <Text style={styles.label}>Street Name</Text>
            <TextInput
              value={form.name}
              onChangeText={(text) => handleChange('name', text)}
              placeholder="Enter street name"
              style={styles.input}
            />

            <Text style={styles.label}>Province</Text>
            <View style={styles.pickerWrapper}>
              <Picker
                selectedValue={form.provinceSlug}
                onValueChange={(value) => handleChange('provinceSlug', value)}
                style={styles.picker}
              >
                <Picker.Item label="-- Select Province --" value="" />
                {provinces.map((prov) => (
                  <Picker.Item key={prov.slug} label={prov.name} value={prov.slug} />
                ))}
              </Picker>
            </View>

            <Text style={styles.label}>City</Text>
            <View style={styles.pickerWrapper}>
              <Picker
                selectedValue={form.citySlug}
                enabled={!!form.provinceSlug}
                onValueChange={(value) => handleChange('citySlug', value)}
                style={styles.picker}
              >
                <Picker.Item label="-- Select City --" value="" />
                {cities.map((city) => (
                  <Picker.Item key={city.slug} label={city.name} value={city.slug} />
                ))}
              </Picker>
            </View>

            <TouchableOpacity
              onPress={handleSubmit}
              style={styles.button}
            >
              <Text style={styles.buttonText}>Submit Street</Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
      <Footer />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    backgroundColor: '#EFF6FF',
    flexGrow: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1e40af',
    marginBottom: 18,
    textAlign: 'center',
  },
  label: {
    marginBottom: 4,
    fontWeight: '500',
    color: '#1e293b',
    fontSize: 15,
  },
  input: {
    backgroundColor: '#fff',
    borderColor: '#d1d5db',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 16,
    fontSize: 16,
    color: '#1e293b',
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    backgroundColor: '#fff',
    marginBottom: 16,
  },
  picker: {
    height: 48,
    width: '100%',
  },
  button: {
    backgroundColor: '#2563eb',
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
    marginTop: 24,
    marginBottom: 24,
  },
});