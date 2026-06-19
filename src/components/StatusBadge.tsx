import { StyleSheet, Text, View } from 'react-native';
import { radius, spacing, statusColors } from '@/theme';
import type { JobStatus } from '@/types';

export function StatusBadge({ status }: { status: JobStatus }) {
  const c = statusColors[status] ?? statusColors.pending;
  return (
    <View style={[styles.badge, { backgroundColor: c.bg }]}>
      <Text style={[styles.text, { color: c.fg }]}>{c.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.full,
  },
  text: {
    fontSize: 12,
    fontWeight: '600',
  },
});
