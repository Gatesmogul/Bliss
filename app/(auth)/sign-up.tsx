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
  View,
  Keyboard
} from 'react-native';
import { Ionicons } from '@expo/vector-icons'; // Added for professional icons
import axiosInstance from '../services/axiosInstance';
import { useAuthStore } from '../store/authStore';

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

  const pickImage = async () => {
    // Dismiss keyboard first to ensure view doesn't shift
    Keyboard.dismiss(); 
    
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert("Permission Denied", "We need your permission to access the gallery.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 5],
      quality: 0.7,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setImages(prev => [...prev, result.assets[0].uri]);
    }
  };

  const handleSignUp = async () => {
    if (!formData.email || !formData.password || !formData.fullName) {
      Alert.alert("Required Fields", "Please provide at least your name, email, and password.");
      return;
    }

    Keyboard.dismiss();
    setLoading(true);

    try {
      await axiosInstance.post('/api/auth/register', { 
        ...formData, 
        images 
      });

      Alert.alert(
        "Verification Email Sent",
        "Your account was created successfully! Please check your email to verify your account.",
        [{ text: "Go to Verify", onPress: () => router.push('/(modal)/verification' as Href) }]
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
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent} 
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled" // CRITICAL: Fixes buttons not responding when keyboard is open
        >
          <View style={styles.header}>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Join Bliss and find your partner.</Text>
          </View>

          <View style={styles.formContainer}>
            <Text style={styles.sectionTitle}>Personal Details</Text>
            <Input 
              icon="person-outline"
              placeholder="Full Name" 
              value={formData.fullName}
              onChangeText={(v: string) => updateField('fullName', v)} 
            />
            
            <View style={styles.row}>
              <Input 
                  placeholder="Gender" 
                  style={{ flex: 1 }} 
                  value={formData.gender}
                  onChangeText={(v: string) => updateField('gender', v)} 
              />
              <Input 
                  placeholder="Age" 
                  keyboardType="numeric" 
                  style={{ flex: 1 }} 
                  value={formData.age}
                  onChangeText={(v: string) => updateField('age', v)} 
              />
            </View>
            
            <Input 
              icon="briefcase-outline"
              placeholder="Profession" 
              value={formData.profession}
              onChangeText={(v: string) => updateField('profession', v)} 
            />

            <Text style={styles.sectionTitle}>Appearance & Values</Text>
            <View style={styles.row}>
              <Input placeholder="Height" style={{ flex: 1 }} value={formData.height} onChangeText={(v: string) => updateField('height', v)} />
              <Input placeholder="Skin Color" style={{ flex: 1 }} value={formData.skinColor} onChangeText={(v: string) => updateField('skinColor', v)} />
            </View>
            
            <Input placeholder="Religion" value={formData.religion} onChangeText={(v: string) => updateField('religion', v)} />
            <Input placeholder="Values (e.g. Loyalty, Family)" value={formData.values} onChangeText={(v: string) => updateField('values', v)} />

            <Text style={styles.sectionTitle}>Contact & Credentials</Text>
            <Input icon="call-outline" placeholder="Phone" keyboardType="phone-pad" value={formData.phone} onChangeText={(v: string) => updateField('phone', v)} />
            <Input icon="mail-outline" placeholder="Email" keyboardType="email-address" autoCapitalize="none" value={formData.email} onChangeText={(v: string) => updateField('email', v)} />
            <Input icon="lock-closed-outline" placeholder="Password" secureTextEntry value={formData.password} onChangeText={(v: string) => updateField('password', v)} />

            <Text style={styles.sectionTitle}>About You</Text>
            <TextInput 
              placeholder="Tell us about yourself..." 
              multiline 
              numberOfLines={4} 
              style={styles.textArea} 
              value={formData.about}
              onChangeText={(v: string) => updateField('about', v)}
              placeholderTextColor="#999"
            />

            <TouchableOpacity 
              activeOpacity={0.7}
              style={styles.imageBtn} 
              onPress={pickImage}
            >
              <Ionicons name="camera-outline" size={24} color="#FF3B5C" style={{ marginRight: 10 }} />
              <Text style={styles.imageBtnText}>
                {images.length > 0 ? `${images.length} Photos Selected` : "Upload Pictures"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              activeOpacity={0.8}
              style={[styles.mainBtn, loading && styles.btnDisabled]} 
              onPress={handleSignUp} 
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.mainBtnText}>Create My Account</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.footerLink}
              onPress={() => router.push('/(auth)/sign-in' as Href)}
            >
              <Text style={styles.footerText}>
                Already have an account? <Text style={styles.bold}>Sign In</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// Enhanced Input Component with Icons
const Input = ({ style, icon, value, onChangeText, ...props }: any) => (
  <View style={[styles.inputWrapper, style]}>
    {icon && <Ionicons name={icon} size={20} color="#FF3B5C" style={styles.inputIcon} />}
    <TextInput 
      style={styles.inputField} 
      placeholderTextColor="#999" 
      value={value}
      onChangeText={onChangeText}
      {...props} 
    />
  </View>
);

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#fff' },
  scrollContent: { padding: 24, paddingBottom: 60 },
  header: { marginBottom: 30 },
  title: { fontSize: 32, fontWeight: 'bold', color: '#1a1a1a' },
  subtitle: { fontSize: 16, color: '#666', marginTop: 5 },
  formContainer: { flex: 1 },
  sectionTitle: { fontSize: 13, fontWeight: 'bold', color: '#FF3B5C', marginTop: 25, marginBottom: 15, textTransform: 'uppercase', letterSpacing: 1.2 },
  inputWrapper: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#f9f9f9', 
    borderRadius: 15, 
    marginBottom: 12, 
    borderWidth: 1, 
    borderColor: '#f0f0f0',
    paddingHorizontal: 15
  },
  inputIcon: { marginRight: 10 },
  inputField: { flex: 1, paddingVertical: 16, fontSize: 16, color: '#333' },
  textArea: { 
    backgroundColor: '#f9f9f9', 
    padding: 16, 
    borderRadius: 15, 
    marginBottom: 20, 
    fontSize: 16, 
    color: '#333', 
    borderWidth: 1, 
    borderColor: '#f0f0f0', 
    height: 120, 
    textAlignVertical: 'top' 
  },
  row: { flexDirection: 'row', gap: 12 },
  imageBtn: { 
    flexDirection: 'row',
    borderStyle: 'dashed', 
    borderWidth: 2, 
    borderColor: '#FF3B5C', 
    padding: 18, 
    borderRadius: 15, 
    alignItems: 'center', 
    justifyContent: 'center',
    marginVertical: 10, 
    backgroundColor: '#fff5f6' 
  },
  imageBtnText: { color: '#FF3B5C', fontWeight: 'bold', fontSize: 16 },
  mainBtn: { 
    backgroundColor: '#FF3B5C', 
    padding: 20, 
    borderRadius: 15, 
    alignItems: 'center', 
    marginTop: 20, 
    shadowColor: '#FF3B5C', 
    shadowOffset: { width: 0, height: 4 }, 
    shadowOpacity: 0.3, 
    shadowRadius: 8, 
    elevation: 5 
  },
  btnDisabled: { opacity: 0.6 },
  mainBtnText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  footerLink: { marginTop: 30, padding: 10 },
  footerText: { textAlign: 'center', color: '#666', fontSize: 15 },
  bold: { color: '#FF3B5C', fontWeight: 'bold' }
});
