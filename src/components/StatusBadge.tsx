import { StyleSheet, Text, View } from 'react-native';
import { radius, spacing, statusColors } from '@/theme';
import type { JobStatus } from '@/types';

interface StatusBadgeProps {
  status: JobStatus;
  showDot?: boolean;
}

export function StatusBadge({ status, showDot = true }: StatusBadgeProps) {
  const c = statusColors[status] ?? statusColors.pending;
  return (
    <View style={[styles.badge, { backgroundColor: c.bg }]}>
      {showDot && (
        <View style={[styles.dot, { backgroundColor: c.fg }]} />
      )}
      <Text style={[styles.text, { color: c.fg }]}>{c.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 4,
    borderRadius: radius.full,
    gap: 5,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  text: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.1,
  },
});
