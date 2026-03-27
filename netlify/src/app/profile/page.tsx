"use client";

import { useAuth } from "@/context/AuthContext";
import DashboardSidebar from "@/components/DashboardSidebar";
import DashboardHeader from "@/components/DashboardHeader";
import { 
  User, 
  Mail, 
  MapPin, 
  Phone, 
  Briefcase, 
  Shield, 
  Edit, 
  Camera, 
  Globe, 
  CheckCircle2,
  Lock,
  Zap,
  Activity,
  Calendar
} from "lucide-react";
import { motion } from "framer-motion";

export default function ProfilePage() {
  const { user } = useAuth();

  return (
    <div className="flex min-h-screen bg-slate-50/50">
      <DashboardSidebar />
      <div className="flex-1 flex flex-col">
        <DashboardHeader />
        <main className="p-10">
          <div className="flex justify-between items-end mb-10">
            <div>
              <p className="text-sm font-bold text-blue-600 uppercase tracking-widest leading-none mb-3">Settings & Identity</p>
              <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Your Profile</h1>
            </div>
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-200 transition-all hover:-translate-y-1 active:scale-95 flex items-center gap-2">
               <Edit className="w-4 h-4" /> Save Changes
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
             {/* Profile Card */}
             <div className="lg:col-span-1 space-y-8">
                <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm relative overflow-hidden group">
                   <div className="relative flex flex-col items-center">
                      <div className="relative mb-8">
                         <img src={user?.avatar} className="w-32 h-32 rounded-[2.5rem] object-cover ring-8 ring-slate-50 shadow-2xl transition-transform duration-700 group-hover:scale-110" alt={user?.name} />
                         <button className="absolute bottom-2 right-2 h-10 w-10 bg-blue-600 text-white rounded-xl flex items-center justify-center border-4 border-white shadow-xl hover:scale-110 transition-transform active:scale-95">
                            <Camera className="w-5 h-5" />
                         </button>
                      </div>
                      <h4 className="text-2xl font-black text-slate-800 leading-none mb-2">{user?.name}</h4>
                      <p className="text-xs font-black text-blue-600 uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-full">{user?.role}</p>
                      
                      <div className="w-full grid grid-cols-3 gap-4 mt-10 pt-10 border-t border-slate-50 text-center">
                         <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-2">Visits</p>
                            <p className="text-xl font-black text-slate-800">48</p>
                         </div>
                         <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-2">Reports</p>
                            <p className="text-xl font-black text-slate-800">12</p>
                         </div>
                         <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-2">Trust</p>
                            <p className="text-xl font-black text-slate-800">99</p>
                         </div>
                      </div>
                   </div>
                </div>

                <div className="bg-slate-900 rounded-[3rem] p-10 text-white relative overflow-hidden shadow-2xl shadow-slate-900/40">
                   <div className="relative z-10">
                      <div className="h-12 w-12 bg-white/10 rounded-2xl flex items-center justify-center mb-6 border border-white/5">
                         <Shield className="w-6 h-6 text-blue-400" />
                      </div>
                      <h4 className="text-xl font-bold mb-2">Security Verification</h4>
                      <p className="text-slate-400 text-sm mb-8 leading-relaxed italic">Two-factor authentication is active. Your account is secured by AES-256 encryption.</p>
                      <button className="w-full py-4 bg-white/5 hover:bg-white text-white hover:text-slate-900 border border-white/10 rounded-2xl font-black text-xs uppercase tracking-widest transition-all">
                         Update MFA Settings
                      </button>
                   </div>
                   <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/10 rounded-full blur-3xl"></div>
                </div>
             </div>

             {/* Settings Form */}
             <div className="lg:col-span-2 space-y-8">
                <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm">
                   <h3 className="text-2xl font-black text-slate-800 mb-10 flex items-center gap-4">
                      <User className="w-6 h-6 text-blue-600" /> Personal Credentials
                   </h3>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {[
                        { label: "Full Name", val: user?.name, icon: <User className="w-4 h-4"/> },
                        { label: "Email Address", val: user?.email, icon: <Mail className="w-4 h-4"/> },
                        { label: "Contact Phone", val: "+1 (555) 902-3920", icon: <Phone className="w-4 h-4"/> },
                        { label: "Home Address", val: "729 Care St, Medical Hub, NY", icon: <MapPin className="w-4 h-4"/> },
                        { label: "Nationality", val: "United States", icon: <Globe className="w-4 h-4"/> },
                        { label: "Bio-Identity ID", val: user?.patientId || "STAFF-90234", icon: <Shield className="w-4 h-4"/> },
                      ].map((field, i) => (
                        <div key={i} className="space-y-2">
                           <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">{field.label}</label>
                           <div className="relative group">
                              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-600 transition-colors">
                                 {field.icon}
                              </div>
                              <input type="text" defaultValue={field.val} className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-600 transition-all font-bold text-sm text-slate-700 shadow-inner" />
                           </div>
                        </div>
                      ))}
                   </div>
                </div>

                <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm relative overflow-hidden">
                   <h3 className="text-2xl font-black text-slate-800 mb-10 flex items-center gap-4">
                      <Lock className="w-6 h-6 text-indigo-600" /> Account Settings
                   </h3>
                   <div className="space-y-6">
                      {[
                        { title: "Public Profile", desc: "Allow anyone to find your medical professional profile", active: true },
                        { title: "Email Notifications", desc: "Receive automated session reminders and report alerts", active: true },
                        { title: "Smart Scheduling", desc: "Enable AI-driven optimal booking recommendations", active: false },
                      ].map((item, i) => (
                        <div key={i} className="flex justify-between items-center p-6 bg-slate-50/50 rounded-3xl border border-slate-50">
                           <div>
                              <p className="font-black text-slate-800">{item.title}</p>
                              <p className="text-xs font-medium text-slate-400 mt-1 italic">{item.desc}</p>
                           </div>
                           <div className={`w-14 h-8 rounded-full p-1 cursor-pointer transition-colors ${item.active ? 'bg-blue-600' : 'bg-slate-300'}`}>
                              <div className={`h-6 w-6 bg-white rounded-full shadow-md transition-transform ${item.active ? 'translate-x-6' : 'translate-x-0'}`}></div>
                           </div>
                        </div>
                      ))}
                   </div>
                </div>
             </div>
          </div>
        </main>
      </div>
    </div>
  );
}
