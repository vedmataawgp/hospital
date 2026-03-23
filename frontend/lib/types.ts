export interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  role: "patient" | "doctor" | "admin";
  date_of_birth?: string;
  blood_group?: string;
  allergies?: string;
  avatar?: string;
}

export interface Doctor {
  id: number;
  name: string;
  specialization: string;
  experience_years: number;
  rating: number;
  available: boolean;
  patients_count?: number;
  status?: "Active" | "Inactive";
}

export interface Department {
  id: number;
  name: string;
  icon_key: string;
  description: string;
  doctors_count: number;
}

export interface Appointment {
  id: number;
  doctor: string;
  department: string;
  date: string;
  time: string;
  status: "Confirmed" | "Pending" | "Completed" | "Cancelled";
  reason?: string;
  patient?: string;
}

export interface Consultation {
  id: number;
  appointment_id: number;
  doctor: string;
  patient: string;
}

export interface Message {
  id: number;
  from: "doctor" | "patient";
  text: string;
  time: string;
}

export interface Report {
  id: number;
  title: string;
  date: string;
  size_kb: number;
}

export interface Invoice {
  id: string;
  description: string;
  amount: string;
  date: string;
  status: "Paid" | "Pending" | "Overdue";
}

export interface Prescription {
  id: number;
  patient: string;
  medication: string;
  date: string;
}

export interface Patient {
  id: number;
  name: string;
  email?: string;
  age?: number;
  department?: string;
  last_visit?: string;
  condition?: string;
  status?: "Active" | "Inactive";
}

export interface AdminOverview {
  total_patients: number;
  total_doctors: number;
  appointments_today: number;
  monthly_revenue: string;
  patient_growth: { month: string; value: number }[];
  revenue_trend: { month: string; amount: string; value: number }[];
}

export interface PatientDashboardData {
  upcoming_appointments: Appointment[];
  past_appointments: Appointment[];
  reports_count: number;
  notifications_count: number;
}

export interface DoctorDashboardData {
  today_appointments: Appointment[];
  week_appointments_count: number;
  total_patients: number;
}

export interface PaginatedResponse<T> {
  count: number;
  results: T[];
  next?: string | null;
  previous?: string | null;
}

export interface DoctorFilter {
  specialization?: string;
  min_experience?: number;
  available?: boolean;
}

export interface CreateAppointmentPayload {
  department: string;
  doctor_name: string;
  date: string;
  time: string;
  patient_name: string;
  patient_email: string;
  patient_phone: string;
  notes?: string;
}

export interface ContactPayload {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  phone: string;
  password: string;
  role?: "patient";
}

export interface ApiError {
  message: string;
  status?: number;
}
