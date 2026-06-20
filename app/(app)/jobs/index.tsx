import { useMemo, useState } from 'react';
import {
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { fetchMyJobs } from '@/api/jobs';
import { JobCard } from '@/components/JobCard';
import { colors, radius, shadow, spacing } from '@/theme';
import type { Job, JobStatus } from '@/types';

type Filter = 'all' | 'active' | 'on_hold' | 'completed';

const FILTERS: { key: Filter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'active', label: 'Active' },
  { key: 'on_hold', label: 'On Hold' },
  { key: 'completed', label: 'Completed' },
];

const ACTIVE: JobStatus[] = ['assigned', 'in_progress'];

export default function JobsListScreen() {
  const router = useRouter();
  const [filter, setFilter] = useState<Filter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  const { data: jobs = [], isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['my-jobs'],
    queryFn: fetchMyJobs,
  });

  const filtered = useMemo(() => {
    let result = jobs;
    if (filter === 'active') result = jobs.filter((j) => ACTIVE.includes(j.status));
    else if (filter === 'on_hold') result = jobs.filter((j) => j.status === 'on_hold');
    else if (filter === 'completed') result = jobs.filter((j) => j.status === 'completed');

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (j) =>
          j.title.toLowerCase().includes(q) ||
          j.customer_name.toLowerCase().includes(q) ||
          j.job_number.toLowerCase().includes(q),
      );
    }

    return result;
  }, [jobs, filter, searchQuery]);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* ── Header ── */}
      <View style={styles.header}>
        <Pressable style={styles.iconBtn} onPress={() => router.replace('/(app)')}>
          <Ionicons name="chevron-back" size={20} color={colors.text} />
        </Pressable>
        <Text style={styles.title}>My Jobs</Text>
        <View style={styles.headerActions}>
          <Pressable
            style={styles.iconBtn}
            onPress={() => setShowSearch((v) => !v)}
          >
            <Ionicons
              name={showSearch ? 'close' : 'search-outline'}
              size={20}
              color={colors.text}
            />
          </Pressable>

        </View>
      </View>

      {/* ── Search Bar ── */}
      {showSearch && (
        <View style={styles.searchContainer}>
          <Ionicons name="search-outline" size={16} color={colors.textSubtle} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search jobs, customers..."
            placeholderTextColor={colors.textSubtle}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoFocus
          />
          {searchQuery.length > 0 && (
            <Pressable onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={16} color={colors.textSubtle} />
            </Pressable>
          )}
        </View>
      )}

      {/* ── Filter Chips ── */}
      <View style={styles.filterRow}>
        {FILTERS.map((f) => (
          <Pressable
            key={f.key}
            onPress={() => setFilter(f.key)}
            style={[styles.chip, filter === f.key && styles.chipActive]}
          >
            <Text style={[styles.chipText, filter === f.key && styles.chipTextActive]}>
              {f.label}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* ── Job List ── */}
      <FlatList
        data={filtered}
        keyExtractor={(item: Job) => String(item.id)}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor={colors.primary}
          />
        }
        renderItem={({ item }) => (
          <JobCard
            job={item}
            onPress={() => router.push(`/(app)/jobs/${item.id}`)}
          />
        )}
        ItemSeparatorComponent={() => <View style={{ height: spacing.md }} />}
        ListEmptyComponent={
          !isLoading ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="briefcase-outline" size={40} color={colors.border} />
              <Text style={styles.empty}>No jobs in this view.</Text>
            </View>
          ) : null
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.text,
  },
  headerActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow.sm,
  },

  // Search
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.sm,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
    ...shadow.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: colors.text,
    paddingVertical: 4,
  },

  // Filter chips
  filterRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  chipActive: {
    backgroundColor: colors.text,
    borderColor: colors.text,
  },
  chipText: {
    fontSize: 13,
    color: colors.textMuted,
    fontWeight: '600',
  },
  chipTextActive: {
    color: colors.white,
  },

  // List
  content: {
    paddingHorizontal: spacing.lg,
    paddingBottom: 32,
  },
  emptyContainer: {
    alignItems: 'center',
    gap: spacing.md,
    marginTop: spacing.xxl * 2,
  },
  empty: {
    textAlign: 'center',
    color: colors.textMuted,
    fontSize: 15,
  },
});
