export type JobStatus =
  | 'pending'
  | 'assigned'
  | 'in_progress'
  | 'on_hold'
  | 'completed'
  | 'cancelled';

export type Role = 'admin' | 'manager' | 'technician';

/** Every API response is wrapped in this envelope. */
export interface ApiEnvelope<T> {
  data: T;
  message: string;
}

export interface Company {
  id: number;
  name: string;
  email?: string | null;
  phone?: string | null;
  timezone?: string | null;
  currency?: string | null;
}

export interface User {
  id: number;
  company_id: number;
  name: string;
  email: string;
  role: Role;
  phone?: string | null;
  is_active: boolean;
  last_seen_at?: string | null;
  company?: Company | null;
}

export interface JobPhoto {
  id: number;
  job_id: number;
  user_id: number;
  photo_type: 'before' | 'after' | 'progress' | 'other';
  url: string | null;
  caption?: string | null;
  created_at?: string | null;
}

export interface JobNote {
  id: number;
  job_id: number;
  note: string;
  is_private: boolean;
  is_customer_visible: boolean;
  user?: { id: number; name: string } | null;
  created_at?: string | null;
}

export interface GpsLog {
  id: number;
  job_id: number;
  latitude: number;
  longitude: number;
  accuracy?: number | null;
  log_type: 'check_in' | 'location' | 'completion';
  logged_at?: string | null;
}

export interface CustomerSignature {
  id: number;
  job_id: number;
  customer_name: string;
  url: string | null;
  signed_at?: string | null;
}

export interface JobStatusHistory {
  id: number;
  status: JobStatus;
  previous_status?: JobStatus | null;
  notes?: string | null;
  changed_by?: { id: number; name: string } | null;
  created_at?: string | null;
}

export interface Job {
  id: number;
  company_id: number;
  job_number: string;
  title: string;
  description?: string | null;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  job_type: string;
  status: JobStatus;
  customer_name: string;
  customer_email?: string | null;
  customer_phone?: string | null;
  service_address: string;
  service_city?: string | null;
  service_state?: string | null;
  service_postal?: string | null;
  service_latitude?: number | string | null;
  service_longitude?: number | string | null;
  scheduled_start?: string | null;
  scheduled_end?: string | null;
  actual_start?: string | null;
  actual_end?: string | null;
  requires_signature: boolean;
  completed_at?: string | null;
}

export interface JobDetail extends Job {
  photos: JobPhoto[];
  notes: JobNote[];
  gps_logs: GpsLog[];
  status_history: JobStatusHistory[];
  signature?: CustomerSignature | null;
}

export interface AppNotification {
  id: string;
  type: string;
  data: Record<string, unknown>;
  read_at?: string | null;
  created_at?: string | null;
}
