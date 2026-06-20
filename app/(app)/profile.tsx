import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Avatar } from '@/components/Avatar';
import { useAuthStore } from '@/store/auth';
import { colors, radius, shadow, spacing } from '@/theme';
import { titleCase } from '@/utils/format';

export default function ProfileScreen() {
  const user = useAuthStore((s) => s.user);
  const signOut = useAuthStore((s) => s.signOut);

  function confirmSignOut() {
    Alert.alert('Sign out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign out', style: 'destructive', onPress: () => void signOut() },
    ]);
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Profile</Text>
        </View>

        {/* Profile Hero */}
        <View style={styles.profileHero}>
          {user && <Avatar name={user.name} size={72} />}
          <Text style={styles.profileName}>{user?.name ?? '—'}</Text>
          <View style={styles.roleBadge}>
            <Text style={styles.roleText}>{user ? titleCase(user.role) : '—'}</Text>
          </View>
          {user?.company?.name && (
            <Text style={styles.companyText}>{user.company.name}</Text>
          )}
        </View>

        {/* Info Card */}
        <View style={styles.card}>
          <InfoRow icon="mail-outline" label="Email" value={user?.email ?? '—'} />
          <InfoRow icon="call-outline" label="Phone" value={user?.phone ?? '—'} />
          <InfoRow icon="business-outline" label="Company" value={user?.company?.name ?? '—'} />
          <InfoRow
            icon="shield-outline"
            label="Role"
            value={user ? titleCase(user.role) : '—'}
            last
          />
        </View>

        {/* Sign Out */}
        <Pressable style={styles.signOutBtn} onPress={confirmSignOut}>
          <Ionicons name="log-out-outline" size={18} color={colors.danger} />
          <Text style={styles.signOutText}>Sign Out</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

function InfoRow({
  icon,
  label,
  value,
  last = false,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  last?: boolean;
}) {
  return (
    <View style={[styles.infoRow, !last && styles.infoRowBorder]}>
      <View style={styles.infoIcon}>
        <Ionicons name={icon} size={16} color={colors.primary} />
      </View>
      <View style={styles.infoContent}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.lg, gap: spacing.lg, paddingBottom: 40 },

  header: { paddingTop: spacing.sm },
  title: { fontSize: 28, fontWeight: '800', color: colors.text },

  profileHero: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    alignItems: 'center',
    padding: spacing.xxl,
    gap: spacing.sm,
    ...shadow.sm,
  },
  profileName: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.text,
    marginTop: spacing.sm,
  },
  roleBadge: {
    backgroundColor: colors.primaryLight,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
  },
  roleText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.primary,
  },
  companyText: {
    fontSize: 14,
    color: colors.textMuted,
  },

  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    overflow: 'hidden',
    ...shadow.sm,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  infoRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  infoIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoContent: { flex: 1 },
  infoLabel: {
    fontSize: 12,
    color: colors.textSubtle,
    fontWeight: '500',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 15,
    color: colors.text,
    fontWeight: '600',
  },

  signOutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.dangerLight,
    borderRadius: radius.lg,
    paddingVertical: spacing.lg,
  },
  signOutText: {
    color: colors.danger,
    fontWeight: '700',
    fontSize: 16,
  },
});
