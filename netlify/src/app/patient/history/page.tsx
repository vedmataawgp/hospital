"use client";

import { useAuth } from "@/context/AuthContext";
import DashboardSidebar from "@/components/DashboardSidebar";
import DashboardHeader from "@/components/DashboardHeader";
import { 
  FileText, 
  Download, 
  Eye, 
  Search, 
  Filter, 
  Calendar, 
  Plus,
  ArrowUpRight,
  Stethoscope,
  Activity,
  Heart
} from "lucide-react";
import { motion } from "framer-motion";

export default function PatientHistoryPage() {
  const { user } = useAuth();

  const history = [
    { date: "Mar 15, 2026", type: "Cardiology", doctor: "Dr. Sarah Wilson", report: "Normal", color: "bg-blue-50 text-blue-600", icon: <Heart className="w-5 h-5"/> },
    { date: "Feb 10, 2026", type: "General Checkup", doctor: "Dr. Michael Chen", report: "Follow-up required", color: "bg-amber-50 text-amber-600", icon: <Activity className="w-5 h-5"/> },
    { date: "Jan 05, 2026", type: "Blood Test", doctor: "Lab Diagnostics", report: "Attached", color: "bg-emerald-50 text-emerald-600", icon: <FileText className="w-5 h-5"/> },
    { date: "Dec 12, 2025", type: "Neurology", doctor: "Dr. Emily Adams", report: "Clear", color: "bg-purple-50 text-purple-600", icon: <Stethoscope className="w-5 h-5"/> },
  ];

  return (
    <div className="flex min-h-screen bg-slate-50/50">
      <DashboardSidebar />
      <div className="flex-1 flex flex-col">
        <DashboardHeader />
        <main className="p-10">
          <div className="flex justify-between items-end mb-10">
            <div>
              <p className="text-sm font-bold text-blue-600 uppercase tracking-widest leading-none mb-3">Medical Records</p>
              <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Health History</h1>
            </div>
            <button className="bg-white border border-slate-200 text-slate-700 px-6 py-3.5 rounded-2xl font-bold flex items-center gap-2 hover:bg-slate-50 transition-all shadow-sm active:scale-95">
               <Download className="w-5 h-5" /> Export All Records
            </button>
          </div>

          <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden">
             <div className="p-8 border-b border-slate-50 flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="relative w-full md:w-96 group">
                   <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                   <input type="text" placeholder="Search by doctor or treatment..." className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-600 transition-all font-bold text-sm" />
                </div>
                <div className="flex items-center gap-4 w-full md:w-auto">
                   <button className="flex-1 md:flex-none px-6 py-3.5 bg-slate-50 text-slate-500 border border-slate-100 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-white transition-all"><Filter className="w-4 h-4" /> Filter</button>
                   <button className="flex-1 md:flex-none px-6 py-3.5 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-blue-100 hover:scale-105 transition-all"><Plus className="w-4 h-4" /> Add Record</button>
                </div>
             </div>

             <div className="overflow-x-auto">
                <table className="w-full">
                   <thead>
                      <tr className="text-left bg-slate-50/50">
                         <th className="py-6 px-10 text-[10px] font-black uppercase tracking-widest text-slate-400">Date & Treatment</th>
                         <th className="py-6 px-10 text-[10px] font-black uppercase tracking-widest text-slate-400">Physician</th>
                         <th className="py-6 px-10 text-[10px] font-black uppercase tracking-widest text-slate-400">Status</th>
                         <th className="py-6 px-10 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Actions</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-50">
                      {history.map((record, i) => (
                        <motion.tr 
                          key={i} 
                          initial={{ opacity: 0, x: -10 }} 
                          animate={{ opacity: 1, x: 0 }} 
                          transition={{ delay: i * 0.1 }}
                          className="hover:bg-blue-50/20 transition-all group"
                        >
                           <td className="py-8 px-10">
                              <div className="flex items-center gap-4">
                                 <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${record.color} ring-4 ring-white shadow-md group-hover:scale-110 transition-transform`}>
                                    {record.icon}
                                 </div>
                                 <div>
                                    <p className="text-sm font-black text-slate-900 group-hover:text-blue-600">{record.type}</p>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{record.date}</p>
                                 </div>
                              </div>
                           </td>
                           <td className="py-8 px-10">
                              <p className="text-sm font-bold text-slate-600">{record.doctor}</p>
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter mt-1">Visit ID: ORD-29384</p>
                           </td>
                           <td className="py-8 px-10">
                              <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border border-transparent shadow-sm ${
                                 record.report === 'Normal' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                              }`}>
                                 {record.report}
                              </span>
                           </td>
                           <td className="py-8 px-10">
                              <div className="flex justify-end gap-3">
                                 <button className="h-10 w-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 hover:text-blue-600 hover:bg-white transition-all hover:shadow-md"><Eye className="w-5 h-5"/></button>
                                 <button className="h-10 w-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 hover:text-blue-600 hover:bg-white transition-all hover:shadow-md"><Download className="w-5 h-5"/></button>
                              </div>
                           </td>
                        </motion.tr>
                      ))}
                   </tbody>
                </table>
             </div>
             
             <div className="p-8 bg-slate-50/50 flex justify-center border-t border-slate-50">
                <button className="text-sm font-black text-blue-600 uppercase tracking-widest hover:underline flex items-center gap-2">Load More Records <ArrowUpRight className="w-4 h-4"/></button>
             </div>
          </div>
        </main>
      </div>
    </div>
  );
}
