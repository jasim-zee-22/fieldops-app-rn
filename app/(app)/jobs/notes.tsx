import { useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/Button';
import { Field } from '@/components/Field';
import { addNote } from '@/api/jobs';
import { apiErrorMessage } from '@/api/client';
import { colors, spacing } from '@/theme';

export default function NotesScreen() {
  const { jobId } = useLocalSearchParams<{ jobId: string }>();
  const id = Number(jobId);
  const router = useRouter();
  const queryClient = useQueryClient();

  const [note, setNote] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  async function save() {
    if (!note.trim()) {
      setError('Write a note first.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await addNote(id, note.trim());
      void queryClient.invalidateQueries({ queryKey: ['job', id] });
      router.back();
    } catch (e) {
      setError(apiErrorMessage(e, 'Could not save note.'));
    } finally {
      setSaving(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.content}>
          <Field
            label="Note"
            value={note}
            onChangeText={setNote}
            placeholder="Describe what you did, parts used, follow-ups…"
            multiline
            numberOfLines={6}
            style={styles.textarea}
          />
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <Button label="Save Note" onPress={save} loading={saving} />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  flex: { flex: 1 },
  content: { padding: spacing.lg, gap: spacing.md },
  textarea: { minHeight: 140, textAlignVertical: 'top' },
  error: { color: colors.danger, fontSize: 14 },
});
