"use client";

import { useAuth } from "@/context/AuthContext";
import DashboardSidebar from "@/components/DashboardSidebar";
import DashboardHeader from "@/components/DashboardHeader";
import { mockAppointments, Appointment, doctorStats } from "@/data/mockData";
import { 
  Users, 
  Calendar, 
  Clock, 
  Check, 
  X, 
  TrendingUp, 
  ArrowUpRight, 
  Search,
  ChevronRight,
  MoreVertical,
  Activity,
  MessageSquare
} from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";

export default function DoctorDashboard() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>(mockAppointments);

  const handleStatusChange = (id: string, newStatus: Appointment['status']) => {
    setAppointments(appointments.map(apt => apt.id === id ? { ...apt, status: newStatus } : apt));
  };

  const getStatusColor = (status: Appointment['status']) => {
    switch (status) {
      case 'confirmed': return 'text-green-600 bg-green-50 border-green-100';
      case 'rejected': return 'text-red-600 bg-red-50 border-red-100';
      case 'pending': return 'text-amber-600 bg-amber-50 border-amber-100';
      case 'completed': return 'text-blue-600 bg-blue-50 border-blue-100';
      default: return 'text-slate-600 bg-slate-50 border-slate-100';
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50/50">
      <DashboardSidebar />
      <div className="flex-1 flex flex-col">
        <DashboardHeader />
        <main className="p-10">
          <div className="flex justify-between items-end mb-10">
            <div>
              <p className="text-sm font-bold text-indigo-600 uppercase tracking-widest leading-none mb-3">Welcome, {user?.name.split(' ')[0]} {user?.name.split(' ')[1]}</p>
              <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Practice Overview</h1>
            </div>
            <div className="flex gap-4">
               <button className="bg-white hover:bg-slate-50 text-slate-700 px-6 py-3.5 rounded-2xl font-bold border border-slate-200 flex items-center gap-2 transition-all hover:-translate-y-1 active:scale-95">
                  <Calendar className="w-5 h-5" /> Schedule Sync
               </button>
               <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3.5 rounded-2xl font-bold flex items-center gap-2 shadow-xl shadow-indigo-200 transition-all hover:-translate-y-1 active:scale-95">
                  <Clock className="w-5 h-5" /> Start Consultation
               </button>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {doctorStats.map((stat, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all group relative overflow-hidden"
              >
                <div className="flex justify-between items-start mb-4">
                   <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300">
                      {stat.icon === 'users' && <Users className="w-6 h-6"/>}
                      {stat.icon === 'calendar' && <Calendar className="w-6 h-6"/>}
                      {stat.icon === 'dollar' && <TrendingUp className="w-6 h-6"/>}
                      {stat.icon === 'star' && <Activity className="w-6 h-6"/>}
                   </div>
                   <div className="flex items-center gap-1 text-[10px] font-black text-green-600 bg-green-50 px-2 py-0.5 rounded uppercase tracking-tighter">
                      {stat.trend} <ArrowUpRight className="w-2.5 h-2.5" />
                   </div>
                </div>
                <p className="text-slate-500 font-bold text-xs uppercase tracking-widest leading-none mb-1.5">{stat.name}</p>
                <h4 className="text-3xl font-black text-slate-900 leading-none">{stat.value}</h4>
              </motion.div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Appointments Requests */}
            <div className="lg:col-span-2">
               <div className="flex justify-between items-center mb-6 px-2">
                  <h3 className="text-xl font-extrabold text-slate-800">Pending Requests</h3>
                  <div className="flex items-center gap-4">
                     <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input type="text" placeholder="Search a patient..." className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-600 transition-all" />
                     </div>
                     <button className="text-sm font-bold text-indigo-600 hover:underline">View History</button>
                  </div>
               </div>
               
               <div className="space-y-4">
                  {appointments.map((apt, i) => (
                    <motion.div 
                      key={apt.id}
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.4 + (i * 0.1) }}
                      className="bg-white p-6 rounded-[2.5rem] border border-slate-100 flex items-center gap-6 group hover:shadow-xl transition-all"
                    >
                       <img src={i % 2 === 0 ? "https://i.pravatar.cc/100?u=12" : "https://i.pravatar.cc/100?u=34"} className="w-16 h-16 rounded-2xl object-cover shrink-0 shadow-sm" alt="patient avatar" />
                       <div className="flex-1">
                          <h4 className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{apt.patientName}</h4>
                          <p className="text-xs text-slate-500 mt-1 font-medium">{apt.type} • {apt.reason}</p>
                          <div className="flex items-center gap-4 mt-3">
                             <span className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-slate-400">
                                <Calendar className="w-3.5 h-3.5" /> {apt.date}
                             </span>
                             <span className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-slate-400">
                                <Clock className="w-3.5 h-3.5" /> {apt.time}
                             </span>
                          </div>
                       </div>
                       <div className="flex items-center gap-2">
                          {apt.status === 'pending' ? (
                            <>
                               <button 
                                 onClick={() => handleStatusChange(apt.id, 'confirmed')}
                                 className="h-12 w-12 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-100 hover:scale-105 active:scale-95 transition-all"
                               >
                                  <Check className="w-5 h-5" />
                               </button>
                               <button 
                                 onClick={() => handleStatusChange(apt.id, 'rejected')}
                                 className="h-12 w-12 rounded-xl bg-white text-slate-400 border border-slate-100 hover:text-red-600 hover:bg-red-50 hover:border-red-100 hover:scale-105 active:scale-95 transition-all"
                               >
                                  <X className="w-5 h-5" />
                               </button>
                            </>
                          ) : (
                             <span className={`px-4 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all ${getStatusColor(apt.status)}`}>
                                {apt.status}
                             </span>
                          )}
                          <button className="h-12 w-12 rounded-xl bg-slate-50 text-slate-400 flex items-center justify-center hover:bg-indigo-50 hover:text-indigo-600 transition-all border border-transparent hover:border-indigo-100">
                             <MoreVertical className="w-5 h-5" />
                          </button>
                       </div>
                    </motion.div>
                  ))}
               </div>
            </div>

            {/* Sidebar section */}
            <div className="space-y-8">
               <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm relative overflow-hidden">
                  <h4 className="text-xl font-bold mb-8 text-slate-800 underline decoration-indigo-500 decoration-4 underline-offset-8">Active Patients</h4>
                  <div className="space-y-6">
                     {[
                       { name: "Emily Watson", lastVisit: "2h ago", status: "In-Waiting", color: "bg-blue-500", avatar: "https://i.pravatar.cc/100?u=5" },
                       { name: "John Smith", lastVisit: "Yesterday", status: "Critical", color: "bg-rose-500", avatar: "https://i.pravatar.cc/100?u=7" },
                       { name: "Sarah Connor", lastVisit: "Mar 25", status: "Stable", color: "bg-green-500", avatar: "https://i.pravatar.cc/100?u=9" },
                     ].map((p, i) => (
                       <div key={i} className="flex items-center gap-4 group cursor-pointer hover:bg-slate-50 p-2 rounded-2xl transition-all -m-2">
                          <img src={p.avatar} className="w-12 h-12 rounded-2xl object-cover ring-2 ring-white shadow-md group-hover:scale-110 transition-transform" />
                          <div className="flex-1">
                             <p className="text-sm font-bold text-slate-800 group-hover:text-indigo-600 transition-colors leading-none mb-1">{p.name}</p>
                             <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{p.lastVisit}</p>
                          </div>
                          <div className={`px-2 py-0.5 rounded text-[8px] font-black text-white uppercase tracking-tighter ${p.color}`}>{p.status}</div>
                       </div>
                     ))}
                  </div>
                  <button className="w-full mt-10 py-4 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-2xl font-black text-xs uppercase tracking-widest transition-all">
                     Open Patient Directory
                  </button>
               </div>

               <div className="bg-indigo-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden group/card shadow-2xl shadow-indigo-900/40">
                  <div className="relative z-10 flex flex-col h-full">
                     <div className="h-12 w-12 bg-white/10 rounded-2xl flex items-center justify-center mb-6 group-hover/card:rotate-12 transition-transform">
                        <MessageSquare className="w-6 h-6 text-indigo-100" />
                     </div>
                     <h4 className="text-xl font-bold mb-2">Connect with Staff</h4>
                     <p className="text-indigo-200/60 text-sm mb-8 leading-relaxed italic">Real-time internal messaging with other specialists and administrators.</p>
                     <button className="mt-auto px-6 py-4 bg-indigo-600 hover:bg-white hover:text-indigo-900 border border-indigo-400/30 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all active:scale-95 shadow-lg">
                        Go to Chats
                     </button>
                  </div>
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl"></div>
               </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
