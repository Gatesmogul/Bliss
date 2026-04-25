import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

/**
 * Bliss Verification Screen
 * Ensures community integrity through identity verification.
 */
export default function VerificationModal() {
  const router = useRouter();
  const [image, setImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const takeSelfie = useCallback(async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert(
          "Permission Required", 
          "Bliss needs camera access so you can take a verification selfie."
        );
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8, // Slightly higher quality for better verification
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setImage(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert("Error", "Could not open the camera. Please try again.");
    }
  }, []);

  const handleSubmit = async () => {
    if (!image) {
      Alert.alert("Photo Required", "Please take a selfie to proceed.");
      return;
    }

    setIsUploading(true);
    
    try {
      // Logic for backend integration:
      // const formData = new FormData();
      // formData.append('file', { uri: image, name: 'verification.jpg', type: 'image/jpeg' } as any);
      
      // Simulating network delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      Alert.alert(
        "Verification Submitted", 
        "Our team will review your photo. You'll receive a notification within 24 hours.",
        [{ text: "Done", onPress: () => router.back() }]
      );
    } catch (error) {
      Alert.alert("Upload Failed", "Connection lost. Please check your internet and try again.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => router.back()} 
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="close" size={28} color="#1A1A1A" />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {/* Fixed Icon Name: shield-checkmark */}
        <View style={styles.iconBadge}>
          <Ionicons name="shield-checkmark" size={42} color="#FF3B5C" />
        </View>

        <Text style={styles.title}>Identity Verification</Text>
        <Text style={styles.description}>
          Verified profiles are prioritized in the feed. Help us keep Bliss safe by confirming your identity.
        </Text>

        <TouchableOpacity 
          style={[styles.uploadArea, image ? styles.uploadAreaActive : null]} 
          onPress={takeSelfie}
          activeOpacity={0.7}
        >
          {image ? (
            <Image source={{ uri: image }} style={styles.previewImage} />
          ) : (
            <View style={styles.placeholder}>
              <Ionicons name="camera-outline" size={48} color="#BDBDBD" />
              <Text style={styles.placeholderText}>Take a Selfie</Text>
            </View>
          )}
        </TouchableOpacity>

        <View style={styles.tipsContainer}>
          <Tip text="Ensure your face is centered and clear" />
          <Tip text="Find a spot with natural lighting" />
          <Tip text="Remove glasses or face coverings" />
        </View>
      </View>

      {/* Footer Action */}
      <View style={styles.footer}>
        <TouchableOpacity 
          style={[styles.submitBtn, (!image || isUploading) && styles.disabledBtn]} 
          onPress={handleSubmit}
          disabled={!image || isUploading}
        >
          {isUploading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.submitBtnText}>Verify My Profile</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// Reusable Tip Component for cleaner code
const Tip = ({ text }: { text: string }) => (
  <View style={styles.tipRow}>
    <Ionicons name="checkmark-circle" size={16} color="#4CAF50" style={{ marginRight: 8 }} />
    <Text style={styles.tipText}>{text}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 40 : 10,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  iconBadge: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: '#FFF0F2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#1A1A1A',
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  description: {
    fontSize: 16,
    color: '#757575',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 40,
  },
  uploadArea: {
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: '#FAFAFA',
    borderWidth: 2,
    borderColor: '#F0F0F0',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  uploadAreaActive: {
    borderStyle: 'solid',
    borderColor: '#FF3B5C',
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    alignItems: 'center',
  },
  placeholderText: {
    marginTop: 12,
    color: '#9E9E9E',
    fontSize: 16,
    fontWeight: '600',
  },
  tipsContainer: {
    marginTop: 40,
    width: '100%',
  },
  tipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  tipText: {
    fontSize: 14,
    color: '#616161',
    fontWeight: '500',
  },
  footer: {
    padding: 24,
    paddingBottom: Platform.OS === 'ios' ? 10 : 30,
  },
  submitBtn: {
    backgroundColor: '#FF3B5C',
    height: 58,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FF3B5C',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  disabledBtn: {
    backgroundColor: '#E0E0E0',
    shadowOpacity: 0,
    elevation: 0,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
});