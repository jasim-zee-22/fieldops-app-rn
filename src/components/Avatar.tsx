import { View, Text, StyleSheet } from 'react-native';
import { colors } from '@/theme';

/** Deterministically derive a pleasant background color from a name string */
export function nameToColor(name: string): string {
  const palette = [
    '#1E3AE8', '#0EA5E9', '#8B5CF6', '#EC4899',
    '#F59E0B', '#10B981', '#EF4444', '#6366F1',
    '#14B8A6', '#F97316',
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return palette[Math.abs(hash) % palette.length];
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

interface AvatarProps {
  name: string;
  size?: number;
}

export function Avatar({ name, size = 40 }: AvatarProps) {
  const bg = nameToColor(name);
  const fontSize = size * 0.38;

  return (
    <View
      style={[
        styles.container,
        { width: size, height: size, borderRadius: size / 2, backgroundColor: bg },
      ]}
    >
      <Text style={[styles.initials, { fontSize, color: colors.white }]}>
        {getInitials(name)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});
