"use client";
import { useState, useCallback } from "react";
import Navbar from "@/components/Navbar";
import { api } from "@/lib/api";
import { useApi, useMutation } from "@/lib/useApi";
import ApiError from "@/components/ApiError";
import { SkeletonRow, SkeletonText } from "@/components/Skeleton";
import type { Appointment, Patient, Prescription } from "@/lib/types";

const statusClass: Record<string, string> = {
  Upcoming:    "badge-confirmed",
  "In Progress":"badge-completed",
  Completed:   "badge-inactive",
};

export default function DoctorDashboard() {
  const [section, setSection] = useState("Today");
  const [notes, setNotes] = useState("");
  const [selectedPatient, setSelectedPatient] = useState("");
  const [savedMsg, setSavedMsg] = useState("");

  const dashFetcher = useCallback(() => api.doctor.dashboard(), []);
  const patFetcher  = useCallback(() => api.doctor.patients(), []);
  const rxFetcher   = useCallback(() => api.doctor.prescriptions(), []);

  const dash = useApi(section === "Today"        ? dashFetcher : null);
  const pats = useApi(section === "Patients"     ? patFetcher  : null);
  const rxs  = useApi(section === "Prescriptions"? rxFetcher   : null);

  const today: Appointment[] = dash.data?.today_appointments ?? [];
  const patients: Patient[]  = pats.data ?? [];
  const prescriptions: Prescription[] = rxs.data ?? [];

  const saveMutator = useCallback(
    () => api.doctor.savePrescription(selectedPatient, notes),
    [selectedPatient, notes],
  );
  const [save, { loading: saving, error: saveErr }] = useMutation(saveMutator);

  const handleSave = async () => {
    const result = await save();
    if (result) { setNotes(""); setSavedMsg("Prescription saved successfully."); setTimeout(() => setSavedMsg(""), 3000); }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-[#0A2647]">Doctor Dashboard</h1>
            <p className="text-gray-500 text-sm mt-1">Dr. Sarah Johnson — Cardiology</p>
          </div>
          <div className="flex gap-2">
            {["Today", "Patients", "Prescriptions"].map(s => (
              <button key={s} onClick={() => setSection(s)}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                  section === s
                    ? "bg-[#2C74B3] text-white"
                    : "bg-white text-gray-700 border border-gray-200 hover:border-[#2C74B3]"
                }`}>
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Today */}
        {section === "Today" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              {dash.error && <ApiError message={dash.error} onRetry={dash.refetch} compact />}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-5 border-b border-gray-100 flex justify-between items-center">
                  <h2 className="font-bold text-[#0A2647] text-xl flex items-center gap-2">
                    <i className="bi bi-calendar-day-fill text-[#2C74B3]" />
                    Today&apos;s Appointments
                  </h2>
                  <span className="bg-[#EFF6FF] text-[#2C74B3] text-sm font-semibold px-3 py-1 rounded-full">
                    {today.length} appointments
                  </span>
                </div>
                <div className="divide-y divide-gray-50">
                  {dash.loading
                    ? Array.from({length:3}).map((_,i)=><SkeletonRow key={i}/>)
                    : today.map((a, i) => (
                      <div key={i} className="p-4 hover:bg-gray-50 transition-colors flex items-center gap-4">
                        <div className="text-center w-20 flex-shrink-0">
                          <div className="text-[#2C74B3] font-bold text-sm">{a.time}</div>
                        </div>
                        <div className="w-10 h-10 bg-gradient-to-br from-[#144272] to-[#2C74B3] rounded-full flex items-center justify-center flex-shrink-0">
                          <i className="bi bi-person-circle text-white text-xl" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-[#0A2647] text-sm">{a.patient}</div>
                          <div className="text-gray-500 text-xs">{a.reason}</div>
                        </div>
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${statusClass[a.status ?? ""] ?? "badge-inactive"}`}>
                          {a.status}
                        </span>
                        <button className="text-[#2C74B3] text-sm font-semibold hover:underline ml-2">Start</button>
                      </div>
                    ))}
                  {!dash.loading && today.length === 0 && (
                    <p className="text-gray-400 text-sm text-center py-8">No appointments today</p>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h3 className="font-bold text-[#0A2647] mb-4 flex items-center gap-2">
                  <i className="bi bi-graph-up-arrow text-[#2C74B3]" />
                  Quick Stats
                </h3>
                {[
                  { label: "Today",         val: dash.data?.today_appointments?.length, icon: "bi-calendar-check-fill", color: "text-[#2C74B3]" },
                  { label: "This Week",     val: dash.data?.week_appointments_count,    icon: "bi-bar-chart-fill",       color: "text-[#2A9D8F]" },
                  { label: "Total Patients",val: dash.data?.total_patients,             icon: "bi-people-fill",          color: "text-amber-600" },
                ].map(s => (
                  <div key={s.label} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
                    <div className={`flex items-center gap-2 text-sm font-medium text-gray-600`}>
                      <i className={`bi ${s.icon} ${s.color}`} />
                      {s.label}
                    </div>
                    <div className="font-bold text-[#0A2647]">
                      {dash.loading ? <div className="w-8 h-4 bg-gray-200 rounded animate-pulse" /> : (s.val ?? "—")}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Patients */}
        {section === "Patients" && (
          <div>
            {pats.error && <ApiError message={pats.error} onRetry={pats.refetch} compact />}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
              <div className="p-5 border-b border-gray-100">
                <h2 className="font-bold text-[#0A2647] text-xl flex items-center gap-2">
                  <i className="bi bi-people-fill text-[#2C74B3]" /> My Patients
                </h2>
              </div>
              <div className="divide-y divide-gray-50">
                {pats.loading
                  ? Array.from({length:3}).map((_,i)=><SkeletonRow key={i}/>)
                  : patients.map(p => (
                    <div key={p.id} className="p-5 hover:bg-gray-50 transition-colors flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-[#144272] to-[#2C74B3] rounded-full flex items-center justify-center">
                        <i className="bi bi-person-circle text-white text-2xl" />
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-[#0A2647]">{p.name}</div>
                        <div className="text-gray-500 text-sm">Age {p.age} · {p.condition}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-gray-400 text-xs">Last visit</div>
                        <div className="text-[#0A2647] text-sm font-semibold">{p.last_visit}</div>
                      </div>
                      <button className="text-[#2C74B3] text-sm font-semibold hover:underline ml-4">View</button>
                    </div>
                  ))}
                {!pats.loading && patients.length === 0 && (
                  <p className="text-gray-400 text-sm text-center py-8">No patients found</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Prescriptions */}
        {section === "Prescriptions" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="font-bold text-[#0A2647] text-xl mb-5 flex items-center gap-2">
                <i className="bi bi-prescription2 text-[#2C74B3]" />
                Add Prescription
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Patient</label>
                  <select value={selectedPatient} onChange={e => setSelectedPatient(e.target.value)}
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-[#0A2647] focus:border-[#2C74B3] focus:outline-none transition-colors text-sm">
                    <option value="">Select patient</option>
                    {pats.data?.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Diagnosis &amp; Notes</label>
                  <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={4}
                    placeholder="Enter diagnosis, medication, dosage, and instructions..."
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-[#0A2647] placeholder-gray-400 focus:border-[#2C74B3] focus:outline-none transition-colors text-sm resize-none" />
                </div>
                {saveErr && <p className="text-red-600 text-sm flex items-center gap-1"><i className="bi bi-exclamation-circle-fill" /> {saveErr}</p>}
                {savedMsg && <p className="text-green-700 text-sm flex items-center gap-1"><i className="bi bi-check-circle-fill" /> {savedMsg}</p>}
                <button onClick={handleSave} disabled={saving || !selectedPatient || !notes.trim()}
                  className="w-full bg-[#2C74B3] text-white font-semibold py-3 rounded-xl hover:bg-[#0A2647] transition-all flex items-center justify-center gap-2 disabled:opacity-60">
                  {saving ? <><i className="bi bi-arrow-repeat animate-spin" /> Saving...</> : <><i className="bi bi-check-circle-fill" /> Save Prescription</>}
                </button>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="font-bold text-[#0A2647] text-xl mb-5 flex items-center gap-2">
                <i className="bi bi-clock-history text-[#2C74B3]" />
                Recent Prescriptions
              </h2>
              {rxs.error && <ApiError message={rxs.error} onRetry={rxs.refetch} compact />}
              {rxs.loading && <SkeletonText lines={3} />}
              {!rxs.loading && prescriptions.map(r => (
                <div key={r.id} className="flex items-center gap-3 py-3 border-b border-gray-50 last:border-0">
                  <i className="bi bi-capsule-pill text-[#2A9D8F]" />
                  <div>
                    <div className="text-sm font-semibold text-[#0A2647]">{r.medication}</div>
                    <div className="text-xs text-gray-500">{r.patient} · {r.date}</div>
                  </div>
                </div>
              ))}
              {!rxs.loading && prescriptions.length === 0 && !rxs.error && (
                <p className="text-gray-400 text-sm text-center py-4">No prescriptions yet</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
