import { useMemo } from 'react';
import { FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { fetchMyJobs } from '@/api/jobs';
import { JobCard } from '@/components/JobCard';
import { Card } from '@/components/Card';
import { useAuthStore } from '@/store/auth';
import { colors, spacing } from '@/theme';
import type { Job } from '@/types';

export default function HomeScreen() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const { data: jobs = [], isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['my-jobs'],
    queryFn: fetchMyJobs,
  });

  const stats = useMemo(() => {
    return {
      active: jobs.filter((j) => ['assigned', 'in_progress', 'on_hold'].includes(j.status)).length,
      completed: jobs.filter((j) => j.status === 'completed').length,
      total: jobs.length,
    };
  }, [jobs]);

  const upcoming = useMemo(
    () => jobs.filter((j) => j.status !== 'completed' && j.status !== 'cancelled').slice(0, 5),
    [jobs],
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <FlatList
        data={upcoming}
        keyExtractor={(item: Job) => String(item.id)}
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.hello}>Hi, {user?.name?.split(' ')[0] ?? 'Technician'}</Text>
            <Text style={styles.sub}>Here's your day at a glance.</Text>

            <View style={styles.statsRow}>
              <Card style={styles.stat}>
                <Text style={styles.statValue}>{stats.active}</Text>
                <Text style={styles.statLabel}>Active</Text>
              </Card>
              <Card style={styles.stat}>
                <Text style={[styles.statValue, { color: colors.success }]}>{stats.completed}</Text>
                <Text style={styles.statLabel}>Completed</Text>
              </Card>
              <Card style={styles.stat}>
                <Text style={styles.statValue}>{stats.total}</Text>
                <Text style={styles.statLabel}>Total</Text>
              </Card>
            </View>

            <Text style={styles.sectionTitle}>Upcoming Jobs</Text>
          </View>
        }
        renderItem={({ item }) => (
          <JobCard job={item} onPress={() => router.push(`/(app)/jobs/${item.id}`)} />
        )}
        ItemSeparatorComponent={() => <View style={{ height: spacing.md }} />}
        ListEmptyComponent={
          !isLoading ? <Text style={styles.empty}>No upcoming jobs. Pull to refresh.</Text> : null
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.lg, gap: spacing.md },
  header: { gap: spacing.sm, marginBottom: spacing.xs },
  hello: { fontSize: 26, fontWeight: '800', color: colors.text },
  sub: { fontSize: 15, color: colors.textMuted },
  statsRow: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm },
  stat: { flex: 1, alignItems: 'center', gap: 2 },
  statValue: { fontSize: 24, fontWeight: '800', color: colors.text },
  statLabel: { fontSize: 12, color: colors.textMuted },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: colors.text, marginTop: spacing.md },
  empty: { textAlign: 'center', color: colors.textMuted, marginTop: spacing.xl },
});
