import { api } from './client';
import type {
  ApiEnvelope,
  AppNotification,
  CustomerSignature,
  Job,
  JobDetail,
  JobNote,
  JobStatus,
} from '@/types';

export async function fetchMyJobs(): Promise<Job[]> {
  const { data } = await api.get<ApiEnvelope<Job[]>>('/my-jobs');
  return data.data;
}

export async function fetchJob(jobId: number): Promise<JobDetail> {
  const { data } = await api.get<ApiEnvelope<JobDetail>>(`/jobs/${jobId}`);
  return data.data;
}

export async function updateJobStatus(
  jobId: number,
  status: JobStatus,
  notes?: string,
): Promise<JobDetail> {
  const { data } = await api.put<ApiEnvelope<JobDetail>>(`/jobs/${jobId}/status`, { status, notes });
  return data.data;
}

export interface GpsPayload {
  latitude: number;
  longitude: number;
  accuracy?: number | null;
  altitude?: number | null;
  speed?: number | null;
  log_type: 'check_in' | 'location' | 'completion';
  logged_at: string;
  notes?: string;
}

export async function logGps(jobId: number, payload: GpsPayload): Promise<void> {
  await api.post(`/jobs/${jobId}/gps`, payload);
}

export interface PhotoAsset {
  uri: string;
  fileName?: string | null;
  mimeType?: string | null;
}

export async function uploadPhotos(
  jobId: number,
  assets: PhotoAsset[],
  photoType: 'before' | 'after' | 'progress' | 'other',
  caption?: string,
): Promise<void> {

  const form = new FormData();

  form.append('photo_type', photoType);

  if (caption) {
    form.append('caption', caption);
  }

  assets.forEach((asset, index) => {
    console.log('UPLOAD ASSET:', {
      uri: asset.uri,
      fileName: asset.fileName,
      mimeType: asset.mimeType,
    });

    form.append('photos[]', {
      uri: asset.uri,
      name: asset.fileName ?? `photo_${index}.jpg`,
      type: asset.mimeType ?? 'image/jpeg',
    } as any);
  });

  await api.post(`/jobs/${jobId}/photos`, form, {
    headers: {
      Accept: 'application/json',
    },
  });
}

export async function addNote(jobId: number, note: string): Promise<JobNote> {
  const { data } = await api.post<ApiEnvelope<JobNote>>(`/jobs/${jobId}/notes`, {
    note,
    is_private: true,
    is_customer_visible: false,
  });
  return data.data;
}

export async function fetchSignature(jobId: number): Promise<CustomerSignature | null> {
  const { data } = await api.get<ApiEnvelope<CustomerSignature | []>>(`/jobs/${jobId}/signature`);
  // The API returns an empty array/object when no signature exists.
  const sig = data.data;
  return sig && !Array.isArray(sig) && 'id' in sig ? (sig as CustomerSignature) : null;
}

export async function captureSignature(
  jobId: number,
  customerName: string,
  signatureData: string,
): Promise<CustomerSignature> {
  const { data } = await api.post<ApiEnvelope<CustomerSignature>>(`/jobs/${jobId}/signature`, {
    customer_name: customerName,
    signature_data: signatureData,
  });
  return data.data;
}

export async function fetchNotifications(): Promise<AppNotification[]> {
  const { data } = await api.get<ApiEnvelope<AppNotification[]>>('/notifications');
  return data.data;
}
