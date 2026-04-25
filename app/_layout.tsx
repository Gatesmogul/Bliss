import { Stack } from 'expo-router';


/**
 * RootLayout
 * This is the master wrapper for the entire app.
 */
export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        // Optional: default animation for the whole app
        animation: 'fade_from_bottom',
      }}
    >
      {/* 1. The Entry Point */}
      <Stack.Screen 
        name="index" 
        options={{ 
          gestureEnabled: false // Prevents swiping back to the splash/index
        }} 
      />

      {/* 2. Authentication Group */}
      <Stack.Screen 
        name="(auth)" 
        options={{ 
          animation: 'fade',
          gestureEnabled: false 
        }} 
      />

      {/* 3. Main Application Group */}
      <Stack.Screen 
        name="(tabs)" 
        options={{ 
          animation: 'slide_from_right',
          gestureEnabled: false // User shouldn't swipe back into the auth flow
        }} 
      />
    </Stack>
  );
}