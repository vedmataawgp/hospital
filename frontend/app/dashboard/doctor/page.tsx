"use client";
import { useState, useCallback } from "react";
import Navbar from "@/components/Navbar";
import AuthGuard from "@/components/AuthGuard";
import { api } from "@/lib/api";
import { useApi, useMutation } from "@/lib/useApi";
import ApiError from "@/components/ApiError";
import { SkeletonRow, SkeletonText } from "@/components/Skeleton";
import type { Appointment, Patient, Prescription } from "@/lib/types";

const statusClass: Record<string, string> = {
  pending:    "badge-warning",
  confirmed:  "badge-confirmed",
  completed:  "badge-inactive",
  cancelled:  "badge-cancelled",
};

export default function DoctorDashboard() {
  const [section, setSection] = useState("Today");
  const [notes, setNotes] = useState("");
  const [diagnosis, setDiagnosis] = useState("");
  const [selectedPatientId, setSelectedPatientId] = useState<number | "">("");
  const [savedMsg, setSavedMsg] = useState("");

  const dashFetcher = useCallback(() => api.doctor.dashboard(), []);
  const patFetcher  = useCallback(() => api.doctor.patients(), []);
  const rxFetcher   = useCallback(() => api.doctor.prescriptions(), []);
  const patsForRxFetcher = useCallback(() => api.doctor.patients(), []);

  const dash = useApi(section === "Today"         ? dashFetcher : null);
  const pats = useApi(section === "Patients"      ? patFetcher  : null);
  const rxs  = useApi(section === "Prescriptions" ? rxFetcher   : null);
  const patsForRx = useApi(section === "Prescriptions" ? patsForRxFetcher : null);

  const recentAppts: Appointment[] = dash.data?.recentAppointments ?? [];
  const patients: Patient[]        = pats.data ?? [];
  const prescriptions: Prescription[] = rxs.data ?? [];
  const rxPatients: Patient[]      = patsForRx.data ?? [];

  const saveMutator = useCallback(
    () => api.doctor.savePrescription(selectedPatientId as number, notes, diagnosis),
    [selectedPatientId, notes, diagnosis],
  );
  const [save, { loading: saving, error: saveErr }] = useMutation(saveMutator);

  const handleSave = async () => {
    const result = await save();
    if (result) {
      setNotes("");
      setDiagnosis("");
      setSelectedPatientId("");
      setSavedMsg("Prescription saved successfully.");
      setTimeout(() => setSavedMsg(""), 3000);
    }
  };

  const doctorName = dash.data?.doctor?.name ?? "Doctor";

  return (
    <AuthGuard allowedRoles={["doctor"]}>
    <div className="min-h-screen bg-[#F8FAFC]">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-[#0A2647]">Doctor Dashboard</h1>
            <p className="text-gray-500 text-sm mt-1">{doctorName}</p>
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
                    {dash.data?.todayAppointments ?? 0} today
                  </span>
                </div>
                <div className="divide-y divide-gray-50">
                  {dash.loading
                    ? Array.from({length:3}).map((_,i)=><SkeletonRow key={i}/>)
                    : recentAppts.map((a) => (
                      <div key={a.id} className="p-4 hover:bg-gray-50 transition-colors flex items-center gap-4">
                        <div className="text-center w-20 flex-shrink-0">
                          <div className="text-[#2C74B3] font-bold text-sm">{a.time}</div>
                          <div className="text-gray-400 text-xs">{a.date}</div>
                        </div>
                        <div className="w-10 h-10 bg-gradient-to-br from-[#144272] to-[#2C74B3] rounded-full flex items-center justify-center flex-shrink-0">
                          <i className="bi bi-person-circle text-white text-xl" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-[#0A2647] text-sm">{a.patientName}</div>
                          <div className="text-gray-500 text-xs">{a.notes || a.reason || "General consultation"}</div>
                        </div>
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${statusClass[String(a.status).toLowerCase()] ?? "badge-inactive"}`}>
                          {a.status}
                        </span>
                      </div>
                    ))}
                  {!dash.loading && recentAppts.length === 0 && (
                    <p className="text-gray-400 text-sm text-center py-8">No appointments yet</p>
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
                  { label: "Today",          val: dash.data?.todayAppointments,   icon: "bi-calendar-check-fill", color: "text-[#2C74B3]" },
                  { label: "Pending",        val: dash.data?.pendingAppointments,  icon: "bi-hourglass-split",     color: "text-amber-500" },
                  { label: "Total Patients", val: dash.data?.totalPatients,        icon: "bi-people-fill",         color: "text-[#2A9D8F]" },
                ].map(s => (
                  <div key={s.label} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
                    <div className="flex items-center gap-2 text-sm font-medium text-gray-600">
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
                        <div className="text-gray-500 text-sm">
                          {[p.age ? `Age ${p.age}` : null, p.gender, p.bloodGroup].filter(Boolean).join(" · ") || p.email}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-gray-400 text-xs">ID</div>
                        <div className="text-[#0A2647] text-sm font-semibold">#{p.id}</div>
                      </div>
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
                  <select value={selectedPatientId} onChange={e => setSelectedPatientId(e.target.value === "" ? "" : Number(e.target.value))}
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-[#0A2647] focus:border-[#2C74B3] focus:outline-none transition-colors text-sm">
                    <option value="">Select patient</option>
                    {rxPatients.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Diagnosis</label>
                  <input type="text" value={diagnosis} onChange={e => setDiagnosis(e.target.value)}
                    placeholder="e.g. Mild hypertension"
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-[#0A2647] placeholder-gray-400 focus:border-[#2C74B3] focus:outline-none transition-colors text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Medication & Instructions</label>
                  <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={4}
                    placeholder="Enter medication, dosage, and instructions..."
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-[#0A2647] placeholder-gray-400 focus:border-[#2C74B3] focus:outline-none transition-colors text-sm resize-none" />
                </div>
                {saveErr && <p className="text-red-600 text-sm flex items-center gap-1"><i className="bi bi-exclamation-circle-fill" /> {saveErr}</p>}
                {savedMsg && <p className="text-green-700 text-sm flex items-center gap-1"><i className="bi bi-check-circle-fill" /> {savedMsg}</p>}
                <button onClick={handleSave} disabled={saving || !selectedPatientId || !notes.trim()}
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
                <div key={r.id} className="flex items-start gap-3 py-3 border-b border-gray-50 last:border-0">
                  <i className="bi bi-capsule-pill text-[#2A9D8F] mt-0.5" />
                  <div>
                    <div className="text-sm font-semibold text-[#0A2647]">{r.notes || r.medication}</div>
                    {r.diagnosis && <div className="text-xs text-[#2C74B3]">{r.diagnosis}</div>}
                    <div className="text-xs text-gray-500">{r.patient_name ?? r.patient} · {r.created_at ? new Date(r.created_at).toLocaleDateString() : r.date}</div>
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
    </AuthGuard>
  );
}
