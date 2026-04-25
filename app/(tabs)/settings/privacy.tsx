import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export default function PrivacySettings() {
  const router = useRouter();

  // Local state for privacy toggles
  const [settings, setSettings] = useState({
    profileVisible: true,
    showOnlineStatus: true,
    readReceipts: true,
    incognitoMode: false,
    shareDataForAnalytics: false,
  });

  const toggleSwitch = (key: keyof typeof settings) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
    // In production, sync this change to your Node.js backend immediately
    // api.patch('/user/privacy-settings', { [key]: !settings[key] });
  };

  const PrivacyOption = ({ 
    icon, 
    title, 
    description, 
    value, 
    onToggle 
  }: { 
    icon: any, 
    title: string, 
    description: string, 
    value: boolean, 
    onToggle: () => void 
  }) => (
    <View style={styles.optionRow}>
      <View style={styles.iconContainer}>
        <Ionicons name={icon} size={22} color="#FF3B5C" />
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.optionTitle}>{title}</Text>
        <Text style={styles.optionDescription}>{description}</Text>
      </View>
      <Switch
        trackColor={{ false: "#E9E9EB", true: "#FF3B5C" }}
        thumbColor={Platform.OS === 'ios' ? '#fff' : value ? '#fff' : '#f4f3f4'}
        ios_backgroundColor="#E9E9EB"
        onValueChange={onToggle}
        value={value}
      />
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Privacy & Safety</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.infoBanner}>
          <MaterialCommunityIcons name="shield-check" size={24} color="#FF3B5C" />
          <Text style={styles.infoText}>
            Your safety is our priority. Adjust these settings to control your digital footprint on Bliss.
          </Text>
        </View>

        <Text style={styles.sectionLabel}>Visibility</Text>
        <View style={styles.card}>
          <PrivacyOption
            icon="eye-outline"
            title="Public Profile"
            description="Allow other users to find you in the discovery feed."
            value={settings.profileVisible}
            onToggle={() => toggleSwitch('profileVisible')}
          />
          <View style={styles.divider} />
          <PrivacyOption
            icon="radio-button-on"
            title="Online Status"
            description="Show when you are active on the app."
            value={settings.showOnlineStatus}
            onToggle={() => toggleSwitch('showOnlineStatus')}
          />
        </View>

        <Text style={styles.sectionLabel}>Messaging</Text>
        <View style={styles.card}>
          <PrivacyOption
            icon="checkmark-done"
            title="Read Receipts"
            description="Let others know when you have read their messages."
            value={settings.readReceipts}
            onToggle={() => toggleSwitch('readReceipts')}
          />
        </View>

        <Text style={styles.sectionLabel}>Advanced</Text>
        <View style={styles.card}>
          <PrivacyOption
            icon="ghost-outline"
            title="Incognito Mode"
            description="View profiles without letting them know you visited."
            value={settings.incognitoMode}
            onToggle={() => toggleSwitch('incognitoMode')}
          />
        </View>

        <TouchableOpacity 
          style={styles.dangerZone}
          onPress={() => Alert.alert("Request Data", "A copy of your data will be sent to your registered email.")}
        >
          <Text style={styles.dangerText}>Download My Data</Text>
          <Ionicons name="download-outline" size={20} color="#666" />
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.dangerZone, { marginTop: 10 }]}
          onPress={() => Alert.alert("Delete Account", "This action is permanent. Are you sure?", [{ text: "Cancel" }, { text: "Delete", style: 'destructive' }])}
        >
          <Text style={[styles.dangerText, { color: '#FF3B5C' }]}>Delete Account</Text>
          <Ionicons name="trash-outline" size={20} color="#FF3B5C" />
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9F9F9' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: '#fff',
  },
  backBtn: { padding: 8, backgroundColor: '#F5F5F5', borderRadius: 12 },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#1a1a1a' },
  scrollContent: { paddingHorizontal: 20, paddingTop: 20 },
  
  infoBanner: {
    flexDirection: 'row',
    backgroundColor: '#FFF0F2',
    padding: 15,
    borderRadius: 15,
    alignItems: 'center',
    marginBottom: 25,
  },
  infoText: { flex: 1, marginLeft: 12, fontSize: 13, color: '#333', lineHeight: 18 },

  sectionLabel: { fontSize: 14, fontWeight: '700', color: '#888', marginBottom: 10, marginLeft: 5, textTransform: 'uppercase' },
  card: { backgroundColor: '#fff', borderRadius: 20, paddingHorizontal: 15, marginBottom: 25, borderWidth: 1, borderColor: '#F0F0F0' },
  
  optionRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 18 },
  iconContainer: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#FFF0F2', justifyContent: 'center', alignItems: 'center' },
  textContainer: { flex: 1, marginLeft: 15, marginRight: 10 },
  optionTitle: { fontSize: 16, fontWeight: '600', color: '#1a1a1a' },
  optionDescription: { fontSize: 12, color: '#888', marginTop: 2 },
  
  divider: { height: 1, backgroundColor: '#F0F0F0', marginLeft: 55 },

  dangerZone: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 18,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  dangerText: { fontSize: 16, fontWeight: '600', color: '#666' },
});