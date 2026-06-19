import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StatusBadge } from './StatusBadge';
import { colors, radius, spacing } from '@/theme';
import { formatDateTime } from '@/utils/format';
import type { Job } from '@/types';

export function JobCard({ job, onPress }: { job: Job; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
      <View style={styles.topRow}>
        <Text style={styles.number}>{job.job_number}</Text>
        <StatusBadge status={job.status} />
      </View>
      <Text style={styles.title} numberOfLines={1}>
        {job.title}
      </Text>
      <Text style={styles.customer} numberOfLines={1}>
        {job.customer_name}
      </Text>
      <View style={styles.metaRow}>
        <Ionicons name="location-outline" size={14} color={colors.textSubtle} />
        <Text style={styles.meta} numberOfLines={1}>
          {job.service_address}
        </Text>
      </View>
      <View style={styles.metaRow}>
        <Ionicons name="time-outline" size={14} color={colors.textSubtle} />
        <Text style={styles.meta}>{formatDateTime(job.scheduled_start)}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: spacing.xs,
  },
  pressed: { opacity: 0.7 },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  number: { fontSize: 12, color: colors.textSubtle, fontWeight: '600' },
  title: { fontSize: 16, fontWeight: '700', color: colors.text },
  customer: { fontSize: 14, color: colors.textMuted },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginTop: 2 },
  meta: { fontSize: 13, color: colors.textMuted, flexShrink: 1 },
});
