import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { useAuthStore } from '../../store/authStore';

/**
 * Bliss Sign Out Screen
 * Provides a clear confirmation for users ending their session.
 */
export default function SignOutScreen() {
  const router = useRouter();
  
  // FIX: Use a selector to access the signOut function
  const signOut = useAuthStore((state: any) => state.signOut);
  
  const [loading, setLoading] = useState(false);

  const handleSignOut = async () => {
    setLoading(true);
    try {
      // Simulate a small delay for a smooth UI transition
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Execute the store action
      if (typeof signOut === 'function') {
        signOut();
        // Redirection is usually handled automatically by the root layout 
        // when the token becomes null.
      } else {
        throw new Error("Sign out function not found");
      }
      
    } catch (error) {
      setLoading(false);
      Alert.alert("Error", "Something went wrong while signing out. Please try again.");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => router.back()} 
          style={styles.backBtn}
          disabled={loading}
        >
          <Ionicons name="close" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <View style={styles.iconCircle}>
          <Ionicons name="log-out" size={50} color="#FF3B5C" />
        </View>

        <Text style={styles.title}>Are you sure?</Text>
        <Text style={styles.description}>
          You will need to re-enter your email and password to access your matches and messages next time.
        </Text>

        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={[styles.confirmBtn, loading && styles.disabledBtn]} 
            onPress={handleSignOut}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.confirmText}>Yes, Sign Me Out</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.cancelBtn} 
            onPress={() => router.back()}
            disabled={loading}
          >
            <Text style={styles.cancelText}>Stay Logged In</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    paddingTop: 20,
    paddingHorizontal: 20,
    alignItems: 'flex-start',
  },
  backBtn: {
    padding: 8,
    backgroundColor: '#F5F5F5',
    borderRadius: 20,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    marginTop: -40, 
  },
  iconCircle: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: '#FFF0F2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 25,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 40,
  },
  buttonContainer: {
    width: '100%',
    gap: 15,
  },
  confirmBtn: {
    backgroundColor: '#FF3B5C',
    height: 55,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  disabledBtn: {
    opacity: 0.5,
  },
  confirmText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cancelBtn: {
    height: 55,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    borderWidth: 1,
    borderColor: '#EEE',
  },
  cancelText: {
    color: '#333',
    fontSize: 16,
    fontWeight: '600',
  },
});