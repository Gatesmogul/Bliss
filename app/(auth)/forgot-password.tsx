import { Ionicons } from '@expo/vector-icons';
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
  View,
  Keyboard // Added to dismiss keyboard on press
} from 'react-native';
import axiosInstance from '../services/axiosInstance';

export default function ForgotPassword() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleResetPassword = async () => {
    // 1. Validation Logic
    const emailRegex = /\S+@\S+\.\S+/;
    if (!email || !emailRegex.test(email)) {
      Alert.alert("Invalid Email", "Please enter a valid email address.");
      return;
    }

    // Dismiss keyboard so user can see the loading state/success
    Keyboard.dismiss();
    setLoading(true);

    try {
      // Connects to Bliss backend
      // We trim the email to avoid hidden space errors
      await axiosInstance.post('/api/auth/forgot-password', { 
        email: email.trim().toLowerCase() 
      });
      setIsSubmitted(true);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "We couldn't process your request. Please try again later.";
      Alert.alert("Request Failed", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined} // Adjusted for Android
        style={styles.container}
      >
        <View style={styles.content}>
          {/* Back Button */}
          <TouchableOpacity 
            style={styles.backBtn} 
            onPress={() => router.back()}
            activeOpacity={0.6} // More pronounced feedback
          >
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>

          <View style={styles.header}>
            <View style={styles.iconCircle}>
              <Ionicons 
                name={isSubmitted ? "mail-open-outline" : "key-outline"} 
                size={40} 
                color="#FF3B5C" 
              />
            </View>
            <Text style={styles.title}>
              {isSubmitted ? "Check your email" : "Forgot Password?"}
            </Text>
            <Text style={styles.subtitle}>
              {isSubmitted 
                ? `We've sent a password reset link to\n${email.toLowerCase()}`
                : "No worries! Enter your email address and we will send you instructions to reset your password."}
            </Text>
          </View>

          {!isSubmitted ? (
            <View style={styles.form}>
              <Text style={styles.label}>Email Address</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your registered email"
                placeholderTextColor="#aaa"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                value={email}
                onChangeText={setEmail}
                returnKeyType="done"
                onSubmitEditing={handleResetPassword} // Allow "Enter" to submit
              />

              <TouchableOpacity 
                style={[styles.mainBtn, loading && styles.disabledBtn]} 
                onPress={handleResetPassword}
                disabled={loading}
                activeOpacity={0.8}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.mainBtnText}>Send Reset Link</Text>
                )}
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity 
              style={styles.mainBtn} 
              onPress={() => router.push("/(auth)/sign-in" as Href)}
              activeOpacity={0.8}
            >
              <Text style={styles.mainBtnText}>Back to Sign In</Text>
            </TouchableOpacity>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { flex: 1, paddingHorizontal: 30, paddingTop: 20 },
  backBtn: {
    width: 44, // Increased slightly for better tap target
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F8F8F8',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },
  header: { alignItems: 'center', marginBottom: 40 },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#FFF0F2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: { fontSize: 26, fontWeight: 'bold', color: '#1a1a1a', textAlign: 'center' },
  subtitle: { fontSize: 16, color: '#666', textAlign: 'center', marginTop: 10, lineHeight: 22 },
  form: { width: '100%' },
  label: { fontSize: 14, fontWeight: '600', color: '#333', marginBottom: 8, marginLeft: 4 },
  input: {
    backgroundColor: '#F8F8F8',
    height: 55,
    borderRadius: 15,
    paddingHorizontal: 20,
    fontSize: 16,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: '#EEE',
    color: '#333'
  },
  mainBtn: {
    backgroundColor: '#FF3B5C',
    height: 55,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    // Added shadow for better button visibility
    shadowColor: '#FF3B5C',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3,
  },
  disabledBtn: { opacity: 0.5 },
  mainBtnText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
});
