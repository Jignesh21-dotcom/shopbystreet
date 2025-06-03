import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Alert,
  StyleSheet,
} from 'react-native';
import { supabase } from '../lib/supabase';
import Footer from '../components/Footer';

export default function HomeBusinessesScreen() {
  const [name, setName] = useState('');
  const [city, setCity] = useState('');
  const [description, setDescription] = useState('');
  const [website, setWebsite] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    if (!name || !city || !description) {
      Alert.alert('Missing Fields', 'Please fill in all required fields.');
      return;
    }

    const { error } = await supabase.from('home_businesses').insert([
      {
        name,
        city,
        description,
        website,
      },
    ]);

    if (error) {
      console.error('Submission failed:', error.message);
      Alert.alert('Error', '❌ Something went wrong. Please try again.');
    } else {
      setSubmitted(true);
      setName('');
      setCity('');
      setDescription('');
      setWebsite('');
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.headerTitle}>
          🏠 Local Home & Online Businesses
        </Text>

        <Text style={styles.headerSubtitle}>
          Not every great business has a storefront — some of the best are run from home or fully online! 
          We're here to support local entrepreneurs, side hustlers, and community makers by giving them a space to be discovered.
        </Text>

        <Text style={styles.sectionTitle}>
          Add Your Home Business
        </Text>

        {!submitted ? (
          <View style={styles.formCard}>
            <TextInput
              placeholder="Business Name"
              value={name}
              onChangeText={setName}
              style={styles.input}
              placeholderTextColor="#64748b"
            />
            <TextInput
              placeholder="City"
              value={city}
              onChangeText={setCity}
              style={styles.input}
              placeholderTextColor="#64748b"
            />
            <TextInput
              placeholder="Description"
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={3}
              style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
              placeholderTextColor="#64748b"
            />
            <TextInput
              placeholder="Website / Social Media (optional)"
              value={website}
              onChangeText={setWebsite}
              style={styles.input}
              placeholderTextColor="#64748b"
            />

            <TouchableOpacity
              onPress={handleSubmit}
              style={styles.submitButton}
            >
              <Text style={styles.submitButtonText}>Submit My Business</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <Text style={styles.successText}>
            ✅ Thank you! We'll review and add your business shortly.
          </Text>
        )}

        <View style={styles.featuredSection}>
          <Text style={styles.featuredTitle}>
            🧾 Featured Home Businesses (Coming Soon)
          </Text>
          <Text style={styles.featuredSubtitle}>
            We'll start listing approved home-based businesses right here soon — grouped by city or type. Stay tuned!
          </Text>
        </View>
      </ScrollView>
      <Footer />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f3f4f6',
    flexGrow: 1,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2563eb',
    textAlign: 'center',
    marginBottom: 10,
  },
  headerSubtitle: {
    fontSize: 15,
    color: '#334155',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2563eb',
    marginBottom: 12,
    textAlign: 'center',
  },
  formCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: 24,
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
  submitButton: {
    backgroundColor: '#2563eb',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  submitButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  successText: {
    color: 'green',
    fontWeight: '600',
    fontSize: 18,
    textAlign: 'center',
    marginTop: 24,
    marginBottom: 24,
  },
  featuredSection: {
    marginTop: 40,
    backgroundColor: '#e0e7ff',
    borderRadius: 14,
    padding: 18,
  },
  featuredTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2563eb',
    textAlign: 'center',
    marginBottom: 6,
  },
  featuredSubtitle: {
    color: '#334155',
    textAlign: 'center',
    fontSize: 15,
    lineHeight: 22,
  },
});