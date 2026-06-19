# FieldOps Mobile (Expo)

Technician mobile app for **FieldOps Pro**. Consumes the Laravel API at `/api/v1` (Sanctum token auth). Built with Expo Router, React Query, Zustand, and Expo native modules.

## Prerequisites
- Node 18+
- The FieldOps Pro Laravel backend running and reachable from your phone (see below)
- Expo Go app on a physical device, or an iOS/Android simulator

## 1. Install
```bash
cd fieldops-mobile
npm install
```

## 2. Point the app at your backend
Edit `src/utils/constants.ts` → `API_BASE_URL`.

A phone/emulator **cannot** reach `fieldops.test` or `localhost`. Use your dev machine's LAN IP:
- Find it: `ipconfig` (Windows) → IPv4 address, e.g. `192.168.1.42`.
- Set `API_BASE_URL = 'http://192.168.1.42/api/v1'`.
- Android emulator can use `http://10.0.2.2/api/v1` to reach the host.

> The backend must serve that host. With Herd, the site is reachable on your LAN IP. Ensure `php artisan storage:link` is run so photo/signature URLs resolve, and that the backend's `APP_URL` matches the host the device uses (otherwise image URLs in responses point to an unreachable host).

## 3. Run
```bash
npx expo start
```
Scan the QR with Expo Go (device) or press `a` / `i` for emulators.

> **Maps & signature note:** `react-native-maps` and the signature WebView work in Expo Go on SDK 52. If a native module misbehaves in Expo Go, create a dev build: `npx expo run:android` / `npx expo run:ios`.

## Login
Use a **technician** (or admin/manager) account from the backend seeder, e.g. the seeded technician emails printed by `php artisan migrate:fresh --seed`. Password: `password`.

## Structure
```
app/
  _layout.tsx            Providers (React Query, SafeArea) + auth gate redirect
  index.tsx              Entry redirect
  (auth)/login.tsx       Email/password login → Sanctum token
  (app)/_layout.tsx      Bottom tabs (Home / Jobs / Profile)
  (app)/index.tsx        Home dashboard (stats + upcoming jobs)
  (app)/profile.tsx      Profile + sign out
  (app)/jobs/
    index.tsx            My jobs (filterable)
    [id].tsx             Job detail + stage actions
    checkin.tsx          GPS check-in (expo-location + map)
    photos.tsx           Camera / library upload (expo-image-picker)
    notes.tsx            Add note
    signature.tsx        Customer signature (react-native-signature-canvas)
    complete.tsx         Completion checklist + mark complete
src/
  api/                   Axios client + auth/jobs endpoint modules
  store/auth.ts          Zustand auth store (token in expo-secure-store)
  components/            Button, Field, Card, StatusBadge, JobCard
  theme/                 Colors, spacing, status colors
  types/                 API response types
  utils/                 constants (API_BASE_URL), formatters
```

## Technician workflow
View assigned jobs → open a job → **GPS Check-In** → **Start** → add **Photos** / **Notes** → capture **Signature** → **Complete**. Each action calls the matching `/api/v1` endpoint and refreshes the job via React Query.

## Type-check
```bash
npm run lint   # tsc --noEmit
```

## Notes
- App icon/splash are omitted so the project runs without binary assets. To brand it, run `npx expo prebuild` or drop `assets/icon.png` + `assets/splash.png` and re-add them in `app.json`.
- Token is persisted in `expo-secure-store`; a `401` from the API auto-signs-out.
