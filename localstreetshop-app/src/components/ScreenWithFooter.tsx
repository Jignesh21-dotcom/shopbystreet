import React from 'react';
import { View, StyleSheet } from 'react-native';
import Footer from './Footer';

export default function ScreenWithFooter({ children }: { children: React.ReactNode }) {
  return (
    <View style={styles.container}>
      <View style={styles.content}>{children}</View>
      <Footer />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { flex: 1 },
});