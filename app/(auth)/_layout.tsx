import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

/**
 * Auth Layout
 * This defines the navigation behavior for the authentication flow.
 */
export default function AuthLayout() {
  return (
    <>
      {/* Ensures the status bar (time, battery) is visible and dark during auth */}
      <StatusBar style="dark" />
      
      <Stack
        screenOptions={{
          // Hide the default header to allow for custom branded UI
          headerShown: false,
          // Background color for the entire auth stack
          contentStyle: { backgroundColor: '#FFFFFF' },
          // Professional transition animation
          animation: 'slide_from_right',
        }}
      >
        {/* We explicitly define the screens for clarity, 
            though Expo Router will pick them up automatically. */}
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
          }} 
        />
        <Stack.Screen 
          name="forgot-password" 
          options={{
            title: 'Reset Password',
            // Optional: allow "slide_from_bottom" for forgot password
            animation: 'fade_from_bottom' 
          }} 
        />
      </Stack>
    </>
  );
}