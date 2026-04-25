import { Href, Redirect } from 'expo-router';
import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { useAuthStore } from './store/authStore';

export default function Index() {
  const token = useAuthStore((state) => state.token);
  const isHydrated = useAuthStore((state) => state.isHydrated);

  if (!isHydrated) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#FF3B5C" />
      </View>
    );
  }

  /**
   * Casting the string to 'Href' is the professional way to resolve 
   * "Type not assignable" errors in Expo Router.
   */
  const rootPath = "/(tabs)/home" as Href;
  const authPath = "/(auth)/sign-in" as Href;

  return token ? (
    <Redirect href={rootPath} />
  ) : (
    <Redirect href={authPath} />
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
});