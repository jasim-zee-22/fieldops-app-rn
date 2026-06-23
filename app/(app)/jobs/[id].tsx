import {
  ActivityIndicator,
  Image,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { fetchJob, updateJobStatus } from '@/api/jobs';
import { apiErrorMessage } from '@/api/client';
import { Avatar } from '@/components/Avatar';
import { StatusBadge } from '@/components/StatusBadge';
import { colors, radius, shadow, spacing } from '@/theme';
import {
  formatDate,
  formatTime,
  durationLabel,
  titleCase,
} from '@/utils/format';
import type { JobStatus } from '@/types';

// ─────────────────────────────────────────────
// Quick Action Button
// ─────────────────────────────────────────────
function QuickAction({
  icon,
  label,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable style={styles.quickAction} onPress={onPress}>
      <View style={styles.quickActionIcon}>
        <Ionicons name={icon} size={22} color={colors.primary} />
      </View>
      <Text style={styles.quickActionLabel}>{label}</Text>
    </Pressable>
  );
}

// ─────────────────────────────────────────────
// Open address in Google Maps
// ─────────────────────────────────────────────
function openInMaps(
  address: string,
  lat?: number | string | null,
  lng?: number | string | null,
) {
  const parsedLat = typeof lat === 'string' ? parseFloat(lat) : lat;
  const parsedLng = typeof lng === 'string' ? parseFloat(lng) : lng;
  const hasCoords =
    parsedLat != null &&
    parsedLng != null &&
    !isNaN(parsedLat) &&
    !isNaN(parsedLng);

  const destination = hasCoords
    ? `${parsedLat},${parsedLng}`
    : encodeURIComponent(address);


  const label = encodeURIComponent(address);
  const geoUrl = hasCoords
    ? `geo:${parsedLat},${parsedLng}?q=${parsedLat},${parsedLng}(${label})`
    : `geo:0,0?q=${encodeURIComponent(address)}`;
  Linking.canOpenURL(geoUrl).then((supported) => {
    const url = supported
      ? geoUrl
      : `https://www.google.com/maps/dir/?api=1&destination=${destination}&travelmode=driving`;
    void Linking.openURL(url);
  });

}

// ─────────────────────────────────────────────
// Info Section Card
// ─────────────────────────────────────────────
function SectionCard({
  icon,
  title,
  children,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.sectionCard}>
      <View style={styles.sectionCardHeader}>
        <Ionicons name={icon} size={16} color={colors.textMuted} />
        <Text style={styles.sectionCardTitle}>{title}</Text>
      </View>
      {children}
    </View>
  );
}

