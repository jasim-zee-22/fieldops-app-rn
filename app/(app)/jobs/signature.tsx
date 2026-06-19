import { useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import SignatureScreen, { type SignatureViewRef } from 'react-native-signature-canvas';
import { Button } from '@/components/Button';
import { Field } from '@/components/Field';
import { captureSignature } from '@/api/jobs';
import { apiErrorMessage } from '@/api/client';
import { colors, radius, spacing } from '@/theme';

export default function SignatureScreenView() {
  const { jobId } = useLocalSearchParams<{ jobId: string }>();
  const id = Number(jobId);
  const router = useRouter();
  const queryClient = useQueryClient();
  const ref = useRef<SignatureViewRef>(null);

  const [customerName, setCustomerName] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  // Fired by the canvas once it has encoded the drawing as base64.
  async function handleOK(signatureBase64: string) {
    setSaving(true);
    setError('');
    try {
      await captureSignature(id, customerName.trim(), signatureBase64);
      void queryClient.invalidateQueries({ queryKey: ['job', id] });
      router.back();
    } catch (e) {
      setError(apiErrorMessage(e, 'Could not save signature.'));
      setSaving(false);
    }
  }

  function onSavePress() {
    if (!customerName.trim()) {
      setError('Enter the customer name.');
      return;
    }
    setError('');
    ref.current?.readSignature(); // triggers handleOK / handleEmpty
  }

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <View style={styles.content}>
        <Field
          label="Customer name"
          value={customerName}
          onChangeText={setCustomerName}
          placeholder="Name of person signing"
        />

        <Text style={styles.hint}>Have the customer sign below.</Text>
        <View style={styles.canvasWrap}>
          <SignatureScreen
            ref={ref}
            onOK={handleOK}
            onEmpty={() => setError('Please capture a signature.')}
            descriptionText=""
            webStyle={canvasStyle}
            autoClear={false}
          />
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <View style={styles.actions}>
          <Button label="Clear" variant="ghost" onPress={() => ref.current?.clearSignature()} style={styles.flex} />
          <Button label="Save Signature" onPress={onSavePress} loading={saving} style={styles.flex} />
        </View>
      </View>
    </SafeAreaView>
  );
}

// CSS injected into the signature WebView.
const canvasStyle = `
  .m-signature-pad { box-shadow: none; border: none; margin: 0; }
  .m-signature-pad--body { border: none; }
  .m-signature-pad--footer { display: none; margin: 0; }
  body, html { width: 100%; height: 100%; }
`;

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  content: { flex: 1, padding: spacing.lg, gap: spacing.md },
  hint: { fontSize: 14, color: colors.textMuted },
  canvasWrap: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  error: { color: colors.danger, fontSize: 14 },
  actions: { flexDirection: 'row', gap: spacing.sm },
  flex: { flex: 1 },
});
