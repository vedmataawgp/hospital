"use client";
import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
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

function ApptCard({
  appt,
  busy,
  onConfirm,
  onReject,
  onChat,
}: {
  appt: Appointment;
  busy: boolean;
  onConfirm: () => void;
  onReject: () => void;
  onChat: () => void;
}) {
  const st = String(appt.status).toLowerCase();
  return (
    <div className="p-4 hover:bg-gray-50 transition-colors">
      <div className="flex items-start gap-4">
        <div className="text-center w-20 flex-shrink-0 pt-1">
          <div className="text-[#2C74B3] font-bold text-sm">{appt.time}</div>
          <div className="text-gray-400 text-xs">{appt.date}</div>
        </div>
        <div className="w-10 h-10 bg-gradient-to-br from-[#144272] to-[#2C74B3] rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold text-sm">
          {String(appt.patientName ?? "?").slice(0,1).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-[#0A2647] text-sm">{appt.patientName}</div>
          <div className="text-gray-400 text-xs mb-2.5">{appt.notes || "General consultation"}</div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${statusClass[st] ?? "badge-inactive"}`}>
              {appt.status}
            </span>
            {st === "pending" && (
              <>
                <button
                  onClick={onConfirm}
                  disabled={busy}
                  className="flex items-center gap-1 px-3 py-1 rounded-full bg-green-100 text-green-700 hover:bg-green-200 text-xs font-semibold transition-colors disabled:opacity-50"
                >
                  {busy ? <i className="bi bi-arrow-repeat animate-spin" /> : <i className="bi bi-check-circle-fill" />} Accept
                </button>
                <button
                  onClick={onReject}
                  disabled={busy}
                  className="flex items-center gap-1 px-3 py-1 rounded-full bg-red-100 text-red-600 hover:bg-red-200 text-xs font-semibold transition-colors disabled:opacity-50"
                >
                  {busy ? <i className="bi bi-arrow-repeat animate-spin" /> : <i className="bi bi-x-circle-fill" />} Decline
                </button>
              </>
            )}
            <button
              onClick={onChat}
              className="flex items-center gap-1 px-3 py-1 rounded-full bg-blue-100 text-[#2C74B3] hover:bg-blue-200 text-xs font-semibold transition-colors"
            >
              <i className="bi bi-chat-dots-fill" /> Chat
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DoctorDashboard() {
  const router = useRouter();
  const [section, setSection] = useState("Today");
  const [notes, setNotes] = useState("");
  const [diagnosis, setDiagnosis] = useState("");
  const [selectedPatientId, setSelectedPatientId] = useState<number | "">("");
  const [savedMsg, setSavedMsg] = useState("");
  const [apptStatuses, setApptStatuses] = useState<Record<number, string>>({});
  const [busyId, setBusyId] = useState<number | null>(null);

  const dashFetcher       = useCallback(() => api.doctor.dashboard(), []);
  const patFetcher        = useCallback(() => api.doctor.patients(), []);
  const rxFetcher         = useCallback(() => api.doctor.prescriptions(), []);
  const patsForRxFetcher  = useCallback(() => api.doctor.patients(), []);

  const dash      = useApi(section === "Today"         ? dashFetcher      : null);
  const pats      = useApi(section === "Patients"      ? patFetcher       : null);
  const rxs       = useApi(section === "Prescriptions" ? rxFetcher        : null);
  const patsForRx = useApi(section === "Prescriptions" ? patsForRxFetcher : null);

  const recentAppts: Appointment[] = (dash.data?.recentAppointments ?? []).map((a: Appointment) => ({
    ...a,
    status: (apptStatuses[a.id] ?? a.status) as Appointment["status"],
  }));
  const patients: Patient[]           = pats.data ?? [];
  const prescriptions: Prescription[] = rxs.data ?? [];
  const rxPatients: Patient[]         = patsForRx.data ?? [];

  const saveMutator = useCallback(
    () => api.doctor.savePrescription(selectedPatientId as number, notes, diagnosis),
    [selectedPatientId, notes, diagnosis],
  );
  const [save, { loading: saving, error: saveErr }] = useMutation(saveMutator);

  const handleSave = async () => {
    const result = await save();
    if (result) {
      setNotes(""); setDiagnosis(""); setSelectedPatientId("");
      setSavedMsg("Prescription saved successfully.");
      setTimeout(() => setSavedMsg(""), 3000);
    }
  };

  const handleConfirm = async (id: number) => {
    setBusyId(id);
    try {
      await api.appointments.confirm(id);
      setApptStatuses(p => ({ ...p, [id]: "confirmed" }));
    } catch { /* ignore */ }
    setBusyId(null);
  };

  const handleReject = async (id: number) => {
    setBusyId(id);
    try {
      await api.appointments.cancel(id);
      setApptStatuses(p => ({ ...p, [id]: "cancelled" }));
    } catch { /* ignore */ }
    setBusyId(null);
  };

  const handleChat = (userId?: number) => {
    router.push(userId ? `/chat?userId=${userId}` : "/chat");
  };

  const doctorName = dash.data?.doctor?.name ?? "Doctor";

  return (
    <AuthGuard allowedRoles={["doctor"]}>
    <div className="min-h-screen bg-[#F8FAFC]">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-[#0A2647]">Doctor Dashboard</h1>
            <p className="text-gray-500 text-sm mt-1">
              {dash.loading ? <span className="inline-block w-32 h-4 bg-gray-200 rounded animate-pulse" /> : doctorName}
            </p>
          </div>
          <div className="flex gap-2">
            {["Today", "Patients", "Prescriptions"].map(s => (
              <button key={s} onClick={() => setSection(s)}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                  section === s ? "bg-[#2C74B3] text-white" : "bg-white text-gray-700 border border-gray-200 hover:border-[#2C74B3]"
                }`}>{s}
              </button>
            ))}
          </div>
        </div>

        {/* ── Today ─────────────────────────────────── */}
        {section === "Today" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              {dash.error && <ApiError message={dash.error} onRetry={dash.refetch} compact />}

              {/* Appointment list */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6">
                <div className="p-5 border-b border-gray-100 flex justify-between items-center">
                  <h2 className="font-bold text-[#0A2647] text-xl flex items-center gap-2">
                    <i className="bi bi-calendar-day-fill text-[#2C74B3]" /> Appointments
                  </h2>
                  <span className="bg-[#EFF6FF] text-[#2C74B3] text-sm font-semibold px-3 py-1 rounded-full">
                    {dash.loading
                      ? <span className="inline-block w-12 h-4 bg-blue-100 rounded animate-pulse" />
                      : `${dash.data?.todayAppointments ?? 0} today`}
                  </span>
                </div>
                <div className="divide-y divide-gray-50">
                  {dash.loading
                    ? Array.from({length:3}).map((_,i) => <SkeletonRow key={i} />)
                    : recentAppts.map(a => (
                      <ApptCard
                        key={a.id}
                        appt={a}
                        busy={busyId === a.id}
                        onConfirm={() => handleConfirm(a.id)}
                        onReject={() => handleReject(a.id)}
                        onChat={() => handleChat(a.patientUserId)}
                      />
                    ))}
                  {!dash.loading && recentAppts.length === 0 && (
                    <div className="flex flex-col items-center py-12 text-center">
                      <i className="bi bi-calendar2-check text-4xl text-gray-200 mb-3" />
                      <p className="text-gray-500 text-sm">No appointments yet</p>
                      <p className="text-gray-400 text-xs mt-1">New requests will appear here</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Side column */}
            <div className="space-y-6">
              {/* Quick stats */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h3 className="font-bold text-[#0A2647] mb-4 flex items-center gap-2">
                  <i className="bi bi-graph-up-arrow text-[#2C74B3]" /> Quick Stats
                </h3>
                {[
                  { label: "Today",          val: dash.data?.todayAppointments,  icon: "bi-calendar-check-fill", color: "text-[#2C74B3]" },
                  { label: "Pending",        val: dash.data?.pendingAppointments, icon: "bi-hourglass-split",     color: "text-amber-500" },
                  { label: "Total Patients", val: dash.data?.totalPatients,       icon: "bi-people-fill",         color: "text-[#2A9D8F]" },
                ].map(s => (
                  <div key={s.label} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
                    <div className="flex items-center gap-2 text-sm font-medium text-gray-600">
                      <i className={`bi ${s.icon} ${s.color}`} /> {s.label}
                    </div>
                    <div className="font-bold text-[#0A2647]">
                      {dash.loading
                        ? <div className="w-8 h-4 bg-gray-200 rounded animate-pulse" />
                        : (s.val ?? "—")}
                    </div>
                  </div>
                ))}
              </div>

              {/* Action legend */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                <h3 className="font-bold text-[#0A2647] mb-3 text-sm flex items-center gap-2">
                  <i className="bi bi-info-circle text-[#2C74B3]" /> How it works
                </h3>
                <ul className="space-y-2 text-xs text-gray-600">
                  <li className="flex items-start gap-2">
                    <span className="mt-0.5 w-5 h-5 rounded-full bg-green-100 text-green-700 flex items-center justify-center flex-shrink-0"><i className="bi bi-check" /></span>
                    <span><strong>Accept</strong> a pending request to confirm it</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-0.5 w-5 h-5 rounded-full bg-red-100 text-red-600 flex items-center justify-center flex-shrink-0"><i className="bi bi-x" /></span>
                    <span><strong>Decline</strong> to reject a request</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-0.5 w-5 h-5 rounded-full bg-blue-100 text-[#2C74B3] flex items-center justify-center flex-shrink-0"><i className="bi bi-chat-dots-fill" style={{fontSize:"0.6rem"}} /></span>
                    <span><strong>Chat</strong> directly with the patient</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* ── Patients ─────────────────────────────── */}
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
                  ? Array.from({length:3}).map((_,i) => <SkeletonRow key={i} />)
                  : patients.map(p => (
                    <div key={p.id} className="p-5 hover:bg-gray-50 transition-colors flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-[#144272] to-[#2C74B3] rounded-full flex items-center justify-center text-white font-bold text-lg">
                        {String(p.name ?? "?").slice(0,1).toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-[#0A2647]">{p.name}</div>
                        <div className="text-gray-500 text-sm">
                          {[p.age ? `Age ${p.age}` : null, p.gender, p.bloodGroup].filter(Boolean).join(" · ") || p.email}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <div className="text-gray-400 text-xs">ID</div>
                          <div className="text-[#0A2647] text-sm font-semibold">#{p.id}</div>
                        </div>
                        <button
                          onClick={() => handleChat(p.userId)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 text-[#2C74B3] hover:bg-blue-100 text-xs font-semibold transition-colors"
                        >
                          <i className="bi bi-chat-dots-fill" /> Chat
                        </button>
                      </div>
                    </div>
                  ))}
                {!pats.loading && patients.length === 0 && (
                  <div className="flex flex-col items-center py-12">
                    <i className="bi bi-people text-4xl text-gray-200 mb-3" />
                    <p className="text-gray-400 text-sm">No patients found</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── Prescriptions ───────────────────────── */}
        {section === "Prescriptions" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="font-bold text-[#0A2647] text-xl mb-5 flex items-center gap-2">
                <i className="bi bi-prescription2 text-[#2C74B3]" /> Add Prescription
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Patient</label>
                  {patsForRx.loading
                    ? <div className="h-12 bg-gray-100 rounded-xl animate-pulse" />
                    : (
                      <select value={selectedPatientId}
                        onChange={e => setSelectedPatientId(e.target.value === "" ? "" : Number(e.target.value))}
                        className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-[#0A2647] focus:border-[#2C74B3] focus:outline-none transition-colors text-sm">
                        <option value="">Select patient</option>
                        {rxPatients.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                      </select>
                    )}
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
                  {saving ? <><i className="bi bi-arrow-repeat animate-spin" /> Saving…</> : <><i className="bi bi-check-circle-fill" /> Save Prescription</>}
                </button>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="font-bold text-[#0A2647] text-xl mb-5 flex items-center gap-2">
                <i className="bi bi-clock-history text-[#2C74B3]" /> Recent Prescriptions
              </h2>
              {rxs.error && <ApiError message={rxs.error} onRetry={rxs.refetch} compact />}
              {rxs.loading && <SkeletonText lines={4} />}
              {!rxs.loading && prescriptions.map(r => (
                <div key={r.id} className="flex items-start gap-3 py-3 border-b border-gray-50 last:border-0">
                  <i className="bi bi-capsule-pill text-[#2A9D8F] mt-0.5" />
                  <div>
                    <div className="text-sm font-semibold text-[#0A2647]">{r.notes || r.medication}</div>
                    {r.diagnosis && <div className="text-xs text-[#2C74B3]">{r.diagnosis}</div>}
                    <div className="text-xs text-gray-500">
                      {r.patient_name ?? r.patient} · {r.created_at ? new Date(r.created_at).toLocaleDateString() : r.date}
                    </div>
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
