"use client";
import { useState, useCallback } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { api } from "@/lib/api";
import { useApi } from "@/lib/useApi";
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
  const [active, setActive] = useState("Dashboard");

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

  const upcoming: Appointment[] = (apts.data ?? []).filter(a => a.status === "Confirmed" || a.status === "Pending");
  const past: Appointment[]     = (apts.data ?? []).filter(a => a.status === "Completed" || a.status === "Cancelled");
  const reports: Report[]       = reps.data ?? [];
  const invoices: Invoice[]     = invs.data ?? [];

  return (
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
                  { label: "Upcoming Appointments", val: dash.data?.upcoming_appointments?.length ?? "—", icon: "bi-calendar-check-fill",   bg: "bg-blue-50 border-blue-100",   ic: "text-[#2C74B3]" },
                  { label: "Reports Available",      val: dash.data?.reports_count ?? "—",                icon: "bi-clipboard2-data-fill",     bg: "bg-green-50 border-green-100", ic: "text-[#2A9D8F]" },
                  { label: "Notifications",          val: dash.data?.notifications_count ?? "—",          icon: "bi-bell-fill",                bg: "bg-amber-50 border-amber-100", ic: "text-amber-600" },
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
                {!dash.loading && dash.data?.upcoming_appointments?.[0] && (
                  <div className="flex items-center gap-4 p-4 bg-[#F8FAFC] rounded-xl border border-gray-100">
                    <div className="w-12 h-12 bg-gradient-to-br from-[#144272] to-[#2C74B3] rounded-full flex items-center justify-center">
                      <i className="bi bi-person-circle text-white text-2xl" />
                    </div>
                    <div className="flex-1">
                      <div className="font-bold text-[#0A2647]">{dash.data.upcoming_appointments[0].doctor}</div>
                      <div className="text-[#2C74B3] text-sm font-medium">{dash.data.upcoming_appointments[0].department}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-[#0A2647] text-sm">{dash.data.upcoming_appointments[0].date}</div>
                      <div className="text-gray-500 text-sm">{dash.data.upcoming_appointments[0].time}</div>
                    </div>
                  </div>
                )}
                {!dash.loading && !dash.data?.upcoming_appointments?.[0] && (
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
                { title: "Upcoming", rows: upcoming },
                { title: "Past Appointments", rows: past },
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
                              {["Doctor","Department","Date","Time","Status","Action"].map(h => (
                                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-50">
                            {section.rows.map((a, i) => (
                              <tr key={i} className="table-row">
                                <td className="px-4 py-4 font-semibold text-[#0A2647] text-sm">{a.doctor}</td>
                                <td className="px-4 py-4 text-gray-600 text-sm">{a.department}</td>
                                <td className="px-4 py-4 text-gray-600 text-sm">{a.date}</td>
                                <td className="px-4 py-4 text-gray-600 text-sm">{a.time}</td>
                                <td className="px-4 py-4">
                                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${statusClass[a.status] ?? ""}`}>{a.status}</span>
                                </td>
                                <td className="px-4 py-4">
                                  <button className="text-[#E63946] text-xs hover:underline font-semibold">Cancel</button>
                                </td>
                              </tr>
                            ))}
                            {section.rows.length === 0 && (
                              <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400 text-sm">No records</td></tr>
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
                        <div className="text-gray-500 text-xs">PDF · {Math.round(r.size_kb / 1024 * 10) / 10} MB · {r.date}</div>
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
                              <td className="px-4 py-4 text-gray-600 text-sm">{inv.date}</td>
                              <td className="px-4 py-4">
                                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${statusClass[inv.status] ?? ""}`}>{inv.status}</span>
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
            <div>
              <h1 className="text-3xl font-bold text-[#0A2647] mb-6">My Profile</h1>
              {prof.error && <ApiError message={prof.error} onRetry={prof.refetch} compact />}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                {prof.loading
                  ? <div className="space-y-4"><SkeletonText lines={6}/></div>
                  : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {[
                        { label: "Full Name",      val: prof.data?.name ?? "John Patient" },
                        { label: "Email",          val: prof.data?.email ?? "john@example.com" },
                        { label: "Phone",          val: prof.data?.phone ?? "+1 (555) 123-4567" },
                        { label: "Date of Birth",  val: prof.data?.date_of_birth ?? "1985-06-15" },
                        { label: "Blood Group",    val: prof.data?.blood_group ?? "A+" },
                        { label: "Allergies",      val: prof.data?.allergies ?? "None" },
                      ].map(f => (
                        <div key={f.label}>
                          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">{f.label}</label>
                          <input defaultValue={f.val}
                            className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-[#0A2647] focus:border-[#2C74B3] focus:outline-none transition-colors text-sm" />
                        </div>
                      ))}
                    </div>
                  )}
                <button className="mt-6 bg-[#2C74B3] text-white font-semibold px-6 py-3 rounded-xl hover:bg-[#0A2647] transition-all flex items-center gap-2">
                  <i className="bi bi-check-circle-fill" /> Save Changes
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
