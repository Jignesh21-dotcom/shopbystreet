import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { supabase } from '../lib/supabase';
import Footer from '../components/Footer';

type RootStackParamList = {
  Drawer: undefined;
};

export default function LoginScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const [isSignUp, setIsSignUp] = useState(false);
  const [showReset, setShowReset] = useState(false);
  const [role, setRole] = useState<'member' | 'owner'>('member');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (data?.user) {
        navigation.replace('Drawer');
      }
    };
    checkUser();
  }, []);

  const handleSubmit = async () => {
    setMessage(null);
    setLoading(true);

    if (showReset) {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      setLoading(false);
      if (error) {
        setMessage(`❌ ${error.message}`);
      } else {
        setMessage('✅ Reset link sent! Check your email.');
      }
      return;
    }

    if (isSignUp) {
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
        setMessage(`❌ ${error.message}`);
      } else {
        setMessage('✅ Sign-up successful! Please check your email to confirm.');
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      setLoading(false);
      if (error) {
        setMessage(`❌ ${error.message}`);
      } else {
        setMessage('✅ Logged in successfully! Redirecting...');
        setTimeout(() => navigation.replace('Drawer'), 1200);
      }
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ flexGrow: 1, backgroundColor: '#f3f4f6' }}>
        <View style={styles.container}>
          <View style={styles.card}>
            <Text style={styles.title}>
              {showReset ? 'Reset Password' : isSignUp ? 'Create Account' : 'Welcome Back'}
            </Text>
            <Text style={styles.subtitle}>
              {showReset
                ? 'Enter your email to receive a password reset link.'
                : isSignUp
                ? 'Join the community as a member or shop owner.'
                : 'Sign in to your account.'}
            </Text>

            {isSignUp && !showReset && (
              <>
                <TextInput
                  placeholder="Username"
                  value={username}
                  onChangeText={setUsername}
                  style={styles.input}
                />

                <View style={styles.roleRow}>
                  <TouchableOpacity
                    onPress={() => setRole('member')}
                    style={[
                      styles.roleButton,
                      role === 'member' ? styles.roleButtonActive : styles.roleButtonInactive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.roleButtonText,
                        role === 'member' ? styles.roleButtonTextActive : styles.roleButtonTextInactive,
                      ]}
                    >
                      👤 Member
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => setRole('owner')}
                    style={[
                      styles.roleButton,
                      role === 'owner' ? styles.roleButtonActive : styles.roleButtonInactive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.roleButtonText,
                        role === 'owner' ? styles.roleButtonTextActive : styles.roleButtonTextInactive,
                      ]}
                    >
                      🏪 Shop Owner
                    </Text>
                  </TouchableOpacity>
                </View>
              </>
            )}

            <TextInput
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              style={styles.input}
            />

            {!showReset && (
              <TextInput
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                style={styles.input}
              />
            )}

            <TouchableOpacity
              onPress={handleSubmit}
              disabled={loading}
              style={styles.submitButton}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.submitButtonText}>
                  {showReset ? 'Send Reset Link' : isSignUp ? 'Sign Up' : 'Login'}
                </Text>
              )}
            </TouchableOpacity>

            {message && (
              <Text
                style={[
                  styles.message,
                  message.includes('✅') ? styles.messageSuccess : styles.messageError,
                ]}
              >
                {message}
              </Text>
            )}

            {!showReset && (
              <TouchableOpacity onPress={() => setShowReset(true)} style={{ marginTop: 12 }}>
                <Text style={styles.linkText}>Forgot Password?</Text>
              </TouchableOpacity>
            )}

            <View style={{ marginTop: 24, alignItems: 'center' }}>
              {showReset ? (
                <TouchableOpacity onPress={() => setShowReset(false)}>
                  <Text style={styles.linkText}>← Back to Login</Text>
                </TouchableOpacity>
              ) : isSignUp ? (
                <Text style={styles.switchText}>
                  Already have an account?{' '}
                  <Text onPress={() => setIsSignUp(false)} style={styles.linkText}>
                    Log in
                  </Text>
                </Text>
              ) : (
                <Text style={styles.switchText}>
                  Don’t have an account?{' '}
                  <Text onPress={() => setIsSignUp(true)} style={styles.linkText}>
                    Sign up
                  </Text>
                </Text>
              )}
            </View>
          </View>
        </View>
      </ScrollView>
      <Footer />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 40,
  },
  card: {
    backgroundColor: '#fff',
    padding: 24,
    borderRadius: 18,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2563eb',
    textAlign: 'center',
    marginBottom: 6,
  },
  subtitle: {
    textAlign: 'center',
    color: '#64748b',
    marginBottom: 18,
  },
  input: {
    backgroundColor: '#f1f5f9',
    borderColor: '#e5e7eb',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 14,
  },
  submitButton: {
    backgroundColor: '#2563eb',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 8,
  },
  submitButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  message: {
    marginTop: 10,
    textAlign: 'center',
    padding: 8,
    borderRadius: 6,
  },
  messageSuccess: {
    color: 'green',
    backgroundColor: '#e0fce0',
  },
  messageError: {
    color: 'red',
    backgroundColor: '#fee2e2',
  },
  linkText: {
    color: '#2563eb',
    fontWeight: '600',
    fontSize: 15,
  },
  switchText: {
    color: '#64748b',
    fontSize: 15,
    marginTop: 8,
  },
  roleRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 14,
  },
  roleButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 20,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  roleButtonActive: {
    backgroundColor: '#2563eb',
  },
  roleButtonInactive: {
    backgroundColor: '#e5e7eb',
  },
  roleButtonText: {
    fontSize: 15,
  },
  roleButtonTextActive: {
    color: '#fff',
    fontWeight: 'bold',
  },
  roleButtonTextInactive: {
    color: '#1e293b',
  },
});