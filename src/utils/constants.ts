/**
 * API base URL.
 *
 * IMPORTANT: A phone/emulator cannot reach `fieldops.test` or `localhost`.
 * In development, point this at your dev machine's LAN IP (the one running
 * `herd`/`php artisan serve`). Find it with `ipconfig` (Windows) and replace below.
 *
 *   Example: http://192.168.1.42/api/v1
 *
 * The Android emulator can use http://10.0.2.2 to reach the host machine.
 */
export const API_BASE_URL ='http://192.168.1.2:8000/api/v1';

export const TOKEN_KEY = 'fieldops_token';

export const JOB_STATUSES = [
  'pending',
  'assigned',
  'in_progress',
  'on_hold',
  'completed',
  'cancelled',
] as const;
