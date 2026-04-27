import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Platform } from 'react-native';

/**
 * Auth Layout
 * Controls the navigation behavior for the authentication flow.
 */
export default function AuthLayout() {
  return (
    <>
      {/* StatusBar should usually be "auto" or "dark" depending on background.
         "dark" is perfect for a white (#FFFFFF) background. 
      */}
      <StatusBar style="dark" />
      
      <Stack
        screenOptions={{
          // Hide default header to use your custom branded headers in screen files
          headerShown: false,
          
          // Apply consistent background to prevent "white flashes" during transitions
          contentStyle: { backgroundColor: '#FFFFFF' },
          
          // Professional transitions
          // iOS usually expects slide_from_right, Android often uses fade or simple slide
          animation: Platform.OS === 'ios' ? 'slide_from_right' : 'fade_from_bottom',
          
          // Gesture settings for better responsiveness
          gestureEnabled: true,
          gestureDirection: 'horizontal',
        }}
      >
        {/* Sign In is usually the initial route */}
        <Stack.Screen 
          name="sign-in" 
          options={{
            title: 'Sign In',
          }} 
        />
        
        <Stack.Screen 
          name="sign-up" 
          options={{
            title: 'Create Account',
            // Keeps the flow consistent
            animation: 'slide_from_right',
          }} 
        />
        
        <Stack.Screen 
          name="forgot-password" 
          options={{
            title: 'Reset Password',
            // Presenting as a "modal-like" slide makes it feel like a secondary action
            animation: 'fade_from_bottom',
            // Prevent accidental swipes back if the user is in the middle of a reset
            gestureEnabled: Platform.OS === 'ios', 
          }} 
        />
      </Stack>
    </>
  );
}
