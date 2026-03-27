"use client";

import { useAuth } from "@/context/AuthContext";
import { Bell, Search, User, ChevronDown, Activity, Settings, Plus, LayoutGrid, Zap } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function DashboardHeader() {
  const { user } = useAuth();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <header className="sticky top-0 z-30 bg-white/50 backdrop-blur-xl border-b border-slate-100 px-10 py-5 flex items-center justify-between">
       <div className="flex items-center gap-4 flex-1">
          <div className="relative w-80 group">
             <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-600 transition-colors">
                <Search className="w-4 h-4" />
             </div>
             <input 
               type="text" 
               placeholder="Search appointments, records, doctors..." 
               className="block w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-100 bg-white/50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-100/50 focus:border-blue-600 transition-all font-medium text-sm text-slate-800"
             />
          </div>
       </div>

       <div className="flex items-center gap-6">
          <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-green-50 text-green-700 font-bold text-xs uppercase tracking-widest border border-green-100">
             <Activity className="w-3.5 h-3.5" /> 
             System Online
          </div>

          <div className="h-10 w-10 relative flex items-center justify-center rounded-xl bg-slate-50 border border-slate-100 text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-all cursor-pointer group" onClick={() => setShowNotifications(!showNotifications)}>
             <Bell className="w-5 h-5 transition-transform group-hover:rotate-12" />
             <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-600 rounded-full border-2 border-white"></span>
             
             <AnimatePresence>
                {showNotifications && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute top-12 right-0 w-80 bg-white rounded-2xl shadow-2xl border border-slate-100 p-6 z-50 overflow-hidden"
                  >
                     <div className="flex justify-between items-center mb-4">
                        <h3 className="font-extrabold text-slate-900">Notifications</h3>
                        <span className="text-[10px] uppercase font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded cursor-pointer hover:bg-blue-100 tracking-tighter">Mark all read</span>
                     </div>
                     <div className="space-y-4">
                        {[
                          { title: "Next Appointment", desc: "You have a checkup at 2:00 PM today.", time: "10m ago", color: "bg-blue-500", icon: <Calendar className="w-3 h-3"/> },
                          { title: "Report Published", desc: "Your blood test result is now available.", time: "2h ago", color: "bg-green-500", icon: <FileText className="w-3 h-3"/> },
                          { title: "Security Alert", desc: "Logged in from a new device in New York.", time: "5h ago", color: "bg-amber-500", icon: <ShieldCheck className="w-3 h-3"/> }
                        ].map((n, i) => (
                          <div key={i} className="flex gap-4 p-3 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer group/item">
                             <div className={`mt-1 shrink-0 h-8 w-8 rounded-lg flex items-center justify-center text-white ${n.color}`}>{n.icon}</div>
                             <div>
                                <p className="text-sm font-bold text-slate-800 leading-none group-hover/item:text-blue-600">{n.title}</p>
                                <p className="text-xs text-slate-500 mt-1 line-clamp-1">{n.desc}</p>
                                <p className="text-[10px] text-slate-400 mt-1.5 font-bold uppercase tracking-widest">{n.time}</p>
                             </div>
                          </div>
                        ))}
                     </div>
                     <button className="w-full mt-6 py-3 bg-slate-50 text-slate-600 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-blue-50 hover:text-blue-600 transition-colors">See All Notifications</button>
                  </motion.div>
                )}
             </AnimatePresence>
          </div>

          <div className="relative">
             <div 
               className="flex items-center gap-4 bg-slate-50 border border-slate-100 p-1.5 pr-4 rounded-2xl hover:bg-blue-50/50 cursor-pointer transition-all group"
               onClick={() => setShowProfileMenu(!showProfileMenu)}
             >
                <img src={user?.avatar} alt={user?.name} className="w-10 h-10 rounded-xl shadow-md group-hover:scale-105 transition-transform" />
                <div className="hidden sm:block">
                   <p className="text-sm font-bold text-slate-800 leading-none mb-1">{user?.name}</p>
                   <p className="text-[10px] font-extrabold text-blue-600 uppercase tracking-widest">{user?.role}</p>
                </div>
                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${showProfileMenu ? 'rotate-180' : ''}`} />
             </div>

             <AnimatePresence>
                {showProfileMenu && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute top-16 right-0 w-64 bg-white rounded-2xl shadow-2xl border border-slate-100 p-3 z-50"
                  >
                     {[
                       { name: "My Profile", icon: <User className="w-4 h-4" /> },
                       { name: "Preferences", icon: <Settings className="w-4 h-4" /> },
                       { name: "Account Plan", icon: <Zap className="w-4 h-4" />, color: "text-blue-600" }
                     ].map((item, i) => (
                       <div key={i} className={`flex items-center gap-3 px-4 py-3 hover:bg-slate-50 rounded-xl cursor-pointer transition-colors group ${item.color || 'text-slate-600'}`}>
                          <span className="p-1.5 bg-slate-100 rounded-lg group-hover:bg-white group-hover:shadow-sm transition-all">{item.icon}</span>
                          <span className="text-sm font-bold">{item.name}</span>
                       </div>
                     ))}
                     <hr className="my-2 border-slate-50" />
                     <div className="flex items-center gap-3 px-4 py-3 hover:bg-red-50 text-red-600 rounded-xl cursor-pointer transition-colors group">
                        <span className="p-1.5 bg-red-100 rounded-lg group-hover:bg-white group-hover:shadow-sm transition-all"><LogOut className="w-4 h-4"/></span>
                        <span className="text-sm font-bold">Sign Out</span>
                     </div>
                  </motion.div>
                )}
             </AnimatePresence>
          </div>
       </div>
    </header>
  );
}

// Sub-components used but I'll define them here for simplicity in this file
const Calendar = ({ className }: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
const FileText = ({ className }: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>
const ShieldCheck = ({ className }: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>
const logOutIcon = <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>;
function LogOut({ className }: { className?: string }) { return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>; }
