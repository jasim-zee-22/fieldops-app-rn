import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { fetchJob, updateJobStatus } from '@/api/jobs';
import { apiErrorMessage } from '@/api/client';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { StatusBadge } from '@/components/StatusBadge';
import { colors, spacing } from '@/theme';
import { formatDateTime, titleCase } from '@/utils/format';
import type { JobStatus } from '@/types';

export default function JobDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const jobId = Number(id);
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: job, isLoading, error } = useQuery({
    queryKey: ['job', jobId],
    queryFn: () => fetchJob(jobId),
    enabled: Number.isFinite(jobId),
  });

  const statusMutation = useMutation({
    mutationFn: (status: JobStatus) => updateJobStatus(jobId, status),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['job', jobId] });
      void queryClient.invalidateQueries({ queryKey: ['my-jobs'] });
    },
  });

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (error || !job) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>{apiErrorMessage(error, 'Job not found.')}</Text>
      </View>
    );
  }

  const goto = (screen: string) =>
    router.push({ pathname: `/(app)/jobs/${screen}` as never, params: { jobId: String(jobId) } });

  const canCheckIn = ['assigned', 'in_progress'].includes(job.status);
  const canStart = job.status === 'assigned';
  const canHold = job.status === 'in_progress';
  const canResume = job.status === 'on_hold';
  const canComplete = ['in_progress', 'on_hold'].includes(job.status);

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.headerRow}>
          <Text style={styles.jobNumber}>{job.job_number}</Text>
          <StatusBadge status={job.status} />
        </View>
        <Text style={styles.title}>{job.title}</Text>
        {job.description ? <Text style={styles.desc}>{job.description}</Text> : null}

        {/* Customer / service */}
        <Card>
          <Text style={styles.cardTitle}>Customer & Location</Text>
          <InfoRow icon="person-outline" text={job.customer_name} />
          {job.customer_phone ? <InfoRow icon="call-outline" text={job.customer_phone} /> : null}
          <InfoRow
            icon="location-outline"
            text={`${job.service_address}${job.service_city ? `, ${job.service_city}` : ''} ${job.service_state ?? ''}`}
          />
          <InfoRow icon="time-outline" text={`Scheduled ${formatDateTime(job.scheduled_start)}`} />
          <InfoRow icon="construct-outline" text={titleCase(job.job_type)} />
        </Card>

        {/* Quick status actions */}
        <Card>
          <Text style={styles.cardTitle}>Job Actions</Text>
          <View style={styles.actionsGrid}>
            {canStart ? (
              <Button
                label="Start Job"
                onPress={() => statusMutation.mutate('in_progress')}
                loading={statusMutation.isPending}
                style={styles.action}
              />
            ) : null}
            {canHold ? (
              <Button
                label="Put On Hold"
                variant="secondary"
                onPress={() => statusMutation.mutate('on_hold')}
                loading={statusMutation.isPending}
                style={styles.action}
              />
            ) : null}
            {canResume ? (
              <Button
                label="Resume Job"
                onPress={() => statusMutation.mutate('in_progress')}
                loading={statusMutation.isPending}
                style={styles.action}
              />
            ) : null}
            {canCheckIn ? (
              <Button label="GPS Check-In" variant="secondary" onPress={() => goto('checkin')} style={styles.action} />
            ) : null}
            <Button label="Add Photos" variant="secondary" onPress={() => goto('photos')} style={styles.action} />
            <Button label="Add Note" variant="secondary" onPress={() => goto('notes')} style={styles.action} />
            {job.requires_signature ? (
              <Button label="Signature" variant="secondary" onPress={() => goto('signature')} style={styles.action} />
            ) : null}
            {canComplete ? (
              <Button label="Complete Job" onPress={() => goto('complete')} style={styles.action} />
            ) : null}
          </View>
        </Card>

        {/* Photos */}
        <Card>
          <Text style={styles.cardTitle}>Photos ({job.photos.length})</Text>
          {job.photos.length === 0 ? (
            <Text style={styles.muted}>No photos yet.</Text>
          ) : (
            <View style={styles.photoGrid}>
              {job.photos.map((p) =>
                p.url ? (
                  <Image key={p.id} source={{ uri: p.url }} style={styles.photo} />
                ) : null,
              )}
            </View>
          )}
        </Card>

        {/* Notes */}
        <Card>
          <Text style={styles.cardTitle}>Notes</Text>
          {job.notes.length === 0 ? (
            <Text style={styles.muted}>No notes yet.</Text>
          ) : (
            job.notes.map((n) => (
              <View key={n.id} style={styles.noteItem}>
                <Text style={styles.noteText}>{n.note}</Text>
                <Text style={styles.noteMeta}>
                  {n.user?.name ?? 'You'} · {formatDateTime(n.created_at)}
                </Text>
              </View>
            ))
          )}
        </Card>

        {/* Signature */}
        {job.requires_signature ? (
          <Card>
            <Text style={styles.cardTitle}>Customer Signature</Text>
            {job.signature?.url ? (
              <>
                <Image source={{ uri: job.signature.url }} style={styles.signature} resizeMode="contain" />
                <Text style={styles.muted}>
                  Signed by {job.signature.customer_name} · {formatDateTime(job.signature.signed_at)}
                </Text>
              </>
            ) : (
              <Text style={styles.muted}>Not signed yet.</Text>
            )}
          </Card>
        ) : null}

        {/* Status history */}
        <Card>
          <Text style={styles.cardTitle}>Status History</Text>
          {job.status_history.length === 0 ? (
            <Text style={styles.muted}>No changes recorded.</Text>
          ) : (
            job.status_history.map((h) => (
              <View key={h.id} style={styles.historyRow}>
                <StatusBadge status={h.status} />
                <Text style={styles.historyMeta}>
                  {h.changed_by?.name ?? 'System'} · {formatDateTime(h.created_at)}
                </Text>
              </View>
            ))
          )}
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

function InfoRow({ icon, text }: { icon: keyof typeof Ionicons.glyphMap; text: string }) {
  return (
    <View style={styles.infoRow}>
      <Ionicons name={icon} size={16} color={colors.textSubtle} />
      <Text style={styles.infoText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg },
  error: { color: colors.danger, fontSize: 15 },
  content: { padding: spacing.lg, gap: spacing.md },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  jobNumber: { fontSize: 13, color: colors.textSubtle, fontWeight: '600' },
  title: { fontSize: 22, fontWeight: '800', color: colors.text },
  desc: { fontSize: 15, color: colors.textMuted },
  cardTitle: { fontSize: 15, fontWeight: '700', color: colors.text, marginBottom: spacing.xs },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingVertical: 3 },
  infoText: { fontSize: 14, color: colors.text, flexShrink: 1 },
  actionsGrid: { gap: spacing.sm },
  action: { width: '100%' },
  muted: { color: colors.textMuted, fontSize: 14 },
  photoGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  photo: { width: 96, height: 96, borderRadius: 10, backgroundColor: colors.border },
  noteItem: { paddingVertical: spacing.xs, borderTopWidth: 1, borderTopColor: colors.border },
  noteText: { fontSize: 14, color: colors.text },
  noteMeta: { fontSize: 12, color: colors.textSubtle, marginTop: 2 },
  signature: { width: '100%', height: 140, backgroundColor: colors.white, borderRadius: 10 },
  historyRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingVertical: 4 },
  historyMeta: { fontSize: 12, color: colors.textSubtle, flexShrink: 1 },
});
