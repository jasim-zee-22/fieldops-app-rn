import { Redirect } from 'expo-router';
import { useAuthStore } from '@/store/auth';

/** Entry point — bounce to the correct group once the session is known. */
export default function Index() {
  const status = useAuthStore((s) => s.status);

  if (status === 'signedIn') return <Redirect href="/(app)" />;
  if (status === 'signedOut') return <Redirect href="/(auth)/login" />;
  return null;
}
