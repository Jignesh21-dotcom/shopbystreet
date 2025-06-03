import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { supabase } from '../lib/supabase';
import Footer from '../components/Footer';
import { useNavigation } from '@react-navigation/native';

export default function ContactUsScreen() {
  const navigation = useNavigation();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: 'General Inquiry',
    message: '',
  });
  const [file, setFile] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFilePick = async () => {
    const result = await DocumentPicker.getDocumentAsync({ copyToCacheDirectory: true });
    if (result.assets && result.assets.length > 0) {
      setFile(result.assets[0]);
    }
  };

  const uploadFile = async () => {
    if (!file) return null;
    const filePath = `contact-files/${Date.now()}-${file.name}`;
    const { error: uploadError } = await supabase.storage
      .from('contact-uploads')
      .upload(filePath, {
        uri: file.uri,
        type: file.mimeType || 'application/octet-stream',
        name: file.name,
      } as any);

    if (uploadError) {
      console.error('Upload error:', uploadError.message);
      return null;
    }

    const { data: urlData } = supabase.storage
      .from('contact-uploads')
      .getPublicUrl(filePath);

    return urlData.publicUrl;
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    let fileUrl = null;
    if (file) {
      fileUrl = await uploadFile();
      if (!fileUrl) {
        setError('File upload failed. Please try again.');
        setLoading(false);
        return;
      }
    }

    const { error: insertError } = await supabase.from('contact_requests').insert([
      {
        ...formData,
        file_url: fileUrl,
      },
    ]);

    if (insertError) {
      setError('Something went wrong. Please try again.');
      console.error('Insert error:', insertError);
      setLoading(false);
      return;
    }

    try {
      await fetch('https://hooks.zapier.com/hooks/catch/22913226/27y98q1/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, fileUrl }),
      });
    } catch (zapError) {
      console.warn('Zapier webhook failed:', zapError);
    }

    setSuccess(true);
    setFormData({
      name: '',
      email: '',
      phone: '',
      subject: 'General Inquiry',
      message: '',
    });
    setFile(null);
    setLoading(false);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Contact Us</Text>
      <Text style={styles.subtitle}>
        Need help listing products or have a general question? Send us a message below.
      </Text>

      {success && <Text style={styles.success}>Thanks! We'll get back to you soon.</Text>}
      {error && <Text style={styles.error}>{error}</Text>}

      <TextInput
        placeholder="Your Name"
        value={formData.name}
        onChangeText={(val) => handleChange('name', val)}
        style={styles.input}
      />

      <TextInput
        placeholder="Your Email"
        keyboardType="email-address"
        value={formData.email}
        onChangeText={(val) => handleChange('email', val)}
        style={styles.input}
      />

      <TextInput
        placeholder="Phone Number (optional)"
        keyboardType="phone-pad"
        value={formData.phone}
        onChangeText={(val) => handleChange('phone', val)}
        style={styles.input}
      />

      <TextInput
        placeholder="Subject"
        value={formData.subject}
        onChangeText={(val) => handleChange('subject', val)}
        style={styles.input}
      />

      <TextInput
        placeholder="Message"
        value={formData.message}
        onChangeText={(val) => handleChange('message', val)}
        style={[styles.input, { height: 100 }]}
        multiline
      />

      <TouchableOpacity style={styles.fileButton} onPress={handleFilePick}>
        <Text style={styles.fileButtonText}>
          {file ? `Attached: ${file.name}` : 'Attach a file (optional)'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.submitButton}
        onPress={handleSubmit}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.submitButtonText}>Send Message</Text>
        )}
      </TouchableOpacity>

      <View style={{ marginTop: 40 }}>
        <Footer />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff',
    flexGrow: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    color: '#4B5563',
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 14,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  fileButton: {
    backgroundColor: '#e0e7ff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    alignItems: 'center',
  },
  fileButtonText: {
    color: '#3730a3',
    fontWeight: '600',
  },
  submitButton: {
    backgroundColor: '#2563eb',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  submitButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  success: {
    color: 'green',
    marginBottom: 10,
  },
  error: {
    color: 'red',
    marginBottom: 10,
  },
});