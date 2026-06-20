import { Stack } from 'expo-router';
import { colors } from '@/theme';

export default function JobsStackLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.surface },
        headerTintColor: colors.primary,
        headerTitleStyle: { color: colors.text },
      }}
    >
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="[id]" options={{ headerShown: false }} />
      <Stack.Screen name="checkin" options={{ title: 'GPS Check-In', presentation: 'modal' }} />
      <Stack.Screen name="photos" options={{ title: 'Photos', presentation: 'modal' }} />
      <Stack.Screen name="notes" options={{ title: 'Add Note', presentation: 'modal' }} />
      <Stack.Screen name="signature" options={{ title: 'Signature', presentation: 'modal' }} />
      <Stack.Screen name="complete" options={{ title: 'Complete Job', presentation: 'modal' }} />
    </Stack>
  );
}
