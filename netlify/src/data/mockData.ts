export type Role = 'patient' | 'doctor' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar?: string;
  specialty?: string; // For doctors
  patientId?: string; // For patients
}

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  date: string;
  time: string;
  status: 'pending' | 'confirmed' | 'rejected' | 'completed';
  reason: string;
  type: 'consultation' | 'follow-up' | 'checkup';
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: string;
  isRead: boolean;
}

export const mockUsers: User[] = [
  { id: '1', name: 'John Doe', email: 'patient@example.com', role: 'patient', patientId: 'P-101', avatar: 'https://i.pravatar.cc/150?u=1' },
  { id: '2', name: 'Dr. Sarah Wilson', email: 'doctor@example.com', role: 'doctor', specialty: 'Cardiology', avatar: 'https://i.pravatar.cc/150?u=2' },
  { id: '3', name: 'Admin User', email: 'admin@example.com', role: 'admin', avatar: 'https://i.pravatar.cc/150?u=3' },
  { id: '4', name: 'Dr. Michael Chen', email: 'mchen@example.com', role: 'doctor', specialty: 'Neurology', avatar: 'https://i.pravatar.cc/150?u=4' },
  { id: '5', name: 'Dr. Emily Adams', email: 'eadams@example.com', role: 'doctor', specialty: 'Pediatrics', avatar: 'https://i.pravatar.cc/150?u=5' },
];

export const mockAppointments: Appointment[] = [
  {
    id: 'a1',
    patientId: '1',
    patientName: 'John Doe',
    doctorId: '2',
    doctorName: 'Dr. Sarah Wilson',
    date: '2026-03-28',
    time: '10:00 AM',
    status: 'confirmed',
    reason: 'Monthly heart checkup',
    type: 'checkup'
  },
  {
    id: 'a2',
    patientId: '1',
    patientName: 'John Doe',
    doctorId: '4',
    doctorName: 'Dr. Michael Chen',
    date: '2026-04-02',
    time: '02:30 PM',
    status: 'pending',
    reason: 'Persistent headaches',
    type: 'consultation'
  },
];

export const mockMessages: Message[] = [
  { id: 'm1', senderId: '2', receiverId: '1', content: 'Hello John, how are you feeling today?', timestamp: '2026-03-27T10:00:00Z', isRead: true },
  { id: 'm2', senderId: '1', receiverId: '2', content: 'Better, but still a bit dizzy.', timestamp: '2026-03-27T10:05:00Z', isRead: true },
  { id: 'm3', senderId: '2', receiverId: '1', content: 'Make sure to take your meds on time. See you tomorrow.', timestamp: '2026-03-27T10:10:00Z', isRead: false },
];

export const doctorStats = [
  { name: 'Total Patients', value: '1,248', trend: '+12%', icon: 'users' },
  { name: 'Appointments Today', value: '18', trend: '+4', icon: 'calendar' },
  { name: 'Earnings (Monthly)', value: '$12,450', trend: '+8%', icon: 'dollar' },
  { name: 'Patient Rating', value: '4.9/5', trend: 'Stable', icon: 'star' },
];

export const adminStats = [
  { name: 'Total Revenue', value: '$45,280', trend: '+22.5%', icon: 'dollar' },
  { name: 'New Patients', value: '124', trend: '+18%', icon: 'user-plus' },
  { name: 'Doctors Online', value: '15/20', trend: 'Active', icon: 'activity' },
  { name: 'Pending Approvals', value: '8', trend: '-2', icon: 'clock' },
];
