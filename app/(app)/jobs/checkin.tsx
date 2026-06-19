import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import * as Location from 'expo-location';
import MapView, { Marker } from 'react-native-maps';
import { Button } from '@/components/Button';
import { logGps } from '@/api/jobs';
import { apiErrorMessage } from '@/api/client';
import { colors, radius, spacing } from '@/theme';

export default function CheckInScreen() {
  const { jobId } = useLocalSearchParams<{ jobId: string }>();
  const id = Number(jobId);
  const router = useRouter();
  const queryClient = useQueryClient();

  const [coords, setCoords] = useState<Location.LocationObjectCoords | null>(null);
  const [permError, setPermError] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setPermError('Location permission is required to check in.');
          return;
        }
        const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
        setCoords(loc.coords);
      } catch (e) {
        setPermError(apiErrorMessage(e, 'Could not read your location.'));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function submit() {
    if (!coords) return;
    setSubmitting(true);
    setSubmitError('');
    try {
      await logGps(id, {
        latitude: coords.latitude,
        longitude: coords.longitude,
        accuracy: coords.accuracy,
        altitude: coords.altitude,
        speed: coords.speed,
        log_type: 'check_in',
        logged_at: new Date().toISOString(),
      });
      void queryClient.invalidateQueries({ queryKey: ['job', id] });
      router.back();
    } catch (e) {
      setSubmitError(apiErrorMessage(e, 'Check-in failed.'));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <View style={styles.content}>
        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.muted}>Reading your location…</Text>
          </View>
        ) : permError ? (
          <Text style={styles.error}>{permError}</Text>
        ) : coords ? (
          <>
            <MapView
              style={styles.map}
              initialRegion={{
                latitude: coords.latitude,
                longitude: coords.longitude,
                latitudeDelta: 0.005,
                longitudeDelta: 0.005,
              }}
            >
              <Marker coordinate={{ latitude: coords.latitude, longitude: coords.longitude }} />
            </MapView>
            <Text style={styles.coords}>
              {coords.latitude.toFixed(5)}, {coords.longitude.toFixed(5)}
              {coords.accuracy ? `  ±${Math.round(coords.accuracy)}m` : ''}
            </Text>
            {submitError ? <Text style={styles.error}>{submitError}</Text> : null}
            <Button label="Confirm Check-In" onPress={submit} loading={submitting} />
          </>
        ) : null}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  content: { flex: 1, padding: spacing.lg, gap: spacing.md },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.sm },
  map: { flex: 1, borderRadius: radius.lg },
  coords: { textAlign: 'center', color: colors.textMuted, fontSize: 14 },
  muted: { color: colors.textMuted },
  error: { color: colors.danger, fontSize: 15, textAlign: 'center' },
});