// ─────────────────────────────────────────────
// Main Screen
// ─────────────────────────────────────────────
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
        <Ionicons name="alert-circle-outline" size={40} color={colors.danger} />
        <Text style={styles.error}>{apiErrorMessage(error, 'Job not found.')}</Text>
      </View>
    );
  }

  const goto = (screen: string) =>
    router.push({
      pathname: `/(app)/jobs/${screen}` as never,
      params: { jobId: String(jobId) },
    });

  const canCheckIn = ['assigned', 'in_progress'].includes(job.status);
  const canStart = job.status === 'assigned';
  const canHold = job.status === 'in_progress';
  const canResume = job.status === 'on_hold';
  const canComplete = ['in_progress', 'on_hold'].includes(job.status);

  const fullAddress = [
    job.service_address,
    job.service_city,
    job.service_state,
    job.service_postal,
  ]
    .filter(Boolean)
    .join(', ');

  const dateLabel = formatDate(job.scheduled_start);
  const startTime = formatTime(job.scheduled_start);
  const endTime = formatTime(job.scheduled_end);
  const duration = durationLabel(job.scheduled_start, job.scheduled_end);

  return (
    <View style={styles.container}>
      {/* ── Blue Hero Header ── */}
      <LinearGradient
        colors={[colors.primaryHero, colors.primaryHeroDark]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.hero}
      >
        <SafeAreaView edges={['top']}>
          {/* Nav row */}
          <View style={styles.heroNav}>
            <Pressable
              style={styles.heroNavBtn}
              onPress={() => router.replace('/(app)/jobs')}
            >
              <Ionicons name="chevron-back" size={22} color={colors.white} />
            </Pressable>

            <Text style={styles.heroNavTitle}>Job Detail</Text>
          </View>

          {/* Job info */}
          <View style={styles.heroBody}>
            <Text style={styles.heroJobNumber}>{job.job_number}</Text>
            <Text style={styles.heroTitle}>{job.title}</Text>
            <StatusBadge status={job.status} />

            {/* Check-In button */}
            {canCheckIn && (
              <Pressable
                style={styles.checkInBtn}
                onPress={() => goto('checkin')}
              >
                <Ionicons name="location" size={18} color={colors.white} />
                <Text style={styles.checkInBtnText}>Start Check-In</Text>
              </Pressable>
            )}
          </View>
        </SafeAreaView>
      </LinearGradient>

      {/* ── Scrollable Content ── */}
      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Customer ── */}
        <SectionCard icon="person-outline" title="Customer">
          <View style={styles.customerRow}>
            <Avatar name={job.customer_name} size={44} />
            <Text style={styles.customerName}>{job.customer_name}</Text>
            <View style={styles.customerActions}>
              {job.customer_phone && (
                <View style={styles.contactBtn}>
                  <Ionicons name="call" size={16} color={colors.primary} />
                </View>
              )}
              {job.customer_email && (
                <View style={styles.contactBtn}>
                  <Ionicons name="chatbubble" size={16} color={colors.primary} />
                </View>
              )}
            </View>
          </View>
        </SectionCard>

        {/* ── Location ── */}
        <SectionCard icon="location-outline" title="Location">
          <View style={styles.locationRow}>
            {/* Map placeholder */}
            <View style={styles.mapPlaceholder}>
              <Ionicons name="map" size={28} color={colors.primary} />
            </View>
            <View style={styles.locationInfo}>
              <Text style={styles.locationAddress}>{fullAddress}</Text>
              <Pressable style={styles.navigateLink} onPress={() => openInMaps(fullAddress, job.service_latitude, job.service_longitude)}>
                <Ionicons name="navigate" size={13} color={colors.primary} />
                <Text style={styles.navigateLinkText}>Navigate</Text>
              </Pressable>
            </View>
          </View>
        </SectionCard>

        {/* ── Schedule ── */}
        <SectionCard icon="calendar-outline" title="Schedule">
          <View style={styles.scheduleRow}>
            <View style={styles.scheduleItem}>
              <View style={styles.scheduleIcon}>
                <Ionicons name="calendar-outline" size={14} color={colors.primary} />
              </View>
              <Text style={styles.scheduleText}>{dateLabel}</Text>
            </View>
            {duration && (
              <View style={styles.scheduleDuration}>
                <Ionicons name="time-outline" size={13} color={colors.textMuted} />
                <View>
                  <Text style={styles.durationLabel}>Duration</Text>
                  <Text style={styles.durationValue}>{duration}</Text>
                </View>
              </View>
            )}
          </View>
          {(startTime !== '—') && (
            <View style={styles.scheduleItem}>
              <View style={styles.scheduleIcon}>
                <Ionicons name="time-outline" size={14} color={colors.primary} />
              </View>
              <Text style={styles.scheduleText}>
                {startTime}{endTime !== '—' ? ` – ${endTime}` : ''}
              </Text>
            </View>
          )}
        </SectionCard>

        {/* ── Service Type ── */}
        <SectionCard icon="construct-outline" title="Service Type">
          <View style={styles.serviceTypeRow}>
            <View style={styles.serviceTypeIcon}>
              <Ionicons name="build-outline" size={18} color={colors.primary} />
            </View>
            <Text style={styles.serviceTypeText}>{titleCase(job.job_type)}</Text>
          </View>
        </SectionCard>

        {/* ── Status Actions ── */}
        {(canStart || canHold || canResume) && (
          <SectionCard icon="swap-horizontal-outline" title="Job Actions">
            <View style={styles.actionsList}>
              {canStart && (
                <Pressable
                  style={styles.actionRow}
                  onPress={() => statusMutation.mutate('in_progress')}
                  disabled={statusMutation.isPending}
                >
                  <View style={[styles.actionDot, { backgroundColor: colors.success }]} />
                  <Text style={styles.actionText}>Start Job</Text>
                  {statusMutation.isPending && (
                    <ActivityIndicator size="small" color={colors.primary} />
                  )}
                </Pressable>
              )}
              {canHold && (
                <Pressable
                  style={styles.actionRow}
                  onPress={() => statusMutation.mutate('on_hold')}
                  disabled={statusMutation.isPending}
                >
                  <View style={[styles.actionDot, { backgroundColor: colors.warning }]} />
                  <Text style={styles.actionText}>Put On Hold</Text>
                </Pressable>
              )}
              {canResume && (
                <Pressable
                  style={styles.actionRow}
                  onPress={() => statusMutation.mutate('in_progress')}
                  disabled={statusMutation.isPending}
                >
                  <View style={[styles.actionDot, { backgroundColor: colors.primary }]} />
                  <Text style={styles.actionText}>Resume Job</Text>
                </Pressable>
              )}
            </View>
          </SectionCard>
        )}

        {/* ── Quick Actions ── */}
        <View style={styles.quickActionsSection}>
          <Text style={styles.quickActionsTitle}>Quick Actions</Text>
          <View style={styles.quickActionsGrid}>
            <QuickAction icon="camera-outline" label="Photos" onPress={() => goto('photos')} />
            <QuickAction icon="document-text-outline" label="Notes" onPress={() => goto('notes')} />
            {job.requires_signature && (
              <QuickAction icon="create-outline" label="Signature" onPress={() => goto('signature')} />
            )}
          
          </View>
        </View>

        {/* ── Photos ── */}
        {job.photos.length > 0 && (
          <SectionCard icon="images-outline" title={`Photos (${job.photos.length})`}>
            <View style={styles.photoGrid}>
              {job.photos.map((p) =>
                p.url ? (
                  <Image key={p.id} source={{ uri: p.url }} style={styles.photo} />
                ) : null,
              )}
            </View>
          </SectionCard>
        )}

        {/* ── Notes ── */}
        {job.notes.length > 0 && (
          <SectionCard icon="document-text-outline" title="Notes">
            {job.notes.map((n) => (
              <View key={n.id} style={styles.noteItem}>
                <Text style={styles.noteText}>{n.note}</Text>
                <Text style={styles.noteMeta}>
                  {n.user?.name ?? 'You'}
                </Text>
              </View>
            ))}
          </SectionCard>
        )}

        {/* ── Signature ── */}
        {job.requires_signature && job.signature?.url && (
          <SectionCard icon="create-outline" title="Customer Signature">
            <Image
              source={{ uri: job.signature.url }}
              style={styles.signature}
              resizeMode="contain"
            />
            <Text style={styles.noteMeta}>
              Signed by {job.signature.customer_name}
            </Text>
          </SectionCard>
        )}

        {/* Bottom padding for the sticky button */}
        <View style={{ height: 96 }} />
      </ScrollView>

      {/* ── Sticky Complete Button ── */}
      {canComplete && (
        <View style={styles.stickyBottom}>
          <Pressable
            style={styles.completeBtn}
            onPress={() => goto('complete')}
          >
            <Ionicons name="checkmark-circle" size={20} color={colors.white} />
            <Text style={styles.completeBtnText}>Complete Job</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    backgroundColor: colors.bg,
  },
  error: { color: colors.danger, fontSize: 15, textAlign: 'center' },

  // Hero
  hero: {
    paddingBottom: spacing.xl,
  },
  heroNav: {
  flexDirection: 'row',
  alignItems: 'center',
  paddingHorizontal: spacing.lg,
  paddingTop: spacing.sm,
  paddingBottom: spacing.md,
  position: 'relative',
},

heroNavBtn: {
  width: 36,
  height: 36,
  borderRadius: 18,
  backgroundColor: 'rgba(255,255,255,0.15)',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1,
},

heroNavTitle: {
  position: 'absolute',
  left: 0,
  right: 0,
  textAlign: 'center',
  color: colors.white,
  fontSize: 17,
  fontWeight: '700',
},
  heroBody: {
    paddingHorizontal: spacing.xl,
    gap: spacing.sm,
  },
  heroJobNumber: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  heroTitle: {
    color: colors.white,
    fontSize: 26,
    fontWeight: '800',
    lineHeight: 32,
  },
  checkInBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: radius.full,
    paddingVertical: spacing.md,
    marginTop: spacing.sm,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  checkInBtnText: {
    color: colors.white,
    fontWeight: '700',
    fontSize: 16,
  },

  // Scroll
  scrollArea: { flex: 1 },
  scrollContent: {
    padding: spacing.lg,
    gap: spacing.md,
  },

  // Section Card
  sectionCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    ...shadow.sm,
  },
  sectionCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  sectionCardTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  // Customer
  customerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  customerName: {
    flex: 1,
    fontSize: 17,
    fontWeight: '700',
    color: colors.text,
  },
  customerActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  contactBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Location
  locationRow: {
    flexDirection: 'row',
    gap: spacing.md,
    alignItems: 'center',
  },
  mapPlaceholder: {
    width: 80,
    height: 70,
    borderRadius: radius.md,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  locationInfo: {
    flex: 1,
    gap: 6,
  },
  locationAddress: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '500',
    lineHeight: 20,
  },
  navigateLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  navigateLinkText: {
    color: colors.primary,
    fontWeight: '600',
    fontSize: 14,
  },

  // Schedule
  scheduleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  scheduleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: 6,
  },
  scheduleIcon: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scheduleText: {
    fontSize: 15,
    color: colors.text,
    fontWeight: '500',
  },
  scheduleDuration: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  durationLabel: {
    fontSize: 11,
    color: colors.textSubtle,
    fontWeight: '500',
  },
  durationValue: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.text,
  },

  // Service Type
  serviceTypeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  serviceTypeIcon: {
    width: 38,
    height: 38,
    borderRadius: radius.sm,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  serviceTypeText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },

  // Actions list
  actionsList: {
    gap: spacing.xs,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.sm,
  },
  actionDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  actionText: {
    fontSize: 15,
    color: colors.text,
    fontWeight: '600',
    flex: 1,
  },

  // Quick Actions
  quickActionsSection: {
    gap: spacing.md,
  },
  quickActionsTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.text,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  quickAction: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    paddingVertical: spacing.lg,
    alignItems: 'center',
    gap: spacing.sm,
    ...shadow.sm,
  },
  quickActionIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickActionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textMuted,
  },

  // Photos
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  photo: {
    width: 90,
    height: 90,
    borderRadius: radius.md,
    backgroundColor: colors.border,
  },

  // Notes
  noteItem: {
    paddingVertical: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  noteText: { fontSize: 14, color: colors.text },
  noteMeta: {
    fontSize: 12,
    color: colors.textSubtle,
    marginTop: 2,
  },

  // Signature
  signature: {
    width: '100%',
    height: 140,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    marginBottom: spacing.xs,
  },

  // Sticky Complete
  stickyBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.lg,
    paddingBottom: 32,
    backgroundColor: 'transparent',
  },
  completeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.green,
    borderRadius: radius.full,
    paddingVertical: spacing.lg,
    ...shadow.lg,
  },
  completeBtnText: {
    color: colors.white,
    fontSize: 17,
    fontWeight: '700',
  },
});
