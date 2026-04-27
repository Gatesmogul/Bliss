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
  View,
  Keyboard
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axiosInstance from '../../services/axiosInstance';
import { useAuthStore } from '../../store/authStore';

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
  const [showPassword, setShowPassword] = useState(false);

  const handleSignIn = async () => {
    if (!email || !password) {
      Alert.alert("Missing Information", "Please enter both your email and password.");
      return;
    }

    // Ensures the UI doesn't jump and the button registers the press properly
    Keyboard.dismiss();
    setLoading(true);

    try {
      const response = await axiosInstance.post('/api/auth/login', {
        email: email.trim().toLowerCase(),
        password: password,
      });

      const { token, user } = response.data;
      if (token) {
        setToken(token);
        if (user) setUser(user);
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
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContainer} 
          bounces={false}
          keyboardShouldPersistTaps="handled" // FIXED: Ensures buttons respond when keyboard is open
        >
          <View style={styles.headerSection}>
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>Sign in to continue your journey with Bliss.</Text>
          </View>

          <View style={styles.formSection}>
            <Text style={styles.label}>Email Address</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="mail-outline" size={20} color="#FF3B5C" style={styles.icon} />
              <TextInput
                style={styles.input}
                placeholder="example@email.com"
                placeholderTextColor="#aaa"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                value={email}
                onChangeText={setEmail}
              />
            </View>

            <Text style={styles.label}>Password</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="lock-closed-outline" size={20} color="#FF3B5C" style={styles.icon} />
              <TextInput
                style={styles.input}
                placeholder="••••••••"
                placeholderTextColor="#aaa"
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Ionicons 
                  name={showPassword ? "eye-off-outline" : "eye-outline"} 
                  size={20} 
                  color="#666" 
                />
              </TouchableOpacity>
            </View>

            <TouchableOpacity 
              onPress={() => router.push('/(auth)/forgot-password' as Href)}
              style={styles.forgotBtn}
              activeOpacity={0.7}
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

          <View style={styles.footerSection}>
            <TouchableOpacity 
              onPress={() => router.push('/(auth)/sign-up' as Href)}
              activeOpacity={0.7}
            >
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
  scrollContainer: { flexGrow: 1, padding: 28, justifyContent: 'center' },
  headerSection: { marginBottom: 40 },
  title: { fontSize: 34, fontWeight: 'bold', color: '#1a1a1a', letterSpacing: -0.5 },
  subtitle: { fontSize: 16, color: '#777', marginTop: 8, lineHeight: 22 },
  formSection: { width: '100%' },
  label: { fontSize: 14, fontWeight: '700', color: '#444', marginBottom: 10, marginLeft: 4 },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    borderRadius: 16,
    paddingHorizontal: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  icon: { marginRight: 12 },
  input: { flex: 1, paddingVertical: 18, fontSize: 16, color: '#333' },
  forgotBtn: { alignSelf: 'flex-end', marginBottom: 35, padding: 5 },
  forgotText: { color: '#FF3B5C', fontWeight: '700', fontSize: 14 },
  mainBtn: { 
    backgroundColor: '#FF3B5C', 
    padding: 20, 
    borderRadius: 16, 
    alignItems: 'center', 
    shadowColor: '#FF3B5C',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 4
  },
  btnDisabled: { opacity: 0.6 },
  mainBtnText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  footerSection: { marginTop: 45 },
  footerText: { textAlign: 'center', color: '#777', fontSize: 15 },
  bold: { color: '#FF3B5C', fontWeight: 'bold' }
});
