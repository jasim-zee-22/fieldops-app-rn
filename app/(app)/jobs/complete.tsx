import { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { fetchJob, logGps, updateJobStatus } from '@/api/jobs';
import { apiErrorMessage } from '@/api/client';
import { colors, spacing } from '@/theme';

export default function CompleteScreen() {
  const { jobId } = useLocalSearchParams<{ jobId: string }>();
  const id = Number(jobId);
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: job, isLoading } = useQuery({ queryKey: ['job', id], queryFn: () => fetchJob(id) });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const needsSignature = !!job?.requires_signature && !job?.signature;
  const hasPhotos = (job?.photos.length ?? 0) > 0;

  async function complete() {
    if (!job) return;
    if (needsSignature) {
      setError('A customer signature is required before completing this job.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      // Best-effort completion GPS stamp (don't block completion if it fails).
      try {
        const perm = await Location.getForegroundPermissionsAsync();
        if (perm.granted) {
          const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
          await logGps(id, {
            latitude: loc.coords.latitude,
            longitude: loc.coords.longitude,
            accuracy: loc.coords.accuracy,
            log_type: 'completion',
            logged_at: new Date().toISOString(),
          });
        }
      } catch {
        // ignore GPS errors
      }

      await updateJobStatus(id, 'completed');
      void queryClient.invalidateQueries({ queryKey: ['job', id] });
      void queryClient.invalidateQueries({ queryKey: ['my-jobs'] });
      // Pop back to the job detail (now showing Completed).
      router.back();
    } catch (e) {
      setError(apiErrorMessage(e, 'Could not complete the job.'));
    } finally {
      setSubmitting(false);
    }
  }

  if (isLoading || !job) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <View style={styles.content}>
        <Text style={styles.title}>Complete “{job.title}”</Text>

        <Card>
          <Check ok={hasPhotos} label={`Photos uploaded (${job.photos.length})`} optional />
          <Check
            ok={!needsSignature}
            label={job.requires_signature ? 'Customer signature captured' : 'Signature not required'}
          />
        </Card>

        {needsSignature ? (
          <Button
            label="Capture Signature"
            variant="secondary"
            onPress={() =>
              router.replace({ pathname: '/(app)/jobs/signature' as never, params: { jobId: String(id) } })
            }
          />
        ) : null}

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Button label="Mark as Completed" onPress={complete} loading={submitting} disabled={needsSignature} />
      </View>
    </SafeAreaView>
  );
}

function Check({ ok, label, optional }: { ok: boolean; label: string; optional?: boolean }) {
  const color = ok ? colors.success : optional ? colors.textSubtle : colors.danger;
  const icon = ok ? 'checkmark-circle' : optional ? 'ellipse-outline' : 'alert-circle';
  return (
    <View style={styles.checkRow}>
      <Ionicons name={icon} size={20} color={color} />
      <Text style={styles.checkLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg },
  content: { flex: 1, padding: spacing.lg, gap: spacing.lg },
  title: { fontSize: 22, fontWeight: '800', color: colors.text },
  checkRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.xs },
  checkLabel: { fontSize: 15, color: colors.text },
  error: { color: colors.danger, fontSize: 14 },
});
