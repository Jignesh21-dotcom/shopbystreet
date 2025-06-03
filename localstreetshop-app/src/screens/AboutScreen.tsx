// src/screens/AboutScreen.tsx

import React from 'react';
import { ScrollView, View, Text, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Footer from '../components/Footer';

export default function AboutScreen() {
  const navigation = useNavigation();

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1, padding: 20, backgroundColor: '#FEFCE8' }}>
      {/* ✅ Hero Section */}
      <View style={{ alignItems: 'center', marginBottom: 24 }}>
        <Text style={{ fontSize: 32, fontWeight: 'bold', color: '#92400E', marginBottom: 8 }}>About Us</Text>
        <Text style={{ fontSize: 16, color: '#374151', textAlign: 'center' }}>
          Empowering Local Businesses. Strengthening Communities.
        </Text>
      </View>

      {/* ✅ Content Section */}
      <View style={{ backgroundColor: '#fff', borderRadius: 16, padding: 20, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 6, marginBottom: 24 }}>
        <Text style={{ fontSize: 16, marginBottom: 16 }}>
          At <Text style={{ fontWeight: 'bold', color: '#CA8A04' }}>Shop Street</Text>, we believe that{' '}
          <Text style={{ fontWeight: 'bold' }}>local businesses are the heart and soul of every community.</Text>
        </Text>

        <Text style={{ fontSize: 16, marginBottom: 16 }}>
          In today’s fast-moving world—where major corporations and online giants dominate—many small, local shops have struggled to keep up. Neighborhood stores, family-run restaurants, and independent boutiques that once thrived have faced mounting challenges just to stay visible and competitive.
        </Text>

        <Text style={{ fontSize: 16, marginBottom: 16 }}>
          We built this platform with <Text style={{ fontWeight: 'bold', color: '#CA8A04' }}>one clear mission:</Text>{' '}
          <Text style={{ fontWeight: 'bold' }}>To give local businesses a fighting chance in the online world.</Text>
        </Text>

        <Text style={{ fontSize: 16, marginBottom: 16 }}>
          <Text style={{ fontWeight: 'bold', color: '#CA8A04' }}>Shop Street</Text> allows people to explore their cities street by street, discovering real stores in their own neighborhoods—from the corner bakery to hidden gem boutiques.
        </Text>

        <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#CA8A04', marginTop: 16, marginBottom: 12 }}>Why It Matters:</Text>
        <View style={{ paddingLeft: 12, marginBottom: 16 }}>
          <Text style={{ fontSize: 16, marginBottom: 8 }}>🛍️ <Text style={{ fontWeight: 'bold' }}>Support Local Jobs & Families:</Text> Every dollar spent locally helps sustain jobs and dreams.</Text>
          <Text style={{ fontSize: 16, marginBottom: 8 }}>🏙️ <Text style={{ fontWeight: 'bold' }}>Keep Communities Vibrant:</Text> Local businesses make our streets lively, unique, and full of character.</Text>
          <Text style={{ fontSize: 16, marginBottom: 8 }}>🚀 <Text style={{ fontWeight: 'bold' }}>Level the Playing Field:</Text> We give small shops powerful tools to stand tall in the age of online shopping.</Text>
        </View>

        <Text style={{ fontSize: 16, marginBottom: 16 }}>
          We’re passionate about reviving the magic of local shopping, empowering small businesses to compete, and making it easy for you to discover and support them.
        </Text>

        <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#CA8A04', textAlign: 'center' }}>
          Thank you for being part of this movement. Together, we can keep our communities thriving—one street at a time. 💛
        </Text>
      </View>

      {/* ✅ Back to Home Button */}
      <TouchableOpacity
        onPress={() => navigation.navigate('Home')}
        style={{ alignSelf: 'center', backgroundColor: '#CA8A04', paddingVertical: 12, paddingHorizontal: 24, borderRadius: 8 }}
      >
        <Text style={{ color: '#fff', fontWeight: 'bold' }}>← Back to Home</Text>
      </TouchableOpacity>

      {/* ✅ Footer */}
      <Footer />
    </ScrollView>
  );
}
