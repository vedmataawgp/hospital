"use client";
import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import AuthGuard from "@/components/AuthGuard";
import { api } from "@/lib/api";
import { useApi, useMutation } from "@/lib/useApi";
import ApiError from "@/components/ApiError";
import { SkeletonRow, SkeletonText } from "@/components/Skeleton";
import type { Appointment, Invoice, Report } from "@/lib/types";

const sections = [
  { id: "Dashboard",     icon: "speedometer2" },
  { id: "Appointments",  icon: "calendar-check-fill" },
  { id: "Reports",       icon: "clipboard2-data-fill" },
  { id: "Billing",       icon: "receipt" },
  { id: "Profile",       icon: "person-gear" },
];

const statusClass: Record<string, string> = {
  Confirmed: "badge-confirmed",
  Pending:   "badge-pending",
  Completed: "badge-completed",
  Cancelled: "badge-cancelled",
  Paid:      "badge-paid",
  Overdue:   "badge-overdue",
};

export default function PatientDashboard() {
  const router = useRouter();
  const [active, setActive] = useState("Dashboard");
  const [cancelledIds, setCancelledIds] = useState<Set<number>>(new Set());
  const [cancellingId, setCancellingId] = useState<number | null>(null);

  /* ── Profile form state ── */
  const [pName,       setPName]       = useState("");
  const [pEmail,      setPEmail]      = useState("");
  const [pPhone,      setPPhone]      = useState("");
  const [pAge,        setPAge]        = useState("");
  const [pGender,     setPGender]     = useState("");
  const [pAddress,    setPAddress]    = useState("");
  const [pBlood,      setPBlood]      = useState("");
  const [profSaved,   setProfSaved]   = useState("");
  const [oldPwd,      setOldPwd]      = useState("");
  const [newPwd,      setNewPwd]      = useState("");
  const [pwdSaved,    setPwdSaved]    = useState("");

  const dashFetcher  = useCallback(() => api.patient.dashboard(), []);
  const aptFetcher   = useCallback(() => api.appointments.list(), []);
  const reportFetcher= useCallback(() => api.patient.reports(), []);
  const invFetcher   = useCallback(() => api.patient.invoices(), []);
  const profFetcher  = useCallback(() => api.patient.profile(), []);

  const dash   = useApi(active === "Dashboard"    ? dashFetcher   : null);
  const apts   = useApi(active === "Appointments" ? aptFetcher    : null);
  const reps   = useApi(active === "Reports"      ? reportFetcher : null);
  const invs   = useApi(active === "Billing"      ? invFetcher    : null);
  const prof   = useApi(active === "Profile"      ? profFetcher   : null);

  /* populate form when profile loads */
  useEffect(() => {
    if (prof.data) {
      setPName(prof.data.name ?? "");
      setPEmail(prof.data.email ?? "");
      setPPhone((prof.data as unknown as Record<string,string>).phone ?? "");
      setPAge(String((prof.data as unknown as Record<string,string>).age ?? ""));
      setPGender((prof.data as unknown as Record<string,string>).gender ?? "");
      setPAddress((prof.data as unknown as Record<string,string>).address ?? "");
      setPBlood((prof.data as unknown as Record<string,string>).bloodGroup ?? (prof.data as unknown as Record<string,string>).blood_group ?? "");
    }
  }, [prof.data]);

  const updateMutator = useCallback(
    () => api.patient.updateProfile({ name: pName, phone: pPhone, age: Number(pAge), gender: pGender, address: pAddress, bloodGroup: pBlood } as never),
    [pName, pPhone, pAge, pGender, pAddress, pBlood],
  );
  const [updateProf, { loading: updatingProf, error: updateProfErr }] = useMutation(updateMutator);

  const pwdMutator = useCallback(
    () => api.auth.changePassword(oldPwd, newPwd),
    [oldPwd, newPwd],
  );
  const [changePwd, { loading: changingPwd, error: pwdErr }] = useMutation(pwdMutator);

  const handleSaveProfile = async () => {
    const res = await updateProf();
    if (res) { setProfSaved("Profile updated successfully!"); setTimeout(() => setProfSaved(""), 3000); }
  };

  const handleChangePwd = async () => {
    if (!oldPwd || !newPwd) return;
    const res = await changePwd();
    if (res) { setPwdSaved("Password changed!"); setOldPwd(""); setNewPwd(""); setTimeout(() => setPwdSaved(""), 3000); }
  };

  const handleCancelAppt = async (id: number) => {
    setCancellingId(id);
    try {
      await api.appointments.cancel(id);
      setCancelledIds(prev => new Set([...prev, id]));
    } catch { /* ignore */ }
    setCancellingId(null);
  };

  const handleChatWithDoctor = async (doctorUserId?: number) => {
    if (doctorUserId) {
      try { await api.chat.startConversation(doctorUserId); } catch { /* ok */ }
    }
    router.push("/chat");
  };

  const rawAppts: Appointment[]  = apts.data?.data ?? [];
  const allAppts: Appointment[] = rawAppts.map(a =>
    cancelledIds.has(a.id) ? { ...a, status: "cancelled" as const } : a
  );
  const upcoming: Appointment[] = allAppts.filter(a => ["confirmed","pending"].includes(String(a.status).toLowerCase()));
  const past: Appointment[]     = allAppts.filter(a => ["completed","cancelled"].includes(String(a.status).toLowerCase()));
  const reports: Report[]       = reps.data ?? [];
  const invoices: Invoice[]     = invs.data ?? [];

  return (
    <AuthGuard allowedRoles={["patient"]}>
    <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
      <Navbar />
      <div className="flex flex-1 max-w-7xl mx-auto w-full px-4 py-8 gap-8">

        {/* Sidebar */}
        <aside className="w-64 flex-shrink-0 hidden lg:block">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden sticky top-20">
            <div className="bg-gradient-to-br from-[#0A2647] to-[#2C74B3] p-6 text-center">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <i className="bi bi-person-circle text-white text-4xl" />
              </div>
              <div className="text-white font-bold text-lg">John Patient</div>
              {/* CONTRAST: text-sky-200 */}
              <div className="text-sky-200 text-sm mt-0.5">Patient</div>
            </div>
            <nav className="p-4">
              {sections.map(s => (
                <button key={s.id} onClick={() => setActive(s.id)}
                  className={`w-full text-left px-4 py-3 rounded-xl mb-1 text-sm font-semibold transition-all flex items-center gap-3 ${
                    active === s.id
                      ? "bg-[#2C74B3] text-white"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}>
                  <i className={`bi bi-${s.icon} text-base`} />
                  {s.id}
                </button>
              ))}
            </nav>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 min-w-0">

          {/* ── Dashboard overview ─────────────────────────────────── */}
          {active === "Dashboard" && (
            <div>
              <h1 className="text-3xl font-bold text-[#0A2647] mb-1">Welcome back, John!</h1>
              <p className="text-gray-500 mb-8">Here&apos;s your health overview</p>

              {dash.error && <ApiError message={dash.error} onRetry={dash.refetch} compact />}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {[
                  { label: "Upcoming Appointments", val: dash.data?.upcomingAppointments ?? dash.data?.upcomingList?.length ?? "—", icon: "bi-calendar-check-fill",   bg: "bg-blue-50 border-blue-100",   ic: "text-[#2C74B3]" },
                  { label: "Reports Available",      val: dash.data?.totalReports ?? "—",                                          icon: "bi-clipboard2-data-fill",     bg: "bg-green-50 border-green-100", ic: "text-[#2A9D8F]" },
                  { label: "Total Appointments",     val: dash.data?.totalAppointments ?? "—",                                     icon: "bi-calendar2-check-fill",     bg: "bg-amber-50 border-amber-100", ic: "text-amber-600" },
                ].map(c => (
                  <div key={c.label} className={`${c.bg} border rounded-2xl p-6 stat-card`}>
                    <i className={`bi ${c.icon} text-3xl ${c.ic} mb-3 block`} />
                    <div className="text-3xl font-bold text-[#0A2647]">
                      {dash.loading ? <div className="h-8 w-12 bg-gray-200 rounded animate-pulse" /> : c.val}
                    </div>
                    <div className="text-gray-600 text-sm mt-1 font-medium">{c.label}</div>
                  </div>
                ))}
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h2 className="font-bold text-[#0A2647] text-xl mb-4 flex items-center gap-2">
                  <i className="bi bi-calendar-event-fill text-[#2C74B3]" /> Next Appointment
                </h2>
                {dash.loading && <SkeletonRow />}
                {!dash.loading && dash.data?.upcomingList?.[0] && (
                  <div className="flex items-center gap-4 p-4 bg-[#F8FAFC] rounded-xl border border-gray-100">
                    <div className="w-12 h-12 bg-gradient-to-br from-[#144272] to-[#2C74B3] rounded-full flex items-center justify-center">
                      <i className="bi bi-person-circle text-white text-2xl" />
                    </div>
                    <div className="flex-1">
                      <div className="font-bold text-[#0A2647]">{dash.data.upcomingList[0].doctorName}</div>
                      <div className="text-[#2C74B3] text-sm font-medium">{dash.data.upcomingList[0].doctorSpecialization}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-[#0A2647] text-sm">{dash.data.upcomingList[0].date}</div>
                      <div className="text-gray-500 text-sm">{dash.data.upcomingList[0].time}</div>
                    </div>
                  </div>
                )}
                {!dash.loading && !dash.data?.upcomingList?.[0] && (
                  <p className="text-gray-500 text-sm py-4 text-center">No upcoming appointments</p>
                )}
              </div>
            </div>
          )}

          {/* ── Appointments ─────────────────────────────────────────── */}
          {active === "Appointments" && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-[#0A2647]">Appointments</h1>
                <Link href="/appointments"
                  className="bg-[#2C74B3] text-white px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-[#0A2647] transition-all flex items-center gap-1.5">
                  <i className="bi bi-plus-lg" /> Book New
                </Link>
              </div>

              {apts.error && <ApiError message={apts.error} onRetry={apts.refetch} compact />}

              {[
                { title: "Upcoming", rows: upcoming, showActions: true },
                { title: "Past Appointments", rows: past, showActions: false },
              ].map(section => (
                <div key={section.title} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6">
                  <div className="p-4 border-b border-gray-100">
                    <h2 className="font-bold text-[#0A2647]">{section.title}</h2>
                  </div>
                  {apts.loading
                    ? <div className="p-4 space-y-3">{Array.from({length:2}).map((_,i)=><SkeletonRow key={i}/>)}</div>
                    : (
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead className="bg-[#F8FAFC]">
                            <tr>
                              {["Doctor","Specialization","Date","Time","Status", ...(section.showActions ? ["Actions"] : [])].map(h => (
                                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-50">
                            {section.rows.map((a) => (
                              <tr key={a.id} className="table-row">
                                <td className="px-4 py-4 font-semibold text-[#0A2647] text-sm">{a.doctorName}</td>
                                <td className="px-4 py-4 text-gray-600 text-sm">{a.doctorSpecialization}</td>
                                <td className="px-4 py-4 text-gray-600 text-sm">{a.date}</td>
                                <td className="px-4 py-4 text-gray-600 text-sm">{a.time}</td>
                                <td className="px-4 py-4">
                                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${statusClass[a.status] ?? "badge-pending"}`}>{a.status}</span>
                                </td>
                                {section.showActions && (
                                  <td className="px-4 py-4">
                                    <div className="flex items-center gap-2">
                                      <button
                                        onClick={() => handleChatWithDoctor(a.doctorUserId)}
                                        className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-100 text-[#2C74B3] hover:bg-blue-200 text-xs font-semibold transition-colors"
                                      >
                                        <i className="bi bi-chat-dots-fill" /> Chat
                                      </button>
                                      {String(a.status).toLowerCase() !== "cancelled" && (
                                        <button
                                          onClick={() => handleCancelAppt(a.id)}
                                          disabled={cancellingId === a.id}
                                          className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-50 text-red-600 hover:bg-red-100 text-xs font-semibold transition-colors disabled:opacity-50"
                                        >
                                          {cancellingId === a.id
                                            ? <i className="bi bi-arrow-repeat animate-spin" />
                                            : <i className="bi bi-x-circle" />} Cancel
                                        </button>
                                      )}
                                    </div>
                                  </td>
                                )}
                              </tr>
                            ))}
                            {section.rows.length === 0 && (
                              <tr><td colSpan={section.showActions ? 6 : 5} className="px-4 py-8 text-center text-gray-400 text-sm">No records</td></tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    )}
                </div>
              ))}
            </div>
          )}

          {/* ── Reports ──────────────────────────────────────────────── */}
          {active === "Reports" && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-[#0A2647]">Medical Reports</h1>
                <button className="bg-[#2C74B3] text-white px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-[#0A2647] transition-all flex items-center gap-1.5">
                  <i className="bi bi-cloud-upload-fill" /> Upload Report
                </button>
              </div>
              {reps.error && <ApiError message={reps.error} onRetry={reps.refetch} compact />}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                {reps.loading && <div className="space-y-4"><SkeletonText lines={4} /></div>}
                {!reps.loading && reports.map(r => (
                  <div key={r.id} className="flex items-center justify-between py-4 border-b border-gray-50 last:border-0">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[#EFF6FF] rounded-xl flex items-center justify-center">
                        <i className="bi bi-file-earmark-text-fill text-[#2C74B3] text-lg" />
                      </div>
                      <div>
                        <div className="font-semibold text-[#0A2647] text-sm">{r.title}</div>
                        <div className="text-gray-500 text-xs">PDF · {r.reportType ?? "Report"} · {r.createdAt ? new Date(r.createdAt).toLocaleDateString() : ""}</div>
                      </div>
                    </div>
                    <button className="text-[#2C74B3] text-sm font-semibold hover:underline flex items-center gap-1">
                      <i className="bi bi-download" /> Download
                    </button>
                  </div>
                ))}
                {!reps.loading && reports.length === 0 && !reps.error && (
                  <p className="text-gray-400 text-sm text-center py-8">No reports available</p>
                )}
              </div>
            </div>
          )}

          {/* ── Billing ──────────────────────────────────────────────── */}
          {active === "Billing" && (
            <div>
              <h1 className="text-3xl font-bold text-[#0A2647] mb-6">Billing &amp; Payments</h1>
              {invs.error && <ApiError message={invs.error} onRetry={invs.refetch} compact />}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                {invs.loading
                  ? <div className="p-6 space-y-4"><SkeletonText lines={3}/></div>
                  : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-[#F8FAFC]">
                          <tr>
                            {["Invoice #","Description","Amount","Date","Status","Action"].map(h => (
                              <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                          {invoices.map(inv => (
                            <tr key={inv.id} className="table-row">
                              <td className="px-4 py-4 font-mono text-sm text-[#2C74B3] font-semibold">{inv.id}</td>
                              <td className="px-4 py-4 text-gray-700 text-sm">{inv.description}</td>
                              <td className="px-4 py-4 font-bold text-[#0A2647]">{inv.amount}</td>
                              <td className="px-4 py-4 text-gray-600 text-sm">{inv.createdAt ? new Date(String(inv.createdAt)).toLocaleDateString() : ""}</td>
                              <td className="px-4 py-4">
                                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${statusClass[inv.status ?? ""] ?? ""}`}>{inv.status}</span>
                              </td>
                              <td className="px-4 py-4">
                                <button className="text-[#2C74B3] text-xs hover:underline font-semibold flex items-center gap-1">
                                  <i className="bi bi-download" /> Invoice
                                </button>
                              </td>
                            </tr>
                          ))}
                          {invoices.length === 0 && (
                            <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400 text-sm">No invoices</td></tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  )}
              </div>
            </div>
          )}

          {/* ── Profile ──────────────────────────────────────────────── */}
          {active === "Profile" && (
            <div className="space-y-6">
              <h1 className="text-3xl font-bold text-[#0A2647]">My Profile</h1>

              {/* Personal information card */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-br from-[#2C74B3] to-[#38BDF8] rounded-xl flex items-center justify-center">
                    <i className="bi bi-person-fill text-white" />
                  </div>
                  <div>
                    <h2 className="font-bold text-[#0A2647]">Personal Information</h2>
                    <p className="text-gray-400 text-xs">Update your personal details</p>
                  </div>
                </div>

                {prof.error && <ApiError message={prof.error} onRetry={prof.refetch} compact />}
                {prof.loading ? (
                  <div className="space-y-4"><SkeletonText lines={6} /></div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
                      {/* Name */}
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Full Name</label>
                        <input value={pName} onChange={e => setPName(e.target.value)}
                          className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-[#0A2647] focus:border-[#2C74B3] focus:outline-none transition-colors text-sm" />
                      </div>
                      {/* Email – read-only */}
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Email Address</label>
                        <input value={pEmail} readOnly
                          className="w-full border-2 border-gray-100 bg-gray-50 rounded-xl px-4 py-3 text-gray-400 text-sm cursor-not-allowed" />
                      </div>
                      {/* Phone */}
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Phone</label>
                        <input value={pPhone} onChange={e => setPPhone(e.target.value)}
                          className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-[#0A2647] focus:border-[#2C74B3] focus:outline-none transition-colors text-sm" />
                      </div>
                      {/* Age */}
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Age</label>
                        <input value={pAge} onChange={e => setPAge(e.target.value)} type="number" min={0} max={150}
                          className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-[#0A2647] focus:border-[#2C74B3] focus:outline-none transition-colors text-sm" />
                      </div>
                      {/* Gender */}
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Gender</label>
                        <select value={pGender} onChange={e => setPGender(e.target.value)}
                          className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-[#0A2647] focus:border-[#2C74B3] focus:outline-none transition-colors text-sm">
                          <option value="">Select gender</option>
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                      {/* Blood Group */}
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Blood Group</label>
                        <select value={pBlood} onChange={e => setPBlood(e.target.value)}
                          className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-[#0A2647] focus:border-[#2C74B3] focus:outline-none transition-colors text-sm">
                          <option value="">Select blood group</option>
                          {["A+","A-","B+","B-","AB+","AB-","O+","O-"].map(bg => <option key={bg} value={bg}>{bg}</option>)}
                        </select>
                      </div>
                      {/* Address – full width */}
                      <div className="md:col-span-2">
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Address</label>
                        <textarea value={pAddress} onChange={e => setPAddress(e.target.value)} rows={2}
                          className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-[#0A2647] focus:border-[#2C74B3] focus:outline-none transition-colors text-sm resize-none" />
                      </div>
                    </div>

                    {updateProfErr && <p className="text-red-600 text-sm mb-3">{updateProfErr}</p>}
                    {profSaved && (
                      <div className="mb-3 p-3 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm flex items-center gap-2">
                        <i className="bi bi-check-circle-fill" /> {profSaved}
                      </div>
                    )}
                    <button onClick={handleSaveProfile} disabled={updatingProf}
                      className="bg-[#2C74B3] text-white font-semibold px-6 py-3 rounded-xl hover:bg-[#0A2647] transition-all flex items-center gap-2 disabled:opacity-60">
                      {updatingProf ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <i className="bi bi-check-circle-fill" />}
                      Save Changes
                    </button>
                  </>
                )}
              </div>

              {/* Change password card */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-br from-[#E63946] to-[#f87171] rounded-xl flex items-center justify-center">
                    <i className="bi bi-shield-lock-fill text-white" />
                  </div>
                  <div>
                    <h2 className="font-bold text-[#0A2647]">Change Password</h2>
                    <p className="text-gray-400 text-xs">Use a strong password you don&apos;t use elsewhere</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Current Password</label>
                    <input type="password" value={oldPwd} onChange={e => setOldPwd(e.target.value)}
                      className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-[#0A2647] focus:border-[#2C74B3] focus:outline-none transition-colors text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">New Password</label>
                    <input type="password" value={newPwd} onChange={e => setNewPwd(e.target.value)}
                      className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-[#0A2647] focus:border-[#2C74B3] focus:outline-none transition-colors text-sm" />
                  </div>
                </div>
                {pwdErr && <p className="text-red-600 text-sm mb-3">{pwdErr}</p>}
                {pwdSaved && (
                  <div className="mb-3 p-3 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm flex items-center gap-2">
                    <i className="bi bi-check-circle-fill" /> {pwdSaved}
                  </div>
                )}
                <button onClick={handleChangePwd} disabled={changingPwd || !oldPwd || !newPwd}
                  className="bg-[#E63946] text-white font-semibold px-6 py-3 rounded-xl hover:bg-red-700 transition-all flex items-center gap-2 disabled:opacity-60">
                  {changingPwd ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <i className="bi bi-key-fill" />}
                  Change Password
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
    </AuthGuard>
  );
}
