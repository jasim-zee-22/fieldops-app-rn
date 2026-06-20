import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing } from '@/theme';

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost' | 'success' | 'dark';

interface Props {
  label: string;
  onPress: () => void;
  variant?: Variant;
  loading?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  icon?: keyof typeof Ionicons.glyphMap;
  fullRound?: boolean;
}

const bg: Record<Variant, string> = {
  primary: colors.primary,
  secondary: colors.primaryLight,
  danger: colors.danger,
  ghost: 'transparent',
  success: colors.green,
  dark: '#0F1221',
};

const fg: Record<Variant, string> = {
  primary: colors.white,
  secondary: colors.primary,
  danger: colors.white,
  ghost: colors.textMuted,
  success: colors.white,
  dark: colors.white,
};

export function Button({
  label,
  onPress,
  variant = 'primary',
  loading,
  disabled,
  style,
  icon,
  fullRound = false,
}: Props) {
  const isDisabled = disabled || loading;
  const borderR = fullRound ? radius.full : radius.md;

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        { backgroundColor: bg[variant], borderRadius: borderR },
        variant === 'ghost' && styles.ghost,
        (pressed || isDisabled) && styles.dim,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={fg[variant]} />
      ) : (
        <View style={styles.inner}>
          {icon && (
            <Ionicons name={icon} size={18} color={fg[variant]} style={styles.icon} />
          )}
          <Text style={[styles.label, { color: fg[variant] }]}>{label}</Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 52,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  icon: {
    marginRight: 2,
  },
  ghost: {
    borderWidth: 1,
    borderColor: colors.border,
  },
  dim: {
    opacity: 0.6,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.1,
  },
});
