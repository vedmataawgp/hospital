"use client";

import { useAuth } from "@/context/AuthContext";
import DashboardSidebar from "@/components/DashboardSidebar";
import DashboardHeader from "@/components/DashboardHeader";
import { mockAppointments, Appointment } from "@/data/mockData";
import { 
  Calendar, 
  Clock, 
  User, 
  Plus, 
  ChevronRight, 
  FileText, 
  Activity, 
  Heart, 
  AlertCircle 
} from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function PatientDashboard() {
  const { user } = useAuth();
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [appointments, setAppointments] = useState<Appointment[]>(mockAppointments);

  const stats = [
    { name: 'Last Visit', value: 'Mar 15, 2026', icon: <Calendar className="w-5 h-5 text-blue-600" />, color: "bg-blue-50" },
    { name: 'Reports', value: '12 Available', icon: <FileText className="w-5 h-5 text-indigo-600" />, color: "bg-indigo-50" },
    { name: 'Health Score', value: '92/100', icon: <Activity className="w-5 h-5 text-emerald-600" />, color: "bg-emerald-50" },
    { name: 'Next Appt.', value: 'Tomorrrow', icon: <Clock className="w-5 h-5 text-amber-600" />, color: "bg-amber-50" },
  ];

  return (
    <div className="flex min-h-screen bg-slate-50/50">
      <DashboardSidebar />
      <div className="flex-1 flex flex-col">
        <DashboardHeader />
        <main className="p-10">
          <div className="flex justify-between items-end mb-10">
            <div>
              <p className="text-sm font-bold text-blue-600 uppercase tracking-widest leading-none mb-3">Welcome Back, {user?.name.split(' ')[0]}!</p>
              <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Health Overview</h1>
            </div>
            <button 
               onClick={() => setShowBookingModal(true)}
               className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3.5 rounded-2xl font-bold flex items-center gap-2 shadow-xl shadow-blue-200 transition-all hover:-translate-y-1 active:scale-95"
            >
               <Plus className="w-5 h-5" /> Book Appointment
            </button>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            {stats.map((stat, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all group"
              >
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110 ${stat.color}`}>
                  {stat.icon}
                </div>
                <p className="text-slate-500 font-bold text-xs uppercase tracking-widest">{stat.name}</p>
                <h4 className="text-2xl font-extrabold text-slate-900 mt-1">{stat.value}</h4>
              </motion.div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Appointments List */}
            <div className="lg:col-span-2 space-y-6">
               <div className="flex justify-between items-center px-2">
                  <h3 className="text-xl font-extrabold text-slate-800">Upcoming Appointments</h3>
                  <button className="text-sm font-bold text-blue-600 hover:underline">View All</button>
               </div>
               
               <div className="space-y-4">
                  {appointments.slice(0, 3).map((apt, i) => (
                    <motion.div 
                      key={apt.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 + 0.4 }}
                      className="bg-white p-6 rounded-[2.5rem] border border-slate-100 flex items-center gap-6 group hover:shadow-lg transition-all"
                    >
                       <div className="w-20 h-20 rounded-full bg-slate-50 flex flex-col items-center justify-center border border-slate-100 group-hover:bg-blue-50 transition-colors">
                          <span className="text-xs font-bold text-slate-400 uppercase tracking-tighter">{apt.date.split(' ')[0]}</span>
                          <span className="text-2xl font-black text-slate-800 leading-none">{apt.date.split('-')[2]}</span>
                       </div>
                       <div className="flex-1">
                          <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1">{apt.type}</p>
                          <h4 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{apt.doctorName}</h4>
                          <p className="text-sm text-slate-500 font-medium flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {apt.time}</p>
                       </div>
                       <div className="flex items-center gap-4">
                          <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border transition-colors ${
                             apt.status === 'confirmed' ? 'bg-green-50 text-green-700 border-green-100' : 'bg-amber-50 text-amber-700 border-amber-100'
                          }`}>
                            {apt.status}
                          </span>
                          <button className="p-3 bg-slate-50 text-slate-400 rounded-xl hover:bg-blue-50 hover:text-blue-600 transition-all border border-transparent hover:border-blue-100 group">
                             <ChevronRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                          </button>
                       </div>
                    </motion.div>
                  ))}
               </div>
            </div>

            {/* Sidebar Cards */}
            <div className="space-y-8">
               <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden">
                  <div className="relative z-10">
                     <h4 className="text-xl font-bold mb-4 flex items-center gap-2 underline decoration-blue-500 decoration-4 underline-offset-4">Emergency Contact</h4>
                     <p className="text-white/60 text-sm mb-6 font-medium leading-relaxed">Instantly alert your primary healthcare provider or local emergency services.</p>
                     <button className="w-full py-4 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-red-900/20 active:scale-95 transition-all">
                        Alert Doctor Now
                     </button>
                  </div>
                  <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/5 rounded-full blur-3xl"></div>
               </div>

               <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm relative overflow-hidden">
                  <h4 className="text-xl font-bold mb-6 text-slate-800">Your Health Stats</h4>
                  <div className="space-y-6">
                     {[
                       { name: "Blood Pressure", val: "120/80 mmHg", color: "bg-rose-500" },
                       { name: "Heart Rate", val: "72 BPM", color: "bg-blue-500" },
                       { name: "Sugar Level", val: "95 mg/dL", color: "bg-amber-500" },
                     ].map((s, i) => (
                       <div key={i} className="space-y-2">
                          <div className="flex justify-between text-xs font-black uppercase tracking-tighter">
                             <span className="text-slate-400">{s.name}</span>
                             <span className="text-slate-900">{s.val}</span>
                          </div>
                          <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                             <motion.div 
                               initial={{ width: 0 }}
                               animate={{ width: "70%" }}
                               transition={{ delay: 1 + (i * 0.1), duration: 1 }}
                               className={`h-full rounded-full ${s.color}`}
                             ></motion.div>
                          </div>
                       </div>
                     ))}
                  </div>
                  <button className="w-full mt-8 py-3.5 bg-slate-50 hover:bg-blue-50 text-slate-500 hover:text-blue-600 border border-slate-100 hover:border-blue-100 rounded-2xl font-bold text-xs uppercase tracking-widest transition-all">
                     View Reports
                  </button>
               </div>
            </div>
          </div>
        </main>
      </div>

      {/* Booking Modal */}
      <AnimatePresence>
        {showBookingModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setShowBookingModal(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            ></motion.div>
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-xl bg-white rounded-[3rem] p-10 overflow-hidden shadow-2xl"
            >
               <div className="flex justify-between items-center mb-10">
                  <h3 className="text-3xl font-extrabold text-slate-900">Book Appointment</h3>
                  <button onClick={() => setShowBookingModal(false)} className="p-2 hover:bg-slate-100 rounded-xl transition-colors"><Plus className="w-6 h-6 rotate-45" /></button>
               </div>
               
               <form className="space-y-8" onSubmit={(e) => { e.preventDefault(); setShowBookingModal(false); alert('Appointment request sent successfully!'); }}>
                  <div className="grid grid-cols-2 gap-6">
                     <div className="space-y-2">
                        <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Specialty</label>
                        <select className="w-full p-4 rounded-2xl border border-slate-100 bg-slate-50 font-bold focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-600 transition-all">
                           <option>Cardiology</option>
                           <option>Neurology</option>
                           <option>Pediatrics</option>
                        </select>
                     </div>
                     <div className="space-y-2">
                        <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Doctor</label>
                        <select className="w-full p-4 rounded-2xl border border-slate-100 bg-slate-50 font-bold focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-600 transition-all">
                           <option>Dr. Sarah Wilson</option>
                           <option>Dr. Michael Chen</option>
                        </select>
                     </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                     <div className="space-y-2">
                        <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Preferred Date</label>
                        <input type="date" className="w-full p-4 rounded-2xl border border-slate-100 bg-slate-50 font-bold focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-600 transition-all" />
                     </div>
                     <div className="space-y-2">
                        <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Preferred Time</label>
                        <select className="w-full p-4 rounded-2xl border border-slate-100 bg-slate-50 font-bold focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-600 transition-all">
                           <option>09:00 AM</option>
                           <option>11:00 AM</option>
                           <option>02:00 PM</option>
                        </select>
                     </div>
                  </div>

                  <div className="space-y-2">
                     <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Reason for Visit</label>
                     <textarea rows={3} placeholder="Describe your symptoms..." className="w-full p-4 rounded-2xl border border-slate-100 bg-slate-50 font-medium focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-600 transition-all"></textarea>
                  </div>

                  <button type="submit" className="w-full py-5 bg-blue-600 hover:bg-blue-700 text-white rounded-[1.5rem] font-extrabold text-lg shadow-xl shadow-blue-200 transition-all hover:-translate-y-1 active:scale-95">
                     Confirm Booking Request
                  </button>
               </form>

               {/* Design element */}
               <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full blur-3xl -z-10 -translate-y-1/2 translate-x-1/2"></div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
