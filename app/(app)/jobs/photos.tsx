import { useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import * as ImagePicker from 'expo-image-picker';
import { Button } from '@/components/Button';
import { uploadPhotos, type PhotoAsset } from '@/api/jobs';
import { apiErrorMessage } from '@/api/client';
import { colors, radius, spacing } from '@/theme';

type PhotoType = 'before' | 'after' | 'progress' | 'other';
const TYPES: PhotoType[] = ['before', 'after', 'progress', 'other'];

export default function PhotosScreen() {
  const { jobId } = useLocalSearchParams<{ jobId: string }>();
  const id = Number(jobId);
  const router = useRouter();
  const queryClient = useQueryClient();

  const [assets, setAssets] = useState<PhotoAsset[]>([]);
  const [photoType, setPhotoType] = useState<PhotoType>('before');
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);

  function addAssets(picked: ImagePicker.ImagePickerAsset[]) {
    setAssets((prev) => [
      ...prev,
      ...picked.map((a) => ({ uri: a.uri, fileName: a.fileName, mimeType: a.mimeType })),
    ]);
  }

  async function takePhoto() {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) {
      setError('Camera permission is required.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({ quality: 0.7 });
    if (!result.canceled) addAssets(result.assets);
  }

  async function pickFromLibrary() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      quality: 0.7,
      selectionLimit: 10,
    });
    if (!result.canceled) addAssets(result.assets);
  }

  async function upload() {
    if (assets.length === 0) {
      setError('Add at least one photo.');
      return;
    }
    setUploading(true);
    setError('');
    try {
      await uploadPhotos(id, assets, photoType);
      void queryClient.invalidateQueries({ queryKey: ['job', id] });
      router.back();
    } catch (e) {
      setError(apiErrorMessage(e, 'Upload failed.'));
    } finally {
      setUploading(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.label}>Photo type</Text>
        <View style={styles.typeRow}>
          {TYPES.map((t) => (
            <Pressable
              key={t}
              onPress={() => setPhotoType(t)}
              style={[styles.chip, photoType === t && styles.chipActive]}
            >
              <Text style={[styles.chipText, photoType === t && styles.chipTextActive]}>{t}</Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.pickRow}>
          <Button label="Take Photo" variant="secondary" onPress={takePhoto} style={styles.flex} />
          <Button label="Library" variant="secondary" onPress={pickFromLibrary} style={styles.flex} />
        </View>

        {assets.length > 0 ? (
          <View style={styles.grid}>
            {assets.map((a, i) => (
              <Image key={`${a.uri}-${i}`} source={{ uri: a.uri }} style={styles.thumb} />
            ))}
          </View>
        ) : (
          <Text style={styles.muted}>No photos selected yet.</Text>
        )}

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Button
          label={`Upload ${assets.length || ''} Photo${assets.length === 1 ? '' : 's'}`.trim()}
          onPress={upload}
          loading={uploading}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.lg, gap: spacing.md },
  label: { fontSize: 14, fontWeight: '600', color: colors.text },
  typeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  chip: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { fontSize: 13, color: colors.textMuted, fontWeight: '600', textTransform: 'capitalize' },
  chipTextActive: { color: colors.white },
  pickRow: { flexDirection: 'row', gap: spacing.sm },
  flex: { flex: 1 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  thumb: { width: 100, height: 100, borderRadius: 10, backgroundColor: colors.border },
  muted: { color: colors.textMuted },
  error: { color: colors.danger, fontSize: 14 },
});
