import { Href, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import axiosInstance from '../services/axiosInstance'; // Using your professional axios instance
import { useAuthStore } from '../store/authStore';

export default function SignIn() {
  const router = useRouter();
  const { setToken } = useAuthStore();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    // 1. Client-side Validation
    if (!email || !password) {
      Alert.alert("Missing Information", "Please enter both email and password.");
      return;
    }

    setLoading(true);
    try {
      // 2. Real API Call to your Node.js Backend
      const response = await axiosInstance.post('/api/auth/login', {
        email: email.trim().toLowerCase(),
        password: password,
      });

      if (response.data.token) {
        // 3. Update Zustand Store
        // This will automatically trigger the redirect logic in app/index.tsx
        setToken(response.data.token);
      }
    } catch (error: any) {
      // 4. Detailed Error Handling
      const message = error.response?.data?.message || "Invalid email or password. Please try again.";
      Alert.alert("Sign In Failed", message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <View style={styles.innerContainer}>
          <View style={styles.header}>
            <Text style={styles.logoText}>Bliss</Text>
            <Text style={styles.subtitle}>Sign in to find your perfect match.</Text>
          </View>

          <View style={styles.form}>
            <Text style={styles.label}>Email Address</Text>
            <TextInput
              style={styles.input}
              placeholder="example@mail.com"
              placeholderTextColor="#aaa"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              value={email}
              onChangeText={setEmail}
            />

            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              placeholderTextColor="#aaa"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />

            <TouchableOpacity 
              style={styles.forgotBtn}
              onPress={() => router.push("/(auth)/forgot-password" as Href)}
            >
              <Text style={styles.forgotText}>Forgot Password?</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.loginBtn, loading && styles.disabledBtn]} 
              onPress={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.loginBtnText}>Sign In</Text>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>New to Bliss? </Text>
            <TouchableOpacity onPress={() => router.push("/(auth)/sign-up" as Href)}>
              <Text style={styles.signUpLink}>Create Account</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  innerContainer: {
    flex: 1,
    paddingHorizontal: 30,
    justifyContent: 'center',
  },
  header: {
    marginBottom: 40,
    alignItems: 'center',
  },
  logoText: {
    fontSize: 42,
    fontWeight: '900',
    color: '#FF3B5C',
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 5,
  },
  form: {
    width: '100%',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    marginLeft: 4,
  },
  input: {
    backgroundColor: '#F8F8F8',
    height: 55,
    borderRadius: 15,
    paddingHorizontal: 20,
    fontSize: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#EEE',
    color: '#333',
  },
  forgotBtn: {
    alignSelf: 'flex-end',
    marginBottom: 30,
  },
  forgotText: {
    color: '#FF3B5C',
    fontWeight: '600',
  },
  loginBtn: {
    backgroundColor: '#FF3B5C',
    height: 55,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    // iOS Shadow
    shadowColor: '#FF3B5C',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    // Android Shadow
    elevation: 5,
  },
  disabledBtn: {
    opacity: 0.7,
  },
  loginBtnText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 40,
  },
  footerText: {
    color: '#666',
    fontSize: 15,
  },
  signUpLink: {
    color: '#FF3B5C',
    fontSize: 15,
    fontWeight: 'bold',
  },
});