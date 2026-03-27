"use client";

import { useAuth } from "@/context/AuthContext";
import DashboardSidebar from "@/components/DashboardSidebar";
import DashboardHeader from "@/components/DashboardHeader";
import { 
  Calendar, 
  MapPin, 
  Clock, 
  Bell, 
  Plus, 
  Search, 
  ChevronRight, 
  Settings,
  BriefcaseMedical,
  Stethoscope,
  Heart
} from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function AppointmentsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'upcoming' | 'pending' | 'completed'>('upcoming');

  const appointments = [
    { id: 1, date: "Mar 28, 2026", time: "10:00 AM", doctor: "Dr. Sarah Wilson", specialty: "Cardiology", type: "Regular Checkup", status: "confirmed", color: "bg-blue-600", icon: <Heart className="w-5 h-5"/> },
    { id: 2, date: "Apr 02, 2026", time: "02:30 PM", doctor: "Dr. Michael Chen", specialty: "Neurology", type: "First Consultation", status: "pending", color: "bg-indigo-600", icon: <BriefcaseMedical className="w-5 h-5"/> },
    { id: 3, date: "Apr 15, 2026", time: "09:00 AM", doctor: "Dr. Emily Adams", specialty: "Pediatrics", type: "Vaccination", status: "confirmed", color: "bg-emerald-600", icon: <Stethoscope className="w-5 h-5"/> },
  ];

  return (
    <div className="flex min-h-screen bg-slate-50/50">
      <DashboardSidebar />
      <div className="flex-1 flex flex-col">
        <DashboardHeader />
        <main className="p-10">
          <div className="flex justify-between items-end mb-10">
            <div>
              <p className="text-sm font-bold text-blue-600 uppercase tracking-widest leading-none mb-3">Scheduling System</p>
              <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Manage Appointments</h1>
            </div>
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-200 transition-all hover:-translate-y-1 active:scale-95 flex items-center gap-2">
               <Plus className="w-4 h-4" /> Book New Session
            </button>
          </div>

          <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden">
             <div className="p-8 border-b border-slate-50 flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="flex gap-4 p-1.5 bg-slate-50 rounded-2xl border border-slate-100">
                    {(['upcoming', 'pending', 'completed'] as const).map(tab => (
                        <button 
                          key={tab} 
                          onClick={() => setActiveTab(tab)}
                          className={`px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-blue-600'}`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
                <div className="relative w-full md:w-80 overflow-hidden">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input type="text" placeholder="Search by physician..." className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-600 transition-all font-bold text-sm" />
                </div>
             </div>

             <div className="p-8 space-y-6">
                {appointments.filter(a => activeTab === 'upcoming' ? a.status === 'confirmed' : a.status === activeTab).map((appt, i) => (
                   <motion.div 
                     key={appt.id}
                     initial={{ opacity: 0, y: 10 }}
                     animate={{ opacity: 1, y: 0 }}
                     transition={{ delay: i * 0.1 }}
                     className="bg-white p-8 rounded-[2.5rem] border border-slate-50 flex flex-col lg:flex-row items-center gap-8 group hover:shadow-xl transition-all border-b-4 border-b-transparent hover:border-b-blue-600"
                   >
                      <div className={`w-20 h-20 rounded-[2.5rem] ${appt.color} text-white flex flex-col items-center justify-center ring-8 ring-slate-50 shadow-xl group-hover:scale-110 transition-transform duration-500`}>
                         <span className="text-[10px] font-black uppercase tracking-tighter opacity-60 mb-1">{appt.date.split(',')[1].split(' ')[1]}</span>
                         <span className="text-2xl font-black leading-none">{appt.date.split(' ')[1].replace(',', '')}</span>
                      </div>
                      
                      <div className="flex-1 text-center lg:text-left">
                         <div className="flex flex-col lg:flex-row lg:items-center gap-2 mb-2 justify-center lg:justify-start">
                            <h4 className="text-xl font-black text-slate-800 leading-none group-hover:text-blue-600 transition-colors">{appt.doctor}</h4>
                            <span className="bg-blue-50 text-blue-600 text-[10px] font-black uppercase px-2 py-0.5 rounded-full inline-block w-fit mx-auto lg:mx-0 truncate">{appt.specialty}</span>
                         </div>
                         <div className="flex flex-wrap items-center gap-6 text-slate-400 font-bold text-xs uppercase tracking-widest justify-center lg:justify-start">
                            <p className="flex items-center gap-2"><Clock className="w-4 h-4 text-blue-500" /> {appt.time}</p>
                            <p className="flex items-center gap-2"><MapPin className="w-4 h-4 text-emerald-500" /> Medical Center Wing B</p>
                            <p className="flex items-center gap-2 text-slate-800"><BriefcaseMedical className="w-4 h-4 text-purple-500" /> {appt.type}</p>
                         </div>
                      </div>

                      <div className="flex items-center gap-4">
                         <div className="flex flex-col items-end mr-4">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 leading-none">Status Level 4</span>
                            <span className={`px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-transparent shadow-sm ${
                               appt.status === 'confirmed' ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'
                            }`}>
                               {appt.status}
                            </span>
                         </div>
                         <button className="h-14 w-14 rounded-2xl bg-slate-50 text-slate-400 flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all border border-transparent hover:border-blue-100 hover:shadow-lg shadow-blue-900/10">
                            <ChevronRight className="w-6 h-6" />
                         </button>
                      </div>
                   </motion.div>
                ))}
             </div>

             <div className="p-10 bg-gradient-to-br from-blue-600 to-indigo-700 m-8 rounded-[3rem] text-white overflow-hidden relative group">
                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-10">
                   <div className="max-w-md">
                      <div className="inline-flex items-center gap-2 py-1.5 px-3 rounded-full bg-white/10 text-white text-[10px] font-black uppercase tracking-widest border border-white/10 mb-6 group-hover:bg-white/20 transition-colors">
                         <Bell className="w-3.5 h-3.5" /> SMS Alerts Active
                      </div>
                      <h3 className="text-3xl font-black mb-4 leading-tight">Need to reschedule or cancel?</h3>
                      <p className="text-blue-100 text-sm italic font-medium opacity-80 leading-relaxed">Changes can be made up to 24 hours before your session. Contact support for emergency rescheduling.</p>
                   </div>
                   <button className="bg-white text-blue-600 px-10 py-5 rounded-3xl font-black text-xs uppercase tracking-widest shadow-2xl hover:scale-105 active:scale-95 transition-transform">
                      Modify Existing Sessions
                   </button>
                </div>
                {/* Design elements */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-black/10 rounded-full blur-3xl"></div>
             </div>
          </div>
        </main>
      </div>
    </div>
  );
}
