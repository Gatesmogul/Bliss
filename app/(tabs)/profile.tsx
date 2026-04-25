import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  Dimensions,
  FlatList,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useAuthStore } from '../store/authStore';

const { width } = Dimensions.get('window');

/**
 * Bliss Professional Profile Screen
 */
export default function ProfileScreen() {
  const user = useAuthStore((state: any) => state.user);
  const signOut = useAuthStore((state: any) => state.signOut);

  // Mock data for the "other pictures" / Gallery section
  const [gallery] = useState([
    { id: '1', uri: 'https://images.unsplash.com/photo-1517841905240-472988babdf9' },
    { id: '2', uri: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f' },
    { id: '3', uri: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6' },
  ]);

  const bioDetails = [
    { label: 'Profession', value: 'Software Architect', icon: 'briefcase-outline' },
    { label: 'Location', value: 'Lagos, Nigeria', icon: 'location-outline' },
    { label: 'Education', value: 'Unilag, Computer Science', icon: 'school-outline' },
    { label: 'Interest', value: 'Tech, Branding, Solutions', icon: 'sparkles-outline' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header Section */}
        <View style={styles.header}>
          <View style={styles.profileImageContainer}>
            <Image
              source={{ uri: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1' }}
              style={styles.profileImage}
            />
            <TouchableOpacity style={styles.editBadge}>
              <Ionicons name="camera" size={16} color="#fff" />
            </TouchableOpacity>
          </View>

          <View style={styles.nameContainer}>
            <Text style={styles.fullName}>Rachael Frederick</Text>
            <MaterialCommunityIcons name="check-decagram" size={20} color="#FF3B5C" style={styles.verifiedIcon} />
          </View>
          <Text style={styles.handle}>@rachael_bliss</Text>
        </View>

        {/* Gallery / Story Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Moments</Text>
            <TouchableOpacity>
              <Text style={styles.seeAll}>See All</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            horizontal
            data={gallery}
            keyExtractor={(item) => item.id}
            showsHorizontalScrollIndicator={false}
            renderItem={({ item }) => (
              <Image source={{ uri: item.uri }} style={styles.galleryImage} />
            )}
            contentContainerStyle={styles.galleryList}
          />
        </View>

        {/* Bio / Details Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About Me</Text>
          <View style={styles.bioCard}>
            {bioDetails.map((detail, index) => (
              <View key={index} style={[styles.bioItem, index === bioDetails.length - 1 && styles.noBorder]}>
                <View style={styles.iconWrapper}>
                  <Ionicons name={detail.icon as any} size={20} color="#666" />
                </View>
                <View>
                  <Text style={styles.detailLabel}>{detail.label}</Text>
                  <Text style={styles.detailValue}>{detail.value}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionSection}>
          <TouchableOpacity style={styles.outlineButton}>
            <Text style={styles.outlineButtonText}>Edit Profile</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.logoutButton} onPress={() => signOut()}>
            <Text style={styles.logoutButtonText}>Sign Out</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  profileImageContainer: {
    position: 'relative',
    marginBottom: 15,
  },
  profileImage: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 3,
    borderColor: '#FF3B5C',
  },
  editBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#FF3B5C',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#fff',
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  fullName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  verifiedIcon: {
    marginLeft: 6,
  },
  handle: {
    fontSize: 14,
    color: '#888',
    marginTop: 4,
  },
  section: {
    marginTop: 20,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  seeAll: {
    fontSize: 14,
    color: '#FF3B5C',
    fontWeight: '600',
  },
  galleryList: {
    paddingRight: 20,
  },
  galleryImage: {
    width: 140,
    height: 180,
    borderRadius: 15,
    marginRight: 12,
  },
  bioCard: {
    backgroundColor: '#F9F9F9',
    borderRadius: 20,
    padding: 15,
    marginTop: 10,
  },
  bioItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  noBorder: {
    borderBottomWidth: 0,
  },
  iconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  detailLabel: {
    fontSize: 12,
    color: '#999',
    textTransform: 'uppercase',
  },
  detailValue: {
    fontSize: 15,
    color: '#333',
    fontWeight: '500',
  },
  actionSection: {
    paddingHorizontal: 20,
    marginTop: 30,
    gap: 12,
  },
  outlineButton: {
    height: 50,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#EEE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  outlineButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  logoutButton: {
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF3B5C',
  },
});