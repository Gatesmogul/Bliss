import * as ImagePicker from 'expo-image-picker';
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
import axiosInstance from '../services/axiosInstance';
import { useAuthStore } from '../store/authStore';

// Define strict interface for your Auth Store
interface AuthState {
  setToken: (token: string) => void;
  token: string | null;
}

export default function SignUp() {
  const router = useRouter();
  const { setToken } = useAuthStore() as AuthState;

  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState<string[]>([]);

  const [formData, setFormData] = useState({
    fullName: '',
    gender: '',
    age: '',
    religion: '',
    skinColor: '',
    race: '',
    height: '',
    phone: '',
    email: '',
    password: '',
    about: '',
    profession: '',
    country: '',
    nationality: '',
    hobbies: '',
    values: '',
    status: '',
    wantChildren: ''
  });

  const updateField = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // 📸 Image Picker Logic
  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert("Permission Denied", "We need your permission to access the gallery.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'], // Updated for latest Expo Image Picker
      allowsEditing: true,
      aspect: [4, 5],
      quality: 0.7, // Slightly reduced for faster upload
    });

    if (!result.canceled) {
      setImages(prev => [...prev, result.assets[0].uri]);
    }
  };

  // 🚀 Sign Up Logic
  const handleSignUp = async () => {
    // Basic Validation
    if (!formData.email || !formData.password || !formData.fullName) {
      Alert.alert("Required Fields", "Please provide at least your name, email, and password.");
      return;
    }

    setLoading(true);

    try {
      // 1. Post to your Backend API
      const response = await axiosInstance.post('/api/auth/register', { 
        ...formData, 
        images 
      });

      // 2. Success Feedback
      Alert.alert(
        "Verification Email Sent",
        "Your account was created successfully! Please check your email to verify your account.",
        [
          { 
            text: "Go to Verify", 
            onPress: () => router.push('/(modal)/verification' as Href) 
          }
        ]
      );
    } catch (error: any) {
      const msg = error.response?.data?.message || "Something went wrong. Please try again.";
      Alert.alert("Signup Failed", msg);
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
        <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Join Bliss and find your partner.</Text>

          <Text style={styles.sectionTitle}>Personal Details</Text>
          <Input placeholder="Full Name" onChangeText={(v: string) => updateField('fullName', v)} />
          
          <View style={styles.row}>
            <Input placeholder="Gender" style={{ flex: 1 }} onChangeText={(v: string) => updateField('gender', v)} />
            <Input placeholder="Age" keyboardType="numeric" style={{ flex: 1 }} onChangeText={(v: string) => updateField('age', v)} />
          </View>
          
          <Input placeholder="Profession" onChangeText={(v: string) => updateField('profession', v)} />

          <Text style={styles.sectionTitle}>Appearance & Values</Text>
          <View style={styles.row}>
            <Input placeholder="Height" style={{ flex: 1 }} onChangeText={(v: string) => updateField('height', v)} />
            <Input placeholder="Skin Color" style={{ flex: 1 }} onChangeText={(v: string) => updateField('skinColor', v)} />
          </View>
          
          <Input placeholder="Religion" onChangeText={(v: string) => updateField('religion', v)} />
          <Input placeholder="Values (e.g. Loyalty, Family)" onChangeText={(v: string) => updateField('values', v)} />

          <Text style={styles.sectionTitle}>Contact & Credentials</Text>
          <Input placeholder="Phone Number" keyboardType="phone-pad" onChangeText={(v: string) => updateField('phone', v)} />
          <Input 
            placeholder="Email Address" 
            keyboardType="email-address" 
            autoCapitalize="none" 
            onChangeText={(v: string) => updateField('email', v)} 
          />
          <Input placeholder="Create Password" secureTextEntry onChangeText={(v: string) => updateField('password', v)} />

          <Text style={styles.sectionTitle}>About You</Text>
          <Input 
            placeholder="About Me..." 
            multiline 
            numberOfLines={4} 
            style={styles.textArea} 
            onChangeText={(v: string) => updateField('about', v)} 
          />

          <TouchableOpacity style={styles.imageBtn} onPress={pickImage}>
            <Text style={styles.imageBtnText}>
              {images.length > 0 ? `✅ ${images.length} Photos Selected` : "+ Upload Pictures"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.mainBtn, loading && styles.btnDisabled]} 
            onPress={handleSignUp} 
            disabled={loading}
          >
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.mainBtnText}>Create My Account</Text>}
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.push('/(auth)/sign-in' as Href)}>
            <Text style={styles.footerText}>
              Already have an account? <Text style={styles.bold}>Sign In</Text>
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// Reusable Input Component
const Input = ({ style, ...props }: any) => (
  <TextInput style={[styles.input, style]} placeholderTextColor="#999" {...props} />
);

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#fff' },
  container: { padding: 24 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#1a1a1a', marginTop: 10 },
  subtitle: { fontSize: 16, color: '#666', marginBottom: 20 },
  sectionTitle: { fontSize: 12, fontWeight: '800', color: '#FF3B5C', marginTop: 25, marginBottom: 10, textTransform: 'uppercase', letterSpacing: 1 },
  input: { backgroundColor: '#f8f8f8', padding: 16, borderRadius: 12, marginBottom: 12, fontSize: 16, color: '#333', borderWidth: 1, borderColor: '#eee' },
  textArea: { height: 100, textAlignVertical: 'top' },
  row: { flexDirection: 'row', gap: 12 },
  imageBtn: { borderStyle: 'dashed', borderWidth: 2, borderColor: '#FF3B5C', padding: 20, borderRadius: 12, alignItems: 'center', marginVertical: 20, backgroundColor: '#fff5f6' },
  imageBtnText: { color: '#FF3B5C', fontWeight: '700' },
  mainBtn: { backgroundColor: '#FF3B5C', padding: 18, borderRadius: 12, alignItems: 'center', marginTop: 10, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
  btnDisabled: { opacity: 0.6 },
  mainBtnText: { color: '#fff', fontSize: 18, fontWeight: '700' },
  footerText: { textAlign: 'center', marginTop: 25, color: '#666', marginBottom: 40 },
  bold: { color: '#FF3B5C', fontWeight: 'bold' }
});