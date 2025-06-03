// src/screens/PrivacyPolicyScreen.tsx

import React from 'react';
import { ScrollView, Text, View, StyleSheet } from 'react-native';

export default function PrivacyPolicyScreen() {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Privacy Policy</Text>

      <Text style={styles.paragraph}>
        At <Text style={styles.bold}>ShopByStreet</Text>, we value your privacy. This Privacy Policy explains how we collect, use, and protect your personal information.
      </Text>

      <Text style={styles.sectionTitle}>1. Information We Collect</Text>
      <View style={styles.list}>
        <Text style={styles.listItem}>• Your name, email, and phone number when you submit a contact form.</Text>
        <Text style={styles.listItem}>• Uploaded files (e.g., product images or spreadsheets).</Text>
        <Text style={styles.listItem}>• Basic analytics and device/browser information.</Text>
      </View>

      <Text style={styles.sectionTitle}>2. How We Use Your Information</Text>
      <View style={styles.list}>
        <Text style={styles.listItem}>• To respond to your messages and inquiries.</Text>
        <Text style={styles.listItem}>• To help set up your shop or products if requested.</Text>
        <Text style={styles.listItem}>• To improve our platform and services.</Text>
      </View>

      <Text style={styles.sectionTitle}>3. Sharing Your Data</Text>
      <Text style={styles.paragraph}>We do not sell or share your personal data with third parties, except:</Text>
      <View style={styles.list}>
        <Text style={styles.listItem}>• When required by law or legal process.</Text>
        <Text style={styles.listItem}>• To trusted services (e.g., email providers) that help us operate the platform.</Text>
      </View>

      <Text style={styles.sectionTitle}>4. Data Security</Text>
      <Text style={styles.paragraph}>
        Your information is securely stored and only accessed by authorized team members.
      </Text>

      <Text style={styles.sectionTitle}>5. Your Rights</Text>
      <Text style={styles.paragraph}>
        You can contact us at any time to request a copy of your data or ask us to delete it.
      </Text>

      <Text style={styles.sectionTitle}>6. Contact</Text>
      <Text style={styles.paragraph}>
        If you have any questions, email us at <Text style={styles.bold}>support@yourdomain.com</Text>.
      </Text>

      <Text style={[styles.paragraph, styles.updated]}>Last updated: May 2025</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 20,
    marginBottom: 8,
    color: '#111827',
  },
  paragraph: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 10,
    lineHeight: 22,
  },
  list: {
    marginBottom: 10,
    paddingLeft: 10,
  },
  listItem: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 6,
  },
  bold: {
    fontWeight: '600',
  },
  updated: {
    marginTop: 20,
    color: '#6B7280',
  },
});
