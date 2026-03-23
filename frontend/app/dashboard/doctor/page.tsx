"use client";
import { useState } from "react";
import Navbar from "@/components/Navbar";

const todayAppointments = [
  { patient: "John Patient", time: "09:00 AM", reason: "Chest pain", status: "Upcoming" },
  { patient: "Maria Santos", time: "10:30 AM", reason: "Follow-up", status: "In Progress" },
  { patient: "Robert Kim", time: "02:00 PM", reason: "Routine checkup", status: "Upcoming" },
  { patient: "Susan Lee", time: "03:30 PM", reason: "Lab results review", status: "Upcoming" },
];

const patients = [
  { name: "John Patient", age: 40, last: "2026-03-15", condition: "Hypertension" },
  { name: "Maria Santos", age: 35, last: "2026-03-20", condition: "Migraine" },
  { name: "Robert Kim", age: 52, last: "2026-02-28", condition: "Diabetes" },
];

const statusColor: Record<string, string> = {
  Upcoming: "bg-blue-50 text-[#2C74B3]",
  "In Progress": "bg-green-50 text-[#2A9D8F]",
  Completed: "bg-gray-100 text-gray-500",
};

export default function DoctorDashboard() {
  const [section, setSection] = useState("Today");
  const [notes, setNotes] = useState("");
  const [selectedPatient, setSelectedPatient] = useState(patients[0].name);

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-[#0A2647]">Doctor Dashboard</h1>
            <p className="text-gray-500">Dr. Sarah Johnson — Cardiology</p>
          </div>
          <div className="flex gap-2">
            {["Today", "Patients", "Prescriptions"].map(s => (
              <button key={s} onClick={() => setSection(s)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${section === s ? "bg-[#2C74B3] text-white" : "bg-white text-gray-600 border border-gray-200 hover:border-[#2C74B3]"}`}>
                {s}
              </button>
            ))}
          </div>
        </div>

        {section === "Today" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-5 border-b border-gray-100 flex justify-between items-center">
                  <h2 className="font-bold text-[#0A2647] text-xl">Today&apos;s Appointments</h2>
                  <span className="bg-[#2C74B3]/10 text-[#2C74B3] text-sm font-medium px-3 py-1 rounded-full">{todayAppointments.length} appointments</span>
                </div>
                <div className="divide-y divide-gray-50">
                  {todayAppointments.map((a, i) => (
                    <div key={i} className="p-4 hover:bg-gray-50 transition-colors flex items-center gap-4">
                      <div className="text-center w-16">
                        <div className="text-[#2C74B3] font-bold text-sm">{a.time}</div>
                      </div>
                      <div className="w-10 h-10 bg-gradient-to-br from-[#144272] to-[#2C74B3] rounded-full flex items-center justify-center text-xl">👤</div>
                      <div className="flex-1">
                        <div className="font-semibold text-[#0A2647] text-sm">{a.patient}</div>
                        <div className="text-gray-400 text-xs">{a.reason}</div>
                      </div>
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusColor[a.status]}`}>{a.status}</span>
                      <button className="text-[#2C74B3] text-sm font-medium hover:underline">Start</button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div>
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
                <h3 className="font-bold text-[#0A2647] mb-4">Quick Stats</h3>
                {[
                  { label: "Today", val: "4", icon: "📅" },
                  { label: "This Week", val: "22", icon: "📊" },
                  { label: "Total Patients", val: "128", icon: "👥" },
                ].map(s => (
                  <div key={s.label} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
                    <div className="flex items-center gap-2 text-gray-500 text-sm">{s.icon} {s.label}</div>
                    <div className="font-bold text-[#0A2647]">{s.val}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {section === "Patients" && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
            <div className="p-5 border-b border-gray-100">
              <h2 className="font-bold text-[#0A2647] text-xl">My Patients</h2>
            </div>
            <div className="divide-y divide-gray-50">
              {patients.map(p => (
                <div key={p.name} className="p-5 hover:bg-gray-50 transition-colors flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#144272] to-[#2C74B3] rounded-full flex items-center justify-center text-2xl">👤</div>
                  <div className="flex-1">
                    <div className="font-semibold text-[#0A2647]">{p.name}</div>
                    <div className="text-gray-400 text-sm">Age {p.age} · {p.condition}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-gray-400 text-xs">Last visit</div>
                    <div className="text-[#0A2647] text-sm font-medium">{p.last}</div>
                  </div>
                  <button className="text-[#2C74B3] text-sm font-medium hover:underline ml-4">View</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {section === "Prescriptions" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="font-bold text-[#0A2647] text-xl mb-4">Add Prescription</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Patient</label>
                  <select value={selectedPatient} onChange={e => setSelectedPatient(e.target.value)}
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-[#0A2647] focus:border-[#2C74B3] focus:outline-none transition-colors text-sm">
                    {patients.map(p => <option key={p.name}>{p.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Diagnosis & Notes</label>
                  <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={4}
                    placeholder="Enter diagnosis, medication, dosage, and instructions..."
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-[#0A2647] focus:border-[#2C74B3] focus:outline-none transition-colors text-sm resize-none" />
                </div>
                <button className="w-full bg-[#2C74B3] text-white font-semibold py-3 rounded-xl hover:bg-[#0A2647] transition-all">
                  Save Prescription
                </button>
              </div>
            </div>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="font-bold text-[#0A2647] text-xl mb-4">Recent Prescriptions</h2>
              {["Atenolol 50mg · John Patient · Mar 15", "Sumatriptan 100mg · Maria Santos · Mar 12", "Metformin 500mg · Robert Kim · Feb 28"].map(r => (
                <div key={r} className="py-3 border-b border-gray-50 last:border-0 text-sm text-gray-500">{r}</div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
