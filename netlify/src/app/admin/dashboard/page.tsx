"use client";

import { useAuth } from "@/context/AuthContext";
import DashboardSidebar from "@/components/DashboardSidebar";
import DashboardHeader from "@/components/DashboardHeader";
import { adminStats } from "@/data/mockData";
import { 
  Users, 
  Calendar, 
  DollarSign, 
  Activity, 
  Search, 
  Plus, 
  Filter, 
  MoreVertical, 
  TrendingUp, 
  ArrowUpRight, 
  ArrowDownRight,
  TrendingDown,
  LayoutGrid,
  Zap,
  BriefcaseMedical,
  Stethoscope,
  Trash2,
  Edit2
} from "lucide-react";
import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from 'recharts';

const chartData = [
  { name: 'Mon', revenue: 4200, patients: 45 },
  { name: 'Tue', revenue: 3800, patients: 52 },
  { name: 'Wed', revenue: 5100, patients: 48 },
  { name: 'Thu', revenue: 4600, patients: 61 },
  { name: 'Fri', revenue: 5900, patients: 55 },
  { name: 'Sat', revenue: 3200, patients: 30 },
  { name: 'Sun', revenue: 2800, patients: 25 },
];

export default function AdminDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'doctors' | 'patients'>('overview');
  const [showAddDoctor, setShowAddDoctor] = useState(false);

  return (
    <div className="flex min-h-screen bg-slate-50/50">
      <DashboardSidebar />
      <div className="flex-1 flex flex-col">
        <DashboardHeader />
        <main className="p-10">
          <div className="flex justify-between items-end mb-10">
            <div>
              <p className="text-sm font-bold text-emerald-600 uppercase tracking-widest leading-none mb-3">System Administration</p>
              <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Main Command Center</h1>
            </div>
            <div className="flex gap-4 p-1.5 bg-white rounded-2xl border border-slate-100 shadow-sm">
                {(['overview', 'doctors', 'patients'] as const).map(tab => (
                    <button 
                      key={tab} 
                      onClick={() => setActiveTab(tab)}
                      className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${activeTab === tab ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-500 hover:text-emerald-600'}`}
                    >
                        {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </button>
                ))}
            </div>
          </div>

          <AnimatePresence mode="wait">
             {activeTab === 'overview' && (
                <motion.div 
                   key="overview"
                   initial={{ opacity: 0, y: 10 }}
                   animate={{ opacity: 1, y: 0 }}
                   exit={{ opacity: 0, y: -10 }}
                   className="space-y-10"
                >
                   {/* Admin stats */}
                   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                      {adminStats.map((stat, i) => (
                        <div key={i} className="bg-white p-7 rounded-[2.5rem] border border-slate-100 shadow-sm relative group overflow-hidden">
                           <div className="flex items-center justify-between mb-4">
                              <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-all duration-300">
                                 {stat.icon === 'dollar' ? <DollarSign /> : stat.icon === 'user-plus' ? <Plus /> : stat.icon === 'activity' ? <Activity /> : <Calendar />}
                              </div>
                              <div className={`flex items-center gap-1 text-[10px] font-black ${stat.trend.startsWith('+') ? 'text-green-600 bg-green-50' : stat.trend === 'Active' ? 'text-blue-600 bg-blue-50' : 'text-amber-600 bg-amber-50'} px-2 py-0.5 rounded-full uppercase tracking-tighter`}>
                                 {stat.trend} 
                                 {stat.trend.startsWith('+') && <TrendingUp className="w-2.5 h-2.5" />}
                              </div>
                           </div>
                           <p className="text-slate-500 font-bold text-xs uppercase tracking-widest">{stat.name}</p>
                           <h4 className="text-3xl font-black text-slate-900 mt-1">{stat.value}</h4>
                        </div>
                      ))}
                   </div>

                   {/* Charts Section */}
                   <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                      <div className="lg:col-span-2 bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm">
                         <div className="flex justify-between items-center mb-8">
                            <h3 className="text-xl font-extrabold text-slate-800">Revenue Analysis</h3>
                            <select className="text-sm font-bold bg-slate-50 border border-slate-100 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500/20">
                               <option>Monthly</option>
                               <option>Quarterly</option>
                               <option>Yearly</option>
                            </select>
                         </div>
                         <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                               <AreaChart data={chartData}>
                                  <defs>
                                     <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                     </linearGradient>
                                  </defs>
                                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 700, fill: '#94a3b8' }} dy={10} />
                                  <YAxis hide />
                                  <Tooltip 
                                     contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontWeight: 800 }}
                                     cursor={{ stroke: '#10b981', strokeWidth: 2, strokeDasharray: '5 5' }}
                                  />
                                  <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={4} fillOpacity={1} fill="url(#colorRev)" />
                               </AreaChart>
                            </ResponsiveContainer>
                         </div>
                      </div>

                      <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm flex flex-col">
                         <h3 className="text-xl font-extrabold text-slate-800 mb-8">Patient Flow</h3>
                         <div className="flex-1">
                            <ResponsiveContainer width="100%" height="100%">
                               <BarChart data={chartData}>
                                  <Bar dataKey="patients" radius={[10, 10, 10, 10]} barSize={20}>
                                     {chartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={index === 4 ? '#10b981' : '#f1f5f9'} />
                                     ))}
                                  </Bar>
                                  <Tooltip 
                                    cursor={{ fill: 'transparent' }}
                                    contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontWeight: 800 }}
                                  />
                               </BarChart>
                            </ResponsiveContainer>
                         </div>
                         <div className="mt-8 p-6 bg-slate-900 rounded-[2rem] text-white overflow-hidden relative group">
                            <p className="text-xs font-bold text-emerald-400 uppercase tracking-widest mb-1">Success Rate</p>
                            <h5 className="text-2xl font-black mb-4">99.8% Efficiency</h5>
                            <button className="text-xs font-black uppercase tracking-widest py-2 px-4 bg-emerald-600 hover:bg-emerald-500 rounded-xl transition-all shadow-lg active:scale-95">Download PDF</button>
                            <div className="absolute top-0 right-0 h-full w-24 bg-gradient-to-l from-emerald-500/10 to-transparent"></div>
                            <Zap className="absolute -bottom-2 -right-2 w-16 h-16 text-white/5 rotate-12" />
                         </div>
                      </div>
                   </div>
                   
                   {/* Table snippet */}
                   <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden">
                      <div className="flex justify-between items-center mb-8">
                         <h3 className="text-xl font-extrabold text-slate-800">Recent System Activity</h3>
                         <button className="px-4 py-2 border border-slate-100 hover:bg-slate-50 rounded-xl font-bold text-xs uppercase tracking-widest transition-all">Export Logs</button>
                      </div>
                      <div className="overflow-x-auto">
                         <table className="w-full">
                            <thead>
                               <tr className="text-left text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-50">
                                  <th className="pb-4 px-4 font-black">Event Type</th>
                                  <th className="pb-4 px-4 font-black">System Component</th>
                                  <th className="pb-4 px-4 font-black">Coordinator</th>
                                  <th className="pb-4 px-4 font-black">Timestamp</th>
                                  <th className="pb-4 px-4 font-black text-right">Status</th>
                               </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                               {[
                                 { type: "Database Backup", comp: "Cloud-SDR", coord: "AutoSys", ts: "2m ago", status: "Success", color: "text-green-600 bg-green-50" },
                                 { type: "API Patch v2.4", comp: "Network Layer", coord: "Adm. Sarah", ts: "1h ago", status: "Deployed", color: "text-blue-600 bg-blue-50" },
                                 { type: "Dr. Onboarding", comp: "Personnel", coord: "Adm. Michael", ts: "3h ago", status: "Pending", color: "text-amber-600 bg-amber-50" },
                               ].map((ev, i) => (
                                 <tr key={i} className="hover:bg-slate-50 transition-colors group">
                                    <td className="py-5 px-4"><p className="text-sm font-bold text-slate-700">{ev.type}</p></td>
                                    <td className="py-5 px-4"><p className="text-xs font-bold text-slate-400 bg-slate-50 inline-block px-2 py-1 rounded ">{ev.comp}</p></td>
                                    <td className="py-5 px-4 text-sm font-bold text-slate-500">{ev.coord}</td>
                                    <td className="py-5 px-4 text-xs font-bold text-slate-400 uppercase tracking-widest">{ev.ts}</td>
                                    <td className="py-5 px-4 text-right">
                                       <span className={`px-3 py-1.5 rounded-xl font-black uppercase tracking-tighter text-[9px] ${ev.color}`}>{ev.status}</span>
                                    </td>
                                 </tr>
                               ))}
                            </tbody>
                         </table>
                      </div>
                   </div>
                </motion.div>
             )}

             {activeTab === 'doctors' && (
                <motion.div key="doctors" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                    <div className="flex justify-between items-center bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
                        <div className="relative w-96">
                           <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                           <input type="text" placeholder="Search by name, ID or specialty..." className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-emerald-100 focus:border-emerald-600 transition-all font-bold text-sm" />
                        </div>
                        <div className="flex gap-4">
                           <button className="px-5 py-3.5 bg-slate-50 text-slate-600 border border-slate-100 rounded-2xl font-bold flex items-center gap-2 hover:bg-slate-100 transition-all">
                              <Filter className="w-4 h-4" /> Filters
                           </button>
                           <button onClick={() => setShowAddDoctor(true)} className="px-5 py-3.5 bg-emerald-600 text-white rounded-2xl font-bold flex items-center gap-2 shadow-lg shadow-emerald-200 hover:scale-105 active:scale-95 transition-all">
                              <Plus className="w-4 h-4" /> Add Specialist
                           </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pt-4">
                        {[
                          { name: "Dr. Sarah Wilson", specialty: "Cardiology", id: "DR-001", patients: 124, status: "Active", avatar: "https://i.pravatar.cc/150?u=1" },
                          { name: "Dr. Michael Chen", specialty: "Neurology", id: "DR-002", patients: 86, status: "Active", avatar: "https://i.pravatar.cc/150?u=2" },
                          { name: "Dr. Emily Adams", specialty: "Pediatrics", id: "DR-003", patients: 215, status: "On Leave", avatar: "https://i.pravatar.cc/150?u=3" },
                        ].map((doc, i) => (
                           <motion.div 
                              key={i} 
                              whileHover={{ y: -5 }}
                              className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm relative group"
                           >
                              <div className="absolute top-8 right-8">
                                 <MoreVertical className="w-5 h-5 text-slate-300 cursor-pointer hover:text-slate-600 transition-colors" />
                              </div>
                              <div className="flex flex-col items-center text-center">
                                 <div className="relative mb-6">
                                    <img src={doc.avatar} className="w-24 h-24 rounded-[2rem] object-cover ring-4 ring-slate-50 group-hover:scale-110 transition-transform duration-500" alt={doc.name} />
                                    <div className={`absolute -bottom-1 -right-1 w-6 h-6 border-4 border-white rounded-full ${doc.status === 'Active' ? 'bg-green-500' : 'bg-amber-500'}`}></div>
                                 </div>
                                 <h4 className="text-xl font-extrabold text-slate-800 leading-none mb-1 group-hover:text-emerald-600 transition-colors">{doc.name}</h4>
                                 <p className="text-xs font-bold text-emerald-600 uppercase tracking-widest bg-emerald-50 px-2 py-0.5 rounded-full inline-block mt-2">{doc.specialty}</p>
                                 <p className="text-xs font-bold text-slate-400 mt-4 uppercase tracking-tighter">ID: {doc.id}</p>
                                 
                                 <div className="w-full grid grid-cols-2 gap-4 mt-8 pt-8 border-t border-slate-50">
                                    <div>
                                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Patients</p>
                                       <p className="text-xl font-black text-slate-900">{doc.patients}</p>
                                    </div>
                                    <div>
                                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Rating</p>
                                       <p className="text-xl font-black text-slate-900">4.9/5</p>
                                    </div>
                                 </div>
                                 <div className="w-full flex gap-3 mt-8">
                                    <button className="flex-1 py-3 bg-slate-50 text-slate-600 hover:bg-emerald-50 hover:text-emerald-600 rounded-xl font-bold flex items-center justify-center gap-2 transition-all group/btn">
                                       <Edit2 className="w-3.5 h-3.5" /> Edit
                                    </button>
                                    <button className="flex-1 py-3 bg-white text-rose-500 border border-transparent hover:border-rose-100 hover:bg-rose-50 rounded-xl font-bold flex items-center justify-center gap-2 transition-all">
                                       <Trash2 className="w-3.5 h-3.5" /> Remove
                                    </button>
                                 </div>
                              </div>
                           </motion.div>
                        ))}
                    </div>
                </motion.div>
             )}
          </AnimatePresence>
        </main>
      </div>

      {/* Simplified Add Doctor Modal Overlay */}
      <AnimatePresence>
         {showAddDoctor && (
           <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
              <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowAddDoctor(false)}></div>
              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="relative bg-white p-10 rounded-[3rem] w-full max-w-lg shadow-2xl">
                 <h3 className="text-2xl font-black mb-6">Add New Specialist</h3>
                 <div className="space-y-6">
                    <div>
                       <label className="text-xs font-black uppercase text-slate-400 mb-2 block">Full Name</label>
                       <input type="text" className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-emerald-100 outline-none" placeholder="e.g. Dr. Jane Cooper" />
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                       <div>
                          <label className="text-xs font-black uppercase text-slate-400 mb-2 block">Specialty</label>
                          <select className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-emerald-100 outline-none">
                             <option>Neurology</option>
                             <option>Cardiology</option>
                             <option>Oncology</option>
                          </select>
                       </div>
                       <div>
                          <label className="text-xs font-black uppercase text-slate-400 mb-2 block">Employee ID</label>
                          <input type="text" className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-emerald-100 outline-none" placeholder="EMP-XXX" />
                       </div>
                    </div>
                    <button onClick={() => setShowAddDoctor(false)} className="w-full py-5 bg-emerald-600 text-white rounded-[1.5rem] font-black text-lg shadow-xl shadow-emerald-200 transition-all hover:-translate-y-1">Create Personnel Profile</button>
                 </div>
              </motion.div>
           </div>
         )}
      </AnimatePresence>
    </div>
  );
}
