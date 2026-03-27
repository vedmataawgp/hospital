"use client";

import { useAuth } from "@/context/AuthContext";
import { 
  Mic, 
  MicOff, 
  Video, 
  VideoOff, 
  PhoneOff, 
  Settings, 
  Users, 
  MessageSquare, 
  Monitor, 
  Maximize, 
  ChevronLeft,
  MoreVertical,
  Radio,
  Clock,
  ShieldCheck,
  Zap
} from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function VideoCallPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [callTime, setCallTime] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setCallTime(prev => prev + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="h-screen bg-slate-950 text-white flex flex-col overflow-hidden selection:bg-blue-500/30 selection:text-blue-100">
      {/* Header */}
      <header className="p-8 flex justify-between items-center bg-gradient-to-b from-black/60 to-transparent fixed top-0 w-full z-50 pointer-events-none">
        <div className="flex items-center gap-6 pointer-events-auto">
          <button 
            onClick={() => router.back()}
            className="h-12 w-12 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center hover:bg-white/20 transition-all border border-white/10 group"
          >
            <ChevronLeft className="w-6 h-6 group-hover:-translate-x-1 transition-transform" />
          </button>
          <div className="flex flex-col">
            <div className="flex items-center gap-3">
               <h1 className="text-xl font-black text-white tracking-tight">Tele-Health Consultation Session</h1>
               <span className="bg-red-600 text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded flex items-center gap-1.5 border border-red-500/50 shadow-lg shadow-red-900/40 animate-pulse">
                  <Radio className="w-3 h-3" /> Live Secure Recording
               </span>
            </div>
            <div className="flex items-center gap-4 mt-1 opacity-60">
              <span className="text-xs font-bold uppercase tracking-widest flex items-center gap-2"><Clock className="w-3.5 h-3.5" /> Session ID: RX-9204-ML</span>
              <span className="text-xs font-bold uppercase tracking-widest flex items-center gap-2"><ShieldCheck className="w-3.5 h-3.5" /> HIPAA-Compliant AES-256</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 pointer-events-auto">
           <div className="px-5 py-2.5 bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl font-black text-sm uppercase tracking-widest flex items-center gap-3 shadow-lg">
              <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping"></div>
              {formatTime(callTime)}
           </div>
           <button className="h-12 w-12 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center hover:bg-white/20 transition-all border border-white/10"><Settings className="w-5 h-5"/></button>
        </div>
      </header>

      {/* Main Video Grid */}
      <main className="flex-1 relative p-10 pt-32 pb-40">
        <div className="h-full w-full grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
           {/* Doctor/Peer Stream */}
           <motion.div 
             initial={{ opacity: 0, scale: 0.95 }}
             animate={{ opacity: 1, scale: 1 }}
             className="relative bg-slate-900 rounded-[3rem] overflow-hidden border-2 border-white/5 shadow-2xl group cursor-pointer"
           >
              <img 
                 src="https://images.unsplash.com/photo-1559839734-2b71f1536783?auto=format&fit=crop&q=80&w=2070" 
                 className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000 opacity-60 group-hover:opacity-80 transition-opacity" 
                 alt="Doctor Stream" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
              <div className="absolute bottom-8 left-10 flex items-center gap-4">
                 <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-blue-900/40">
                    <img src="https://i.pravatar.cc/150?u=a" className="w-full h-full rounded-2xl border-2 border-white/20" alt="avatar" />
                 </div>
                 <div>
                    <h4 className="text-2xl font-black text-white tracking-tight">Dr. Sarah Wilson</h4>
                    <p className="text-sm font-bold text-white/50 uppercase tracking-widest leading-none">Senior Cardiology Specialist</p>
                 </div>
              </div>
              <div className="absolute top-8 right-10 flex gap-3">
                 <div className="h-10 w-10 rounded-xl bg-black/40 backdrop-blur-md flex items-center justify-center transition-colors hover:bg-blue-600"><Mic className="w-5 h-5" /></div>
                 <div className="h-10 w-10 rounded-xl bg-black/40 backdrop-blur-md flex items-center justify-center transition-colors hover:bg-blue-600"><MoreVertical className="w-5 h-5"/></div>
              </div>
              <div className="absolute bottom-10 right-10 flex flex-col gap-2">
                 <div className="px-3 py-1 bg-white/10 backdrop-blur-md rounded-lg text-[10px] uppercase font-bold tracking-widest flex items-center gap-2 border border-white/5">
                    <Zap className="w-3 h-3 text-emerald-400" /> Latency: 14ms
                 </div>
                 <div className="px-3 py-1 bg-white/10 backdrop-blur-md rounded-lg text-[10px] uppercase font-bold tracking-widest flex items-center gap-2 border border-white/5">
                    <Monitor className="w-3 h-3 text-blue-400" /> Full HD 1080p
                 </div>
              </div>
           </motion.div>

           {/* User Stream */}
           <motion.div 
             initial={{ opacity: 0, scale: 0.95, x: 20 }}
             animate={{ opacity: 1, scale: 1, x: 0 }}
             transition={{ delay: 0.2 }}
             className="relative bg-slate-900 rounded-[3rem] overflow-hidden border-2 border-white/5 shadow-2xl group cursor-pointer"
           >
              {isVideoOff ? (
                <div className="w-full h-full flex flex-col items-center justify-center bg-slate-900 relative">
                   <div className="w-32 h-32 rounded-[2.5rem] bg-slate-800 flex items-center justify-center text-slate-600 ring-4 ring-slate-800 shadow-2xl animate-pulse">
                      <VideoOff className="w-12 h-12" />
                   </div>
                   <p className="mt-8 text-slate-500 font-black uppercase tracking-widest text-lg">Camera is Managed by Admin</p>
                </div>
              ) : (
                <img 
                  src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=1976" 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000 opacity-70 group-hover:opacity-90 transition-opacity" 
                  alt="User Stream" 
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
              <div className="absolute bottom-10 left-10 flex items-center gap-4">
                 <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center text-white shadow-xl">
                    <img src={user?.avatar} className="w-full h-full rounded-2xl border-2 border-white/20" alt="my avatar" />
                 </div>
                 <div>
                    <h4 className="text-2xl font-black text-white tracking-tight">{user?.name} (You)</h4>
                    <p className="text-sm font-bold text-white/50 uppercase tracking-widest leading-none">Remote Consultation Participant</p>
                 </div>
              </div>
              <div className="absolute top-10 right-10 flex gap-4">
                 <div className="h-12 w-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center transition-all hover:bg-emerald-600 border border-white/10"><Users className="w-6 h-6" /></div>
                 <div className="h-12 w-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center transition-all hover:bg-emerald-600 border border-white/10"><Maximize className="w-6 h-6" /></div>
              </div>
           </motion.div>
        </div>
      </main>

      {/* Control Bar */}
      <footer className="fixed bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-6 z-50 pointer-events-none">
        <motion.div 
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-black/60 backdrop-blur-2xl border border-white/10 p-5 px-10 rounded-[3rem] flex items-center gap-10 shadow-2xl pointer-events-auto ring-1 ring-white/10"
        >
          <div className="flex items-center gap-5">
            <button 
              onClick={() => setIsMuted(!isMuted)}
              className={`h-16 w-16 rounded-[1.5rem] flex items-center justify-center transition-all active:scale-90 border-2 ${
                isMuted ? 'bg-red-500/10 border-red-500/50 text-red-500 shadow-lg shadow-red-900/20' : 'bg-white/5 border-white/5 text-white hover:bg-white/10'
              }`}
            >
              {isMuted ? <MicOff className="w-7 h-7" /> : <Mic className="w-7 h-7" />}
            </button>
            <button 
               onClick={() => setIsVideoOff(!isVideoOff)}
               className={`h-16 w-16 rounded-[1.5rem] flex items-center justify-center transition-all active:scale-90 border-2 ${
                isVideoOff ? 'bg-red-500/10 border-red-500/50 text-red-500 shadow-lg shadow-red-900/20' : 'bg-white/5 border-white/5 text-white hover:bg-white/10'
              }`}
            >
              {isVideoOff ? <VideoOff className="w-7 h-7" /> : <Video className="w-7 h-7" />}
            </button>
          </div>

          <div className="h-10 w-px bg-white/10"></div>

          <div className="flex items-center gap-5">
            <button className="h-16 w-16 bg-white/5 border-2 border-white/5 text-white rounded-[1.5rem] flex items-center justify-center hover:bg-white/10 transition-all active:scale-90"><Monitor className="w-7 h-7"/></button>
            <button className="h-16 w-16 bg-white/5 border-2 border-white/5 text-white rounded-[1.5rem] flex items-center justify-center hover:bg-white/10 transition-all active:scale-90 relative">
               <MessageSquare className="w-7 h-7"/>
               <span className="absolute top-4 right-4 h-3 w-3 bg-blue-500 rounded-full border-2 border-black"></span>
            </button>
          </div>

          <div className="h-10 w-px bg-white/10"></div>

          <button 
            onClick={() => router.back()}
            className="h-16 px-10 bg-red-600 hover:bg-red-700 text-white rounded-[1.5rem] flex items-center gap-4 font-black text-xs uppercase tracking-widest shadow-xl shadow-red-900/40 transition-all hover:scale-105 active:scale-95 group"
          >
            Leave Consultation <PhoneOff className="w-6 h-6 group-hover:rotate-[135deg] transition-transform duration-500" />
          </button>
        </motion.div>
      </footer>

      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full -z-10 pointer-events-none opacity-20">
         <div className="absolute top-[10%] left-[20%] w-[30%] h-[30%] bg-blue-600/30 rounded-full blur-[100px] animate-pulse"></div>
         <div className="absolute bottom-[20%] right-[30%] w-[25%] h-[25%] bg-indigo-600/30 rounded-full blur-[100px] animate-bounce duration-[10s]"></div>
      </div>
    </div>
  );
}
