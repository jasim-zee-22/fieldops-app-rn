import { Pressable, StyleSheet, Text, View, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useState, useEffect } from 'react';
import { StatusBadge } from './StatusBadge';
import { Avatar } from './Avatar';
import { colors, radius, shadow, spacing, statusColors } from '@/theme';
import { formatScheduledTime, minutesUntil } from '@/utils/format';
import type { Job } from '@/types';

interface JobCardProps {
  job: Job;
  onPress: () => void;
  defaultExpanded?: boolean;
}

export function JobCard({ job, onPress, defaultExpanded = false }: JobCardProps) {
  const isInProgress = job.status === 'in_progress';
  const isExpanded = isInProgress || defaultExpanded;
  const sc = statusColors[job.status] ?? statusColors.pending;

  // Compute "starts in X min" based on scheduled_start
  const minsUntil = job.scheduled_start ? minutesUntil(job.scheduled_start) : null;

  const showExpandedSection = isExpanded && minsUntil !== null && minsUntil > 0 && minsUntil < 180;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      {/* Left status stripe */}
      <View style={[styles.stripe, { backgroundColor: sc.stripe }]} />

      <View style={styles.body}>
        {/* Top row: job number + status badge */}
        <View style={styles.topRow}>
          <View style={styles.jobNumberPill}>
            <Text style={styles.jobNumber}>{job.job_number}</Text>
          </View>
          <View style={styles.rightRow}>
            <StatusBadge status={job.status} />
            <Ionicons name="chevron-forward" size={16} color={colors.textSubtle} />
          </View>
        </View>

        {/* Title */}
        <Text style={styles.title} numberOfLines={1}>{job.title}</Text>

        {/* Customer row */}
        <View style={styles.customerRow}>
          <Avatar name={job.customer_name} size={28} />
          <Text style={styles.customer} numberOfLines={1}>{job.customer_name}</Text>
        </View>

        {/* Location */}
        <View style={styles.metaRow}>
          <Ionicons name="location-outline" size={14} color={colors.textSubtle} />
          <Text style={styles.meta} numberOfLines={1}>
            {job.service_address}{job.service_city ? `, ${job.service_city}` : ''}
          </Text>
        </View>

        {/* Time */}
        <View style={styles.metaRow}>
          <Ionicons name="time-outline" size={14} color={colors.textSubtle} />
          <Text style={styles.meta}>
            {formatScheduledTime(job.scheduled_start, job.scheduled_end)}
          </Text>
        </View>

        {/* Expanded In-Progress section */}
        {showExpandedSection && (
          <View style={styles.expandedSection}>
            <View style={styles.startsInRow}>
              <View style={[styles.clockBadge]}>
                <Ionicons name="time-outline" size={16} color={colors.warning} />
              </View>
              <View>
                <Text style={styles.startsInLabel}>Starts in</Text>
                <Text style={styles.startsInTime}>{minsUntil} min</Text>
              </View>
            </View>
            <Pressable
              style={styles.navigateBtn}
              onPress={onPress}
            >
              <Ionicons name="navigate" size={14} color={colors.white} />
              <Text style={styles.navigateBtnText}>Navigate</Text>
            </Pressable>
          </View>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    flexDirection: 'row',
    overflow: 'hidden',
    ...shadow.sm,
  },
  pressed: { opacity: 0.85 },
  stripe: {
    width: 4,
    borderTopLeftRadius: radius.lg,
    borderBottomLeftRadius: radius.lg,
  },
  body: {
    flex: 1,
    padding: spacing.lg,
    gap: 6,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  jobNumberPill: {
    backgroundColor: colors.primaryLight,
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  jobNumber: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primary,
    letterSpacing: 0.3,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginTop: 2,
  },
  customerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: 2,
  },
  customer: {
    fontSize: 14,
    color: colors.textMuted,
    fontWeight: '500',
    flex: 1,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  meta: {
    fontSize: 13,
    color: colors.textMuted,
    flexShrink: 1,
  },
  expandedSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  startsInRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  clockBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.warningLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  startsInLabel: {
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: '500',
  },
  startsInTime: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.warning,
  },
  navigateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.text,
    borderRadius: radius.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  navigateBtnText: {
    color: colors.white,
    fontWeight: '700',
    fontSize: 13,
  },
});
