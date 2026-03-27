"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { 
  LayoutDashboard, 
  Calendar, 
  User, 
  MessageSquare, 
  History, 
  Settings, 
  LogOut, 
  Users, 
  Activity, 
  FileText, 
  ShieldCheck,
  PlusCircle,
  Video
} from "lucide-react";
import { motion } from "framer-motion";

export default function DashboardSidebar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  const menuItems = {
    patient: [
      { name: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" />, path: '/patient/dashboard' },
      { name: 'Appointments', icon: <Calendar className="w-5 h-5" />, path: '/patient/appointments' },
      { name: 'Messages', icon: <MessageSquare className="w-5 h-5" />, path: '/chat' },
      { name: 'Medical History', icon: <History className="w-5 h-5" />, path: '/patient/history' },
      { name: 'Video Call', icon: <Video className="w-5 h-5" />, path: '/video-call' },
      { name: 'Profile', icon: <User className="w-5 h-5" />, path: '/profile' },
    ],
    doctor: [
      { name: 'Overview', icon: <LayoutDashboard className="w-5 h-5" />, path: '/doctor/dashboard' },
      { name: 'Patients', icon: <Users className="w-5 h-5" />, path: '/doctor/patients' },
      { name: 'Schedules', icon: <Calendar className="w-5 h-5" />, path: '/doctor/schedules' },
      { name: 'Messages', icon: <MessageSquare className="w-5 h-5" />, path: '/chat' },
      { name: 'Consultations', icon: <Activity className="w-5 h-5" />, path: '/doctor/consultations' },
    ],
    admin: [
      { name: 'Stats Overview', icon: <LayoutDashboard className="w-5 h-5" />, path: '/admin/dashboard' },
      { name: 'Manage Doctors', icon: <Activity className="w-5 h-5" />, path: '/admin/doctors' },
      { name: 'Manage Patients', icon: <Users className="w-5 h-5" />, path: '/admin/patients' },
      { name: 'Reports', icon: <FileText className="w-5 h-5" />, path: '/admin/reports' },
      { name: 'Security', icon: <ShieldCheck className="w-5 h-5" />, path: '/admin/security' },
    ]
  };

  const currentMenu = menuItems[user?.role || 'patient'];

  return (
    <div className="w-72 bg-white border-r border-slate-100 flex flex-col h-screen fixed sticky top-0 left-0 z-40">
      <div className="p-8">
        <Link href="/" className="flex items-center gap-2 mb-10 group">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-blue-200 group-hover:scale-110 transition-transform">M+</div>
          <span className="text-2xl font-bold tracking-tight text-slate-800">MediCare+</span>
        </Link>
        
        <div className="space-y-1">
          {currentMenu.map((item) => {
            const isActive = pathname === item.path;
            return (
              <Link 
                key={item.path} 
                href={item.path}
                className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-300 font-bold text-sm group ${
                  isActive 
                  ? 'bg-blue-600 text-white shadow-xl shadow-blue-200' 
                  : 'text-slate-500 hover:bg-slate-50 hover:text-blue-600'
                }`}
              >
                <span className={`transition-colors ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-blue-600'}`}>
                  {item.icon}
                </span>
                {item.name}
                {isActive && (
                   <motion.div layoutId="activeInd" className="ml-auto w-1.5 h-1.5 bg-white rounded-full" />
                )}
              </Link>
            );
          })}
        </div>
      </div>

      <div className="mt-auto p-8 border-t border-slate-50">
        <button 
          onClick={logout}
          className="flex items-center gap-3 px-4 py-3.5 w-full rounded-2xl text-slate-500 hover:text-red-600 hover:bg-red-50 transition-all font-bold text-sm"
        >
          <LogOut className="w-5 h-5" /> Logout
        </button>
      </div>
    </div>
  );
}
