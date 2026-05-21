import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { AuthProvider } from '../src/features/auth/AuthProvider';
import { ObservationFlowProvider } from '../src/features/observation/ObservationFlowProvider';

export default function RootLayout() {
  return (
    <AuthProvider>
      <ObservationFlowProvider>
        <StatusBar style="dark" />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: '#f6fbf4' },
          }}
        >
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="analysis" />
          <Stack.Screen name="cell" />
          <Stack.Screen name="capture" />
          <Stack.Screen name="login" />
          <Stack.Screen name="signup" />
        </Stack>
      </ObservationFlowProvider>
    </AuthProvider>
  );
}
