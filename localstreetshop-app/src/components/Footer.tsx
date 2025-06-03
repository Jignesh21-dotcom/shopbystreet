import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

export default function Footer() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();

  return (
    <View style={[styles.container, { paddingBottom: 16 + insets.bottom }]}>
      <Text style={styles.copyright}>
        © 2025 <Text style={styles.bold}>ShopByStreet™</Text>. All rights reserved.
      </Text>
      <View style={styles.linksRow}>
        <TouchableOpacity
          style={styles.linkButton}
          onPress={() => navigation.navigate('AboutScreen')}
        >
          <Text style={styles.linkText}>About</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.linkButton}
          onPress={() => navigation.navigate('ContactUsScreen')}
        >
          <Text style={styles.linkText}>Contact Us</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.linkButton}
          onPress={() => navigation.navigate('PrivacyPolicyScreen')}
        >
          <Text style={styles.linkText}>Privacy</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingVertical: 16,
    paddingHorizontal: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  copyright: {
    textAlign: 'center',
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 12,
  },
  bold: {
    fontWeight: '600',
  },
  linksRow: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  linkButton: {
    marginHorizontal: 12,
  },
  linkText: {
    fontSize: 14,
    color: '#4b5563',
    fontWeight: '600',
  },
});