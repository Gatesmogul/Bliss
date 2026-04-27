import { Href, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import axiosInstance from '../../services/axiosInstance';
import { useAuthStore } from '../../store/authStore';

// Interface for Auth Store
interface AuthState {
  setToken: (token: string) => void;
  setUser: (user: any) => void;
}

export default function SignIn() {
  const router = useRouter();
  const { setToken, setUser } = useAuthStore() as AuthState;

  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSignIn = async () => {
    // 1. Validation
    if (!email || !password) {
      Alert.alert("Error", "Please enter both email and password.");
      return;
    }

    setLoading(true);

    try {
      // 2. API Call
      const response = await axiosInstance.post('/api/auth/login', {
        email: email.trim().toLowerCase(),
        password: password,
      });

      // 3. Store Token & User Data
      const { token, user } = response.data;
      if (token) {
        setToken(token);
        if (user) setUser(user);
        
        // 4. Navigate to Main App
        router.replace('/(tabs)/home' as Href);
      }
    } catch (error: any) {
      const msg = error.response?.data?.message || "Invalid credentials. Please try again.";
      Alert.alert("Sign In Failed", msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.container} bounces={false}>
          <View style={styles.header}>
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>Sign in to continue your journey with Bliss.</Text>
          </View>

          <View style={styles.form}>
            <Text style={styles.label}>Email Address</Text>
            <TextInput
              style={styles.input}
              placeholder="example@email.com"
              placeholderTextColor="#999"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />

            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your password"
              placeholderTextColor="#999"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />

            <TouchableOpacity 
              onPress={() => router.push('/(auth)/forgot-password' as Href)}
              style={styles.forgotBtn}
            >
              <Text style={styles.forgotText}>Forgot Password?</Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              style={[styles.mainBtn, loading && styles.btnDisabled]}
              onPress={handleSignIn}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.mainBtnText}>Sign In</Text>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
            <TouchableOpacity onPress={() => router.push('/(auth)/sign-up' as Href)}>
              <Text style={styles.footerText}>
                Don't have an account? <Text style={styles.bold}>Sign Up</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#fff' },
  container: { flexGrow: 1, padding: 24, justifyContent: 'center' },
  header: { marginBottom: 40 },
  title: { fontSize: 32, fontWeight: 'bold', color: '#1a1a1a' },
  subtitle: { fontSize: 16, color: '#666', marginTop: 10 },
  form: { width: '100%' },
  label: { fontSize: 14, fontWeight: '700', color: '#333', marginBottom: 8, marginLeft: 4 },
  input: { 
    backgroundColor: '#f8f8f8', 
    padding: 16, 
    borderRadius: 12, 
    marginBottom: 20, 
    fontSize: 16, 
    color: '#333', 
    borderWidth: 1, 
    borderColor: '#eee' 
  },
  forgotBtn: { alignSelf: 'flex-end', marginBottom: 30 },
  forgotText: { color: '#FF3B5C', fontWeight: '600', fontSize: 14 },
  mainBtn: { 
    backgroundColor: '#FF3B5C', 
    padding: 18, 
    borderRadius: 12, 
    alignItems: 'center', 
    elevation: 2, 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 2 }, 
    shadowOpacity: 0.1, 
    shadowRadius: 4 
  },
  btnDisabled: { opacity: 0.6 },
  mainBtnText: { color: '#fff', fontSize: 18, fontWeight: '700' },
  footer: { marginTop: 40 },
  footerText: { textAlign: 'center', color: '#666' },
  bold: { color: '#FF3B5C', fontWeight: 'bold' }
});
