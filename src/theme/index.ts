import type { JobStatus } from '@/types';

export const colors = {
  // Brand – Royal Blue
  primary: '#1E3AE8',
  primaryDark: '#1530C8',
  primaryLight: '#E8ECFD',
  primaryHero: '#2340EE',        // Hero card gradient start
  primaryHeroDark: '#1428B8',    // Hero card gradient end

  // Backgrounds
  bg: '#F4F6FA',
  surface: '#FFFFFF',
  surfaceAlt: '#F9FAFB',

  // Borders & Dividers
  border: '#E8EBF0',
  borderLight: '#F0F2F7',

  // Text
  text: '#0F1221',
  textMuted: '#6B7280',
  textSubtle: '#9CA3AF',

  // Semantic
  success: '#16A34A',
  successLight: '#DCFCE7',
  successDark: '#15803D',
  warning: '#D97706',
  warningLight: '#FEF3C7',
  danger: '#DC2626',
  dangerLight: '#FEE2E2',

  // Status-specific
  inProgress: '#D97706',
  inProgressBg: '#FEF3C7',
  onHold: '#EA580C',
  onHoldBg: '#FFEDD5',
  scheduled: '#1E3AE8',
  scheduledBg: '#E8ECFD',
  completed: '#6B7280',
  completedBg: '#F4F6FA',

  // Accent
  green: '#16A34A',
  greenDark: '#15803D',

  white: '#FFFFFF',
  black: '#000000',

  // Navigate accent
  navBlue: '#1E3AE8',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
};

export const radius = {
  xs: 6,
  sm: 10,
  md: 14,
  lg: 18,
  xl: 24,
  full: 9999,
};

export const shadow = {
  sm: {
    shadowColor: '#0F1221',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#0F1221',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: '#0F1221',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  },
};

export const statusColors: Record<JobStatus, { bg: string; fg: string; label: string; stripe: string }> = {
  pending:     { bg: '#F4F6FA', fg: '#6B7280', label: 'Pending',     stripe: '#9CA3AF' },
  assigned:    { bg: '#E8ECFD', fg: '#1E3AE8', label: 'Scheduled',   stripe: '#1E3AE8' },
  in_progress: { bg: '#FEF3C7', fg: '#B45309', label: 'In Progress', stripe: '#D97706' },
  on_hold:     { bg: '#FFEDD5', fg: '#C2410C', label: 'On Hold',     stripe: '#EA580C' },
  completed:   { bg: '#F4F6FA', fg: '#6B7280', label: 'Completed',   stripe: '#D1D5DB' },
  cancelled:   { bg: '#FEE2E2', fg: '#DC2626', label: 'Cancelled',   stripe: '#DC2626' },
};
