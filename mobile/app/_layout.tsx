import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';

import { AuthProvider } from '../src/features/auth/AuthProvider';
import { AppLaunchGate } from '../src/features/launch/AppLaunchGate';
import { ObservationFlowProvider } from '../src/features/observation/ObservationFlowProvider';
import { colors } from '../src/theme/tokens';

export default function RootLayout() {
  return (
    <AuthProvider>
      <ObservationFlowProvider>
        <View style={{ flex: 1, backgroundColor: colors.paper }}>
          <StatusBar style="dark" />
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: colors.paper },
            }}
          >
            <Stack.Screen name="index" />
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="analysis" />
            <Stack.Screen name="cell" />
            <Stack.Screen name="capture" />
            <Stack.Screen name="login" />
            <Stack.Screen name="signup" />
          </Stack>
          <AppLaunchGate />
        </View>
      </ObservationFlowProvider>
    </AuthProvider>
  );
}
