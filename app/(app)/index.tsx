import { useMemo } from 'react';
import {
  FlatList,
  ImageBackground,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { fetchMyJobs } from '@/api/jobs';
import { Avatar } from '@/components/Avatar';
import { useAuthStore } from '@/store/auth';
import { colors, radius, shadow, spacing, statusColors } from '@/theme';
import {
  formatTime,
  formatDate,
  getGreeting,
  minutesUntil,
  durationLabel,
} from '@/utils/format';
import type { Job } from '@/types';

// ─────────────────────────────────────────────
// Hero Card — Next Job
// ─────────────────────────────────────────────
function HeroCard({ job, onNavigate }: { job: Job; onNavigate: () => void }) {
  const minsUntil = minutesUntil(job.scheduled_start);
  const etaTime = formatTime(job.scheduled_start);

  return (
    <LinearGradient
      colors={[colors.primaryHero, colors.primaryHeroDark]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.heroCard}
    >
      {/* Decorative background circle */}
      <View style={styles.heroBgCircle} />

      <View style={styles.heroContent}>
        <View style={styles.heroLeft}>
          <View style={styles.heroTimeBadge}>
            <Ionicons name="time-outline" size={14} color={colors.white} />
            <Text style={styles.heroTimeBadgeText}>Next Job in</Text>
          </View>
          <Text style={styles.heroMinutes}>
            {formatTimeUntil(minsUntil)}
          </Text>

          <View style={styles.heroDivider} />

          <View style={styles.heroInfoRow}>
            <View style={styles.heroInfoIcon}>
              <Ionicons name="person-outline" size={13} color={colors.white} />
            </View>
            <Text style={styles.heroInfoText} numberOfLines={1}>
              {job.customer_name}
            </Text>
          </View>
          <View style={styles.heroInfoRow}>
            <View style={styles.heroInfoIcon}>
              <Ionicons name="location-outline" size={13} color={colors.white} />
            </View>
            <Text style={styles.heroInfoText} numberOfLines={1}>
              {job.service_address}
            </Text>
          </View>
          <View style={styles.heroInfoRow}>
            <View style={styles.heroInfoIcon}>
              <Ionicons name="time-outline" size={13} color={colors.white} />
            </View>
            <Text style={styles.heroInfoText}>ETA {etaTime}</Text>
          </View>
        </View>
      </View>

      {/* Navigate button */}
      <Pressable style={styles.heroNavigateBtn} onPress={onNavigate}>
        <Ionicons name="navigate" size={16} color={colors.primary} />
        <Text style={styles.heroNavigateText}>Navigate</Text>
        <Ionicons name="chevron-forward" size={14} color={colors.primary} />
      </Pressable>
    </LinearGradient>
  );
}

// ─────────────────────────────────────────────
// Stats Card
// ─────────────────────────────────────────────
function StatCard({
  label,
  value,
  color,
  icon,
}: {
  label: string;
  value: number;
  color: string;
  icon: keyof typeof Ionicons.glyphMap;
}) {
  return (
    <View style={styles.statCard}>
      <View style={styles.statTop}>
        <Text style={[styles.statValue, { color: colors.text }]}>{value}</Text>
        <View style={[styles.statIcon, { backgroundColor: color + '22' }]}>
          <Ionicons name={icon} size={18} color={color} />
        </View>
      </View>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

// ─────────────────────────────────────────────
// Route Row
// ─────────────────────────────────────────────
function RouteRow({
  job,
  index,
  isLast,
  onPress,
}: {
  job: Job;
  index: number;
  isLast: boolean;
  onPress: () => void;
}) {
  const sc = statusColors[job.status] ?? statusColors.pending;
  const timeLabel = formatTime(job.scheduled_start);

  return (
    <Pressable style={styles.routeRow} onPress={onPress}>
      {/* Timeline dot + line */}
      <View style={styles.timelineCol}>
        <View style={[styles.timelineDot, { backgroundColor: sc.stripe }]} />
        {!isLast && <View style={styles.timelineLine} />}
      </View>

      {/* Card */}
      <View style={styles.routeCard}>
        <View style={styles.routeTop}>
          <Text style={[styles.routeJobNum, { color: sc.fg }]}>{job.job_number}</Text>
          <Text style={[styles.routeStatus, { color: sc.fg }]}>{sc.label}</Text>
        </View>
        <Text style={styles.routeTitle} numberOfLines={1}>{job.customer_name}</Text>
        <View style={styles.routeMetaRow}>
          <Ionicons name="location-outline" size={12} color={colors.textSubtle} />
          <Text style={styles.routeMeta} numberOfLines={1}>
            {job.service_address}
          </Text>
        </View>
      </View>

      <View style={styles.routeRight}>
        <Text style={styles.routeTime}>{timeLabel}</Text>
        <Ionicons name="chevron-forward" size={14} color={colors.textSubtle} />
      </View>
    </Pressable>
  );
}
// ─────────────────────────────────────────────
// Helper to format time until scheduled start
// ─────────────────────────────────────────────
function formatTimeUntil(mins: number | null) {
  if (mins == null || mins <= 0) return 'Now';

  if (mins <= 60) {
    return `${mins} min`;
  }

  const days = Math.floor(mins / (24 * 60));
  const hours = Math.floor((mins % (24 * 60)) / 60);
  const remainingMins = mins % 60;

  if (days > 0) {
    if (hours > 0) {
      return `${days}d ${hours}h`;
    }
    return `${days}d`;
  }

  return remainingMins > 0
    ? `${hours}h ${remainingMins} min`
    : `${hours}h`;
}

// ─────────────────────────────────────────────
// Main Screen
// ─────────────────────────────────────────────
export default function HomeScreen() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const { data: jobs = [], isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['my-jobs'],
    queryFn: fetchMyJobs,
  });

  const stats = useMemo(() => ({
    active: jobs.filter((j) => ['assigned', 'in_progress'].includes(j.status)).length,
    completed: jobs.filter((j) => j.status === 'completed').length,
    onHold: jobs.filter((j) => j.status === 'on_hold').length,
  }), [jobs]);

  // Next job: first non-completed/cancelled, sorted by scheduled_start
  const sortedActive = useMemo(() =>
    jobs
      .filter((j) => !['completed', 'cancelled'].includes(j.status))
      .sort((a, b) => {
        if (!a.scheduled_start) return 1;
        if (!b.scheduled_start) return -1;
        return new Date(a.scheduled_start).getTime() - new Date(b.scheduled_start).getTime();
      }),
    [jobs],
  );

  const nextJob = sortedActive[0] ?? null;
  const routeJobs = sortedActive.slice(0, 5);

  const firstName = user?.name?.split(' ')[0] ?? 'Technician';
  const greeting = getGreeting();

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={colors.primary} />}
        contentContainerStyle={styles.scrollContent}
      >
        {/* ── Header ── */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.greeting}>{greeting},</Text>
            <Text style={styles.name}>{firstName}</Text>
            <Text style={styles.subtitle}>
              {jobs.length} job{jobs.length !== 1 ? 's' : ''}
              {stats.active > 0 && (
                <Text style={styles.urgentText}> · {stats.active} active</Text>
              )}
            </Text>
          </View>
          {user && (
            <Pressable onPress={() => router.push('/(app)/profile')}>
              <Avatar name={user.name} size={48} />
            </Pressable>
          )}
        </View>

        {/* ── Hero Card ── */}
        {nextJob ? (
          <HeroCard
            job={nextJob}
            onNavigate={() => router.push(`/(app)/jobs/${nextJob.id}`)}
          />
        ) : (
          <View style={styles.noJobHero}>
            <Ionicons name="checkmark-circle" size={32} color={colors.success} />
            <Text style={styles.noJobText}>All caught up for today!</Text>
          </View>
        )}

        {/* ── Stats Row ── */}
        <View style={styles.statsRow}>
          <StatCard
            label="Active"
            value={stats.active}
            color={colors.primary}
            icon="briefcase-outline"
          />
          <StatCard
            label="Completed"
            value={stats.completed}
            color={colors.success}
            icon="checkmark-circle-outline"
          />
          <StatCard
            label="On Hold"
            value={stats.onHold}
            color={colors.warning}
            icon="time-outline"
          />
        </View>

        {/* ── Today's Route ── */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Today's Route</Text>
          <Pressable onPress={() => router.push('/(app)/jobs')}>
            <Text style={styles.viewAll}>View All  ›</Text>
          </Pressable>
        </View>

        {routeJobs.length === 0 ? (
          !isLoading && (
            <Text style={styles.empty}>No jobs scheduled. Pull to refresh.</Text>
          )
        ) : (
          <View style={styles.routeList}>
            {routeJobs.map((job, i) => (
              <RouteRow
                key={job.id}
                job={job}
                index={i}
                isLast={i === routeJobs.length - 1}
                onPress={() => router.push(`/(app)/jobs/${job.id}`)}
              />
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  scrollContent: { paddingBottom: 32 },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.lg,
  },
  headerLeft: { flex: 1 },
  greeting: { fontSize: 15, color: colors.textMuted, fontWeight: '500' },
  name: { fontSize: 30, fontWeight: '800', color: colors.text, lineHeight: 36 },
  subtitle: { fontSize: 14, color: colors.textMuted, marginTop: 2 },
  urgentText: { color: colors.primary, fontWeight: '700' },

  // Hero Card
  heroCard: {
    marginHorizontal: spacing.lg,
    borderRadius: radius.xl,
    padding: spacing.xl,
    overflow: 'hidden',
    ...shadow.lg,
  },
  heroBgCircle: {
    position: 'absolute',
    right: -40,
    top: -40,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  heroContent: {
    marginBottom: spacing.lg,
  },
  heroLeft: { flex: 1 },
  heroTimeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 6,
  },
  heroTimeBadgeText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 13,
    fontWeight: '500',
  },
  heroMinutes: {
    fontSize: 40,
    fontWeight: '800',
    color: colors.white,
    lineHeight: 44,
  },
  heroDivider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginVertical: spacing.md,
  },
  heroInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: 5,
  },
  heroInfoIcon: {
    opacity: 0.7,
  },
  heroInfoText: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 14,
    flex: 1,
    fontWeight: '500',
  },
  heroNavigateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
    borderRadius: radius.full,
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  heroNavigateText: {
    color: colors.primary,
    fontWeight: '700',
    fontSize: 15,
  },

  // No job hero
  noJobHero: {
    marginHorizontal: spacing.lg,
    borderRadius: radius.xl,
    padding: spacing.xl,
    backgroundColor: colors.successLight,
    alignItems: 'center',
    gap: spacing.sm,
  },
  noJobText: {
    color: colors.success,
    fontWeight: '700',
    fontSize: 16,
  },

  // Stats
  statsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    marginTop: spacing.lg,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    ...shadow.sm,
  },
  statTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  statValue: {
    fontSize: 26,
    fontWeight: '800',
  },
  statIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: '500',
    marginTop: 4,
  },

  // Section
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    marginTop: spacing.xl,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  viewAll: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },

  // Route list
  routeList: {
    paddingHorizontal: spacing.lg,
    gap: 0,
  },
  routeRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  timelineCol: {
    alignItems: 'center',
    paddingTop: 16,
    width: 16,
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    zIndex: 1,
  },
  timelineLine: {
    width: 2,
    flex: 1,
    minHeight: 36,
    backgroundColor: colors.border,
    marginTop: 2,
  },
  routeCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    ...shadow.sm,
  },
  routeTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 3,
  },
  routeJobNum: {
    fontSize: 11,
    fontWeight: '700',
  },
  routeStatus: {
    fontSize: 11,
    fontWeight: '600',
  },
  routeTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
  },
  routeMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 3,
  },
  routeMeta: {
    fontSize: 12,
    color: colors.textMuted,
    flex: 1,
  },
  routeRight: {
    alignItems: 'flex-end',
    paddingTop: 16,
    gap: 4,
  },
  routeTime: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
  },

  empty: {
    textAlign: 'center',
    color: colors.textMuted,
    marginTop: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
});
