import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useAuthStore } from '../../store/authStore';

export default function EditProfile() {
  const router = useRouter();
  const { token } = useAuthStore();
  const [loading, setLoading] = useState(false);

  // Initial mock data - in production, this comes from your AuthStore or API
  const [formData, setFormData] = useState({
    fullName: "Oluwabukola Enitan",
    profileImage: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1",
    about: "Software Architect passionate about clean code and meaningful connections.",
    profession: "Software Architect",
    country: "Nigeria",
    hobbies: "Coding, Traveling, Reading",
    values: "Integrity, Growth, Faith"
  });

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setFormData({ ...formData, profileImage: result.assets[0].uri });
    }
  };

  const handleUpdate = async () => {
    setLoading(true);
    try {
      // Logic for Node.js Backend:
      // await api.put('/user/update-profile', formData, { headers: { Authorization: `Bearer ${token}` } });
      
      // Simulating API success
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      Alert.alert("Success", "Your profile has been updated!", [
        { text: "OK", onPress: () => router.back() }
      ]);
    } catch (error) {
      Alert.alert("Error", "Failed to update profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const FormInput = ({ label, value, onChangeText, multiline = false }: any) => (
    <View style={styles.inputGroup}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[styles.input, multiline && styles.textArea]}
        value={value}
        onChangeText={onChangeText}
        placeholder={`Enter your ${label.toLowerCase()}`}
        multiline={multiline}
      />
    </View>
  );

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <View style={{ width: 40 }} /> 
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Profile Picture Section */}
        <View style={styles.imageSection}>
          <Image source={{ uri: formData.profileImage }} style={styles.profileImg} />
          <TouchableOpacity style={styles.editImgBtn} onPress={pickImage}>
            <Ionicons name="camera" size={20} color="#fff" />
            <Text style={styles.editImgText}>Edit Photo</Text>
          </TouchableOpacity>
        </View>

        {/* Form Section */}
        <View style={styles.formCard}>
          <FormInput 
            label="Full Name" 
            value={formData.fullName} 
            onChangeText={(t: string) => setFormData({...formData, fullName: t})} 
          />
          <FormInput 
            label="Profession" 
            value={formData.profession} 
            onChangeText={(t: string) => setFormData({...formData, profession: t})} 
          />
          <FormInput 
            label="About" 
            value={formData.about} 
            onChangeText={(t: string) => setFormData({...formData, about: t})} 
            multiline 
          />
          <FormInput 
            label="Hobbies" 
            value={formData.hobbies} 
            onChangeText={(t: string) => setFormData({...formData, hobbies: t})} 
          />
          <FormInput 
            label="Core Values" 
            value={formData.values} 
            onChangeText={(t: string) => setFormData({...formData, values: t})} 
          />
        </View>

        {/* Update Button */}
        <TouchableOpacity 
          style={[styles.updateBtn, loading && styles.disabledBtn]} 
          onPress={handleUpdate}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.updateBtnText}>Update Profile</Text>
          )}
        </TouchableOpacity>
        
        <View style={{ height: 40 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingTop: 60, 
    paddingHorizontal: 20, 
    paddingBottom: 20 
  },
  backBtn: { padding: 8, backgroundColor: '#F5F5F5', borderRadius: 12 },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#1a1a1a' },
  scrollContent: { paddingHorizontal: 20 },
  
  imageSection: { alignItems: 'center', marginVertical: 30 },
  profileImg: { width: 130, height: 130, borderRadius: 65, marginBottom: 15 },
  editImgBtn: { 
    flexDirection: 'row', 
    backgroundColor: '#FF3B5C', 
    paddingHorizontal: 15, 
    paddingVertical: 8, 
    borderRadius: 20, 
    alignItems: 'center' 
  },
  editImgText: { color: '#fff', marginLeft: 8, fontWeight: '600', fontSize: 14 },

  formCard: { backgroundColor: '#fff' },
  inputGroup: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '600', color: '#666', marginBottom: 8, marginLeft: 4 },
  input: { 
    backgroundColor: '#F8F8F8', 
    padding: 16, 
    borderRadius: 15, 
    fontSize: 16, 
    color: '#333',
    borderWidth: 1,
    borderColor: '#EEE'
  },
  textArea: { height: 100, textAlignVertical: 'top' },

  updateBtn: { 
    backgroundColor: '#FF3B5C', 
    padding: 18, 
    borderRadius: 15, 
    alignItems: 'center', 
    marginTop: 20,
    shadowColor: '#FF3B5C',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4
  },
  disabledBtn: { opacity: 0.6 },
  updateBtnText: { color: '#fff', fontSize: 18, fontWeight: 'bold' }
});