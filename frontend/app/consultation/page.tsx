"use client";
import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import AuthGuard from "@/components/AuthGuard";
import { api, tokenStore, userStore } from "@/lib/api";
import Link from "next/link";

interface Appointment {
  id: number;
  doctor_name?: string;
  patient_name?: string;
  date: string;
  time: string;
  status: string;
}

export default function ConsultationPage() {
  const currentUser = userStore.get();
  const isLoggedIn = !!tokenStore.get() && !!currentUser;
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeCall, setActiveCall] = useState<Appointment | null>(null);
  const [callTime, setCallTime] = useState(0);
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);

  useEffect(() => {
    if (!isLoggedIn) return;
    setLoading(true);
    api.appointments.list({ status: "confirmed" })
      .then(data => {
        const items = Array.isArray(data) ? data : [];
        setAppointments(items);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [isLoggedIn]);

  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;
    if (activeCall) {
      timer = setInterval(() => setCallTime(t => t + 1), 1000);
    } else {
      setCallTime(0);
    }
    return () => clearInterval(timer);
  }, [activeCall]);

  const formatCallTime = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, "0");
    const s = (secs % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center bg-[#F8FAFC]">
          <div className="text-center max-w-sm px-6">
            <div className="w-20 h-20 bg-[#EFF6FF] rounded-full flex items-center justify-center mx-auto mb-6">
              <i className="bi bi-camera-video-fill text-4xl text-[#2C74B3]" />
            </div>
            <h2 className="text-2xl font-bold text-[#0A2647] mb-3">Sign in to consult online</h2>
            <p className="text-gray-500 mb-6">Video consultations with your doctor, from anywhere.</p>
            <Link href="/auth/login" className="bg-[#2C74B3] text-white font-semibold px-6 py-3 rounded-xl hover:bg-[#0A2647] transition-all">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (activeCall) {
    const otherName = currentUser?.role === "patient"
      ? `Dr. ${activeCall.doctor_name ?? "Doctor"}`
      : (activeCall.patient_name ?? "Patient");

    return (
      <div className="min-h-screen flex flex-col bg-[#0A2647] text-white">
        <div className="px-6 py-4 flex items-center justify-between border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#2C74B3] rounded-lg flex items-center justify-center">
              <i className="bi bi-heart-pulse-fill text-white text-sm" />
            </div>
            <span className="font-bold text-white">MediCare Video</span>
          </div>
          <div className="flex items-center gap-2 bg-red-500/20 border border-red-500/30 rounded-full px-3 py-1">
            <span className="w-2 h-2 bg-red-400 rounded-full animate-pulse" />
            <span className="text-red-300 text-xs font-semibold">LIVE · {formatCallTime(callTime)}</span>
          </div>
          <div className="text-white/40 text-sm">End-to-end encrypted</div>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center gap-10 p-8">
          <div className="relative">
            <div className="w-48 h-48 bg-gradient-to-br from-[#144272] to-[#2C74B3] rounded-full flex items-center justify-center shadow-2xl ring-4 ring-sky-400/30">
              <i className="bi bi-person-fill text-white text-7xl" />
            </div>
            {!camOn && (
              <div className="absolute inset-0 bg-[#0A2647]/80 rounded-full flex items-center justify-center">
                <i className="bi bi-camera-video-off-fill text-white/50 text-3xl" />
              </div>
            )}
          </div>

          <div className="text-center">
            <h2 className="text-2xl font-bold">{otherName}</h2>
            <p className="text-sky-300 text-sm mt-1">In secure consultation</p>
          </div>

          <div className="flex gap-4 items-center">
            <button
              onClick={() => setMicOn(v => !v)}
              className={`flex flex-col items-center gap-2 w-20 py-3 rounded-2xl transition-colors ${micOn ? "bg-white/10 hover:bg-white/20" : "bg-red-500/80"}`}
            >
              <i className={`bi ${micOn ? "bi-mic-fill" : "bi-mic-mute-fill"} text-xl`} />
              <span className="text-xs">{micOn ? "Mute" : "Unmuted"}</span>
            </button>

            <button
              onClick={() => setCamOn(v => !v)}
              className={`flex flex-col items-center gap-2 w-20 py-3 rounded-2xl transition-colors ${camOn ? "bg-white/10 hover:bg-white/20" : "bg-red-500/80"}`}
            >
              <i className={`bi ${camOn ? "bi-camera-video-fill" : "bi-camera-video-off-fill"} text-xl`} />
              <span className="text-xs">Camera</span>
            </button>

            <Link
              href="/chat"
              className="flex flex-col items-center gap-2 w-20 py-3 rounded-2xl bg-white/10 hover:bg-white/20 transition-colors text-center"
            >
              <i className="bi bi-chat-dots-fill text-xl" />
              <span className="text-xs">Chat</span>
            </Link>

            <button
              onClick={() => setActiveCall(null)}
              className="flex flex-col items-center gap-2 w-20 py-3 rounded-2xl bg-red-500 hover:bg-red-600 transition-colors"
            >
              <i className="bi bi-telephone-fill rotate-[135deg] text-xl" />
              <span className="text-xs">End</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <AuthGuard>
    <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
      <Navbar />
      <div className="flex-1 container mx-auto px-4 py-10 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#0A2647]">Online Consultation</h1>
          <p className="text-gray-500 mt-1">Connect with your doctor via secure video call.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-4 mb-8">
          {[
            { icon: "bi-shield-check-fill", color: "text-green-600", bg: "bg-green-50", title: "Encrypted", desc: "End-to-end secure" },
            { icon: "bi-clock-fill", color: "text-blue-600", bg: "bg-blue-50", title: "On-demand", desc: "Any time, any device" },
            { icon: "bi-file-earmark-medical-fill", color: "text-purple-600", bg: "bg-purple-50", title: "E-Prescription", desc: "Get digital prescriptions" },
          ].map(f => (
            <div key={f.title} className={`rounded-2xl p-5 flex items-start gap-4 ${f.bg}`}>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${f.bg}`}>
                <i className={`bi ${f.icon} ${f.color} text-xl`} />
              </div>
              <div>
                <p className="font-semibold text-[#0A2647]">{f.title}</p>
                <p className="text-gray-500 text-sm">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-bold text-[#0A2647]">Your Confirmed Appointments</h2>
            <Link href="/appointments" className="text-[#2C74B3] text-sm font-semibold hover:underline">
              Book new →
            </Link>
          </div>

          {loading && (
            <div className="py-12 text-center text-gray-400">
              <i className="bi bi-arrow-repeat animate-spin text-3xl block mb-3" />
              Loading appointments…
            </div>
          )}

          {!loading && appointments.length === 0 && (
            <div className="py-12 text-center">
              <i className="bi bi-calendar-x text-5xl text-gray-200 block mb-4" />
              <p className="text-gray-500 font-medium">No confirmed appointments</p>
              <p className="text-gray-400 text-sm mt-1">Book an appointment first to start a consultation.</p>
              <Link href="/appointments"
                className="mt-4 inline-block bg-[#2C74B3] text-white font-semibold px-6 py-2.5 rounded-xl hover:bg-[#0A2647] transition-colors">
                Book Appointment
              </Link>
            </div>
          )}

          {appointments.map(appt => (
            <div key={appt.id} className="px-6 py-4 border-b border-gray-50 last:border-0 flex items-center justify-between hover:bg-[#F8FAFC] transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[#EFF6FF] rounded-xl flex items-center justify-center">
                  <i className="bi bi-camera-video-fill text-[#2C74B3] text-xl" />
                </div>
                <div>
                  <p className="font-semibold text-[#0A2647]">
                    {currentUser?.role === "patient"
                      ? `Dr. ${appt.doctor_name ?? "Doctor"}`
                      : (appt.patient_name ?? "Patient")}
                  </p>
                  <p className="text-gray-500 text-sm">{appt.date} at {appt.time}</p>
                </div>
              </div>
              <button
                onClick={() => setActiveCall(appt)}
                className="bg-[#2C74B3] text-white font-semibold px-5 py-2.5 rounded-xl hover:bg-[#0A2647] transition-colors flex items-center gap-2"
              >
                <i className="bi bi-camera-video-fill" />
                Join Call
              </button>
            </div>
          ))}
        </div>

        <div className="mt-6 bg-amber-50 border border-amber-200 rounded-2xl p-5 flex gap-4">
          <i className="bi bi-info-circle-fill text-amber-500 text-xl flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-amber-800">Browser permissions required</p>
            <p className="text-amber-700 text-sm mt-1">
              Allow camera and microphone access when prompted. Use a modern browser like Chrome or Firefox for the best experience.
            </p>
          </div>
        </div>
      </div>
    </div>
    </AuthGuard>
  );
}
