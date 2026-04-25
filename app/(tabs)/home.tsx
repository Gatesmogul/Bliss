import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import React, { memo, useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  Image,
  RefreshControl,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { useAuthStore } from '../store/authStore';

// --- Constants & Types ---
const { width } = Dimensions.get('window');

interface DiscoveryUser {
  id: string;
  fullName: string;
  age: number;
  country: string;
  profession: string;
  profileImage: string;
  isVerified: boolean;
}

// --- Mock Data (Global Discovery) ---
const GLOBAL_DEMO_DATA: DiscoveryUser[] = [
  { 
    id: '1', fullName: 'Sarah Johnson', age: 24, country: 'USA', 
    profession: 'Creative Director', isVerified: true,
    profileImage: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330' 
  },
  { 
    id: '2', fullName: 'Yuki Tanaka', age: 27, country: 'Japan', 
    profession: 'Software Architect', isVerified: true,
    profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d' 
  },
  { 
    id: '3', fullName: 'Amina Okafor', age: 26, country: 'Nigeria', 
    profession: 'Corporate Lawyer', isVerified: true,
    profileImage: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce' 
  },
  { 
    id: '4', fullName: 'Lukas Müller', age: 29, country: 'Germany', 
    profession: 'Industrial Designer', isVerified: false,
    profileImage: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e' 
  },
  { 
    id: '5', fullName: 'Chloe Thompson', age: 25, country: 'Australia', 
    profession: 'Marine Biologist', isVerified: true,
    profileImage: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1' 
  },
];

// --- Sub-components for Performance ---
const UserCard = memo(({ item, onConnect, onViewProfile }: { 
  item: DiscoveryUser, 
  onConnect: (id: string, name: string) => void,
  onViewProfile: (id: string) => void 
}) => (
  <View style={styles.card}>
    <View style={styles.imageContainer}>
      <Image source={{ uri: item.profileImage }} style={styles.userImage} />
      {item.isVerified && (
        <View style={styles.verifiedBadge}>
          <Ionicons name="checkmark-circle" size={18} color="#fff" />
        </View>
      )}
    </View>

    <div style={styles.infoSection}>
      <Text style={styles.userName}>{item.fullName}, {item.age}</Text>
      <View style={styles.metaRow}>
        <Ionicons name="briefcase-outline" size={14} color="#666" />
        <Text style={styles.metaText}>{item.profession}</Text>
        <Text style={styles.separator}>•</Text>
        <Ionicons name="location-outline" size={14} color="#666" />
        <Text style={styles.metaText}>{item.country}</Text>
      </View>

      <View style={styles.actionRow}>
        <TouchableOpacity 
          style={styles.connectBtn} 
          onPress={() => onConnect(item.id, item.fullName)}
        >
          <Ionicons name="person-add" size={18} color="#fff" />
          <Text style={styles.connectBtnText}>Connect</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.profileBtn} 
          onPress={() => onViewProfile(item.id)}
        >
          <Text style={styles.profileBtnText}>View Profile</Text>
        </TouchableOpacity>
      </View>
    </div>
  </View>
));

// --- Main Component ---
export default function Home() {
  const router = useRouter();
  const { token } = useAuthStore();
  const [users, setUsers] = useState<DiscoveryUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDiscoveryFeed = useCallback(async () => {
    try {
      // Simulating API lag
      await new Promise(resolve => setTimeout(resolve, 800));
      setUsers(GLOBAL_DEMO_DATA);
    } catch (error) {
      console.error("Feed error:", error);
      Alert.alert("Error", "Could not load discovery feed.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchDiscoveryFeed();
  }, [fetchDiscoveryFeed]);

  const handleConnect = useCallback(async (userId: string, name: string) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Alert.alert("Request Sent", `Your connection request has been sent to ${name}!`);
  }, []);

  const handleViewProfile = useCallback((id: string) => {
    router.push({
      pathname: "/(tabs)/home/[id]",
      params: { id }
    } as any);
  }, [router]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#FF3B5C" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.logo}>Bliss</Text>
        <TouchableOpacity style={styles.filterBtn} activeOpacity={0.7}>
          <Ionicons name="options-outline" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={users}
        renderItem={({ item }) => (
          <UserCard 
            item={item} 
            onConnect={handleConnect} 
            onViewProfile={handleViewProfile} 
          />
        )}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={() => {
              setRefreshing(true);
              fetchDiscoveryFeed();
            }} 
            tintColor="#FF3B5C" 
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No matches found worldwide.</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

// --- Styles ---
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9F9F9' },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingHorizontal: 20, 
    paddingVertical: 15,
    backgroundColor: '#fff' 
  },
  logo: { fontSize: 28, fontWeight: '900', color: '#FF3B5C', letterSpacing: -1 },
  filterBtn: { padding: 5 },
  listContainer: { paddingBottom: 40, paddingHorizontal: 15, paddingTop: 10 },
  card: { 
    backgroundColor: '#fff', 
    borderRadius: 24, 
    marginBottom: 20, 
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  imageContainer: { width: '100%', height: 450 },
  userImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  verifiedBadge: { 
    position: 'absolute', 
    top: 15, 
    right: 15, 
    backgroundColor: '#FF3B5C', 
    padding: 4, 
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#fff'
  },
  infoSection: { padding: 20 },
  userName: { fontSize: 24, fontWeight: 'bold', color: '#1a1a1a' },
  metaRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6, marginBottom: 18 },
  metaText: { fontSize: 14, color: '#666', marginLeft: 4 },
  separator: { marginHorizontal: 8, color: '#CCC' },
  actionRow: { flexDirection: 'row', gap: 12 },
  connectBtn: { 
    flex: 1.4, 
    flexDirection: 'row',
    backgroundColor: '#FF3B5C', 
    height: 54, 
    borderRadius: 16, 
    justifyContent: 'center', 
    alignItems: 'center',
    gap: 8
  },
  connectBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  profileBtn: { 
    flex: 1, 
    borderWidth: 1.5, 
    borderColor: '#E8E8E8', 
    height: 54, 
    borderRadius: 16, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  profileBtnText: { color: '#333', fontWeight: '600', fontSize: 16 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyContainer: { alignItems: 'center', marginTop: 100 },
  emptyText: { color: '#999', fontSize: 16 }
});