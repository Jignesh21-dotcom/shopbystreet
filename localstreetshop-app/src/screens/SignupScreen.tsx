import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { supabase } from '../lib/supabase';
import Footer from '../components/Footer';

// Replace this with your actual RootStackParamList or navigation param list
type RootStackParamList = {
  LoginScreen: undefined;
  // ... other screens
};

const SignupScreen: React.FC = () => {
  const [success, setSuccess] = useState(false);
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'member' | 'owner'>('member');
  const [loading, setLoading] = useState(false);

  const handleSignUp = async () => {
    if (!username || !email || !password) {
      Alert.alert('Please fill in all fields');
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username,
          isShopOwner: role === 'owner',
          shopStatus: role === 'owner' ? 'pendingPayment' : null,
        },
      },
    });
    setLoading(false);

    if (error) {
      Alert.alert('Sign Up Error', error.message);
    } else {
      setSuccess(true);
    }
  };

  if (success) {
    return (
      <View style={{ flex: 1 }}>
        <View
          style={{
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#fff',
            paddingHorizontal: 16,
          }}
        >
          <Text style={{
            fontSize: 24,
            fontWeight: 'bold',
            color: '#16a34a',
            marginBottom: 16,
          }}>✅ Account Created!</Text>
          <Text style={{
            textAlign: 'center',
            marginBottom: 16,
          }}>Check your email to confirm your account.</Text>
          <TouchableOpacity onPress={() => navigation.navigate('LoginScreen')}>
            <Text style={{
              color: '#2563eb',
              textDecorationLine: 'underline',
            }}>Go to Login</Text>
          </TouchableOpacity>
        </View>
        <Footer />
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: 'center',
          backgroundColor: '#f3f4f6',
          paddingHorizontal: 16,
        }}
        keyboardShouldPersistTaps="handled"
      >
        <View
          style={{
            backgroundColor: '#fff',
            borderRadius: 16,
            padding: 24,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 4,
          }}
        >
          <Text
            style={{
              fontSize: 24,
              fontWeight: 'bold',
              color: '#1d4ed8',
              textAlign: 'center',
              marginBottom: 8,
            }}
          >
            Sign Up
          </Text>
          <Text
            style={{
              textAlign: 'center',
              color: '#4b5563',
              marginBottom: 24,
            }}
          >
            Create your account
          </Text>

          <View style={{ flexDirection: 'row', marginBottom: 16 }}>
            <TouchableOpacity
              onPress={() => setRole('member')}
              style={{
                flex: 1,
                paddingVertical: 8,
                marginRight: 8,
                borderRadius: 9999,
                backgroundColor: role === 'member' ? '#2563eb' : '#e5e7eb',
              }}
            >
              <Text
                style={{
                  textAlign: 'center',
                  color: role === 'member' ? '#fff' : '#1f2937',
                }}
              >
                👤 Member
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setRole('owner')}
              style={{
                flex: 1,
                paddingVertical: 8,
                marginLeft: 8,
                borderRadius: 9999,
                backgroundColor: role === 'owner' ? '#2563eb' : '#e5e7eb',
              }}
            >
              <Text
                style={{
                  textAlign: 'center',
                  color: role === 'owner' ? '#fff' : '#1f2937',
                }}
              >
                🏪 Shop Owner
              </Text>
            </TouchableOpacity>
          </View>

          <TextInput
            placeholder="Username"
            value={username}
            onChangeText={setUsername}
            style={{
              backgroundColor: '#f3f4f6',
              borderColor: '#d1d5db',
              borderWidth: 1,
              borderRadius: 8,
              paddingHorizontal: 16,
              paddingVertical: 12,
              marginBottom: 16,
            }}
          />

          <TextInput
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            style={{
              backgroundColor: '#f3f4f6',
              borderColor: '#d1d5db',
              borderWidth: 1,
              borderRadius: 8,
              paddingHorizontal: 16,
              paddingVertical: 12,
              marginBottom: 16,
            }}
          />

          <TextInput
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            style={{
              backgroundColor: '#f3f4f6',
              borderColor: '#d1d5db',
              borderWidth: 1,
              borderRadius: 8,
              paddingHorizontal: 16,
              paddingVertical: 12,
              marginBottom: 24,
            }}
          />

          <TouchableOpacity
            onPress={handleSignUp}
            disabled={loading}
            style={{
              backgroundColor: '#16a34a',
              borderRadius: 16,
              paddingVertical: 16,
              alignItems: 'center',
            }}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={{
                color: '#fff',
                textAlign: 'center',
                fontWeight: 'bold',
                fontSize: 16,
              }}>
                Sign Up as {role === 'owner' ? 'Shop Owner' : 'Member'}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
      <Footer />
    </View>
  );
};

export default SignupScreen;