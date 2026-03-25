/* ── User ──────────────────────────────────────────────────────────────── */
export interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  role: "patient" | "doctor" | "admin";
  avatar_url?: string | null;
  created_at?: string;
  date_of_birth?: string;
  blood_group?: string;
  allergies?: string;
}

/* ── Doctor ────────────────────────────────────────────────────────────── */
export interface Doctor {
  id: number;
  userId?: number;
  name: string;
  email?: string;
  specialization: string;
  experience?: number;
  experience_years?: number;
  rating?: number;
  available?: boolean;
  patients_count?: number;
  status?: "Active" | "Inactive";
  phone?: string;
  bio?: string;
  availability?: unknown;
  createdAt?: string;
}

/* ── Department ────────────────────────────────────────────────────────── */
export interface Department {
  id: number;
  name: string;
  icon_key?: string;
  description?: string;
  doctors_count?: number;
}

/* ── Appointment ───────────────────────────────────────────────────────── */
export interface Appointment {
  id: number;
  patientId?: number;
  doctorId?: number;
  patientName?: string;
  doctorName?: string;
  doctorSpecialization?: string;
  date: string;
  time: string;
  status: "pending" | "confirmed" | "completed" | "cancelled" | "Pending" | "Confirmed" | "Completed" | "Cancelled";
  notes?: string;
  reason?: string;
  createdAt?: string;
}

/* ── Consultation ──────────────────────────────────────────────────────── */
export interface Consultation {
  id: number;
  appointment_id?: number;
  doctor?: string;
  patient?: string;
}

/* ── Message ───────────────────────────────────────────────────────────── */
export interface Message {
  id: number;
  from?: "doctor" | "patient";
  text?: string;
  time?: string;
  sender?: number;
  sender_name?: string;
  sender_role?: string;
  message_type?: string;
  is_read?: boolean;
  created_at?: string;
}

/* ── Report ────────────────────────────────────────────────────────────── */
export interface Report {
  id: number;
  title: string;
  date?: string;
  size_kb?: number;
  file_url?: string;
  fileUrl?: string;
  reportType?: string;
  description?: string;
  createdAt?: string;
}

/* ── Invoice ───────────────────────────────────────────────────────────── */
export interface Invoice {
  id: string | number;
  description?: string;
  amount?: string | number;
  date?: string;
  createdAt?: string;
  status?: "Paid" | "Pending" | "Overdue" | "paid" | "pending" | "overdue";
  total?: number;
  paymentMethod?: string;
  paidAt?: string;
}

/* ── Prescription ──────────────────────────────────────────────────────── */
export interface Prescription {
  id: number;
  patient?: string;
  patient_id?: number;
  patient_name?: string;
  medication?: string;
  notes?: string;
  diagnosis?: string;
  date?: string;
  created_at?: string;
  doctor_name?: string;
}

/* ── Patient ───────────────────────────────────────────────────────────── */
export interface Patient {
  id: number;
  userId?: number;
  name: string;
  email?: string;
  age?: number;
  gender?: string;
  phone?: string;
  address?: string;
  bloodGroup?: string;
  department?: string;
  last_visit?: string;
  condition?: string;
  status?: "Active" | "Inactive";
  createdAt?: string;
}

/* ── Admin overview ────────────────────────────────────────────────────── */
export interface AdminOverview {
  totalPatients?: number;
  totalDoctors?: number;
  totalAppointments?: number;
  pendingAppointments?: number;
  confirmedAppointments?: number;
  totalRevenue?: number;
  pendingBilling?: number;
  recentAppointments?: Appointment[];
  recentPatients?: Patient[];
  /* legacy snake_case aliases (kept for backwards compat) */
  total_patients?: number;
  total_doctors?: number;
  appointments_today?: number;
  monthly_revenue?: string;
  patient_growth?: { month: string; value: number }[];
  revenue_trend?: { month: string; amount: string; value: number }[];
}

/* ── Patient dashboard data ────────────────────────────────────────────── */
export interface PatientDashboardData {
  totalAppointments?: number;
  upcomingAppointments?: number;
  completedAppointments?: number;
  pendingBills?: number;
  totalReports?: number;
  recentAppointments?: Appointment[];
  upcomingList?: Appointment[];
  patient?: Patient;
  /* legacy */
  upcoming_appointments?: Appointment[];
  past_appointments?: Appointment[];
  reports_count?: number;
  notifications_count?: number;
}

/* ── Doctor dashboard data ─────────────────────────────────────────────── */
export interface DoctorDashboardData {
  totalPatients?: number;
  todayAppointments?: number;
  pendingAppointments?: number;
  completedAppointments?: number;
  recentAppointments?: Appointment[];
  doctor?: Doctor;
  /* legacy */
  today_appointments?: Appointment[];
  week_appointments_count?: number;
  total_patients?: number;
}

/* ── Paginated response ─────────────────────────────────────────────────── */
export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

/* ── Doctor filter ─────────────────────────────────────────────────────── */
export interface DoctorFilter {
  specialization?: string;
  min_experience?: number;
  available?: boolean;
  search?: string;
}

/* ── Create appointment payload ────────────────────────────────────────── */
export interface CreateAppointmentPayload {
  doctorId: number;
  date: string;
  time: string;
  notes?: string;
}

/* ── Contact payload ───────────────────────────────────────────────────── */
export interface ContactPayload {
  name: string;
  email: string;
  subject: string;
  message: string;
}

/* ── Register payload ──────────────────────────────────────────────────── */
export interface RegisterPayload {
  name: string;
  email: string;
  phone?: string;
  password: string;
  role?: "patient" | "doctor";
}

/* ── API error ─────────────────────────────────────────────────────────── */
export interface ApiError {
  message: string;
  status?: number;
}
