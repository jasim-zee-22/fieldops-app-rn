import type { JobStatus } from '@/types';

export const colors = {
  primary: '#7c3aed',
  primaryDark: '#6d28d9',
  primaryLight: '#ede9fe',
  bg: '#fafafa',
  surface: '#ffffff',
  border: '#e4e4e7',
  text: '#18181b',
  textMuted: '#71717a',
  textSubtle: '#a1a1aa',
  success: '#16a34a',
  warning: '#d97706',
  danger: '#e11d48',
  white: '#ffffff',
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
  sm: 8,
  md: 12,
  lg: 16,
  full: 9999,
};

export const statusColors: Record<JobStatus, { bg: string; fg: string; label: string }> = {
  pending: { bg: '#f4f4f5', fg: '#52525b', label: 'Pending' },
  assigned: { bg: '#dbeafe', fg: '#1d4ed8', label: 'Assigned' },
  in_progress: { bg: '#fef3c7', fg: '#b45309', label: 'In Progress' },
  on_hold: { bg: '#ffedd5', fg: '#c2410c', label: 'On Hold' },
  completed: { bg: '#dcfce7', fg: '#15803d', label: 'Completed' },
  cancelled: { bg: '#ffe4e6', fg: '#be123c', label: 'Cancelled' },
};
