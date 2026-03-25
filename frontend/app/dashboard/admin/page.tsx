"use client";
import { useState, useCallback } from "react";
import Navbar from "@/components/Navbar";
import AuthGuard from "@/components/AuthGuard";
import { api } from "@/lib/api";
import { useApi } from "@/lib/useApi";
import ApiError from "@/components/ApiError";
import { SkeletonRow, SkeletonText } from "@/components/Skeleton";
import type { Doctor, Patient, Appointment } from "@/lib/types";

const navItems = [
  { id: "Overview",     icon: "speedometer2" },
  { id: "Doctors",      icon: "person-badge-fill" },
  { id: "Patients",     icon: "people-fill" },
  { id: "Appointments", icon: "calendar-check-fill" },
];

const statusClass: Record<string, string> = {
  Active:    "badge-active",
  Inactive:  "badge-inactive",
  Confirmed: "badge-confirmed",
  Pending:   "badge-pending",
  Cancelled: "badge-cancelled",
};

export default function AdminDashboard() {
  const [active, setActive] = useState("Overview");
  const [search, setSearch] = useState("");

  const overviewFetcher = useCallback(() => api.admin.overview(), []);
  const doctorsFetcher  = useCallback(() => api.admin.doctors(), []);
  const patsFetcher     = useCallback(() => api.admin.patients(), []);
  const aptsFetcher     = useCallback(() => api.admin.appointments(), []);

  const overview = useApi(active === "Overview"     ? overviewFetcher : null);
  const docs     = useApi(active === "Doctors"      ? doctorsFetcher  : null);
  const pats     = useApi(active === "Patients"     ? patsFetcher     : null);
  const apts     = useApi(active === "Appointments" ? aptsFetcher     : null);

  const doctors: Doctor[]      = docs.data ?? [];
  const patients: Patient[]    = (pats.data ?? []).filter(p =>
    !search || p.name?.toLowerCase().includes(search.toLowerCase()),
  );
  const appointments: Appointment[] = apts.data?.data ?? [];

  const stats = [
    { label: "Total Patients",      val: overview.data?.total_patients,        icon: "bi-people-fill",          color: "text-[#2C74B3]", bg: "bg-blue-50" },
    { label: "Total Doctors",       val: overview.data?.total_doctors,         icon: "bi-person-badge-fill",    color: "text-[#2A9D8F]", bg: "bg-green-50" },
    { label: "Appointments Today",  val: overview.data?.appointments_today,    icon: "bi-calendar-check-fill",  color: "text-amber-600", bg: "bg-amber-50" },
    { label: "Monthly Revenue",     val: overview.data?.monthly_revenue,       icon: "bi-currency-dollar",      color: "text-purple-600",bg: "bg-purple-50" },
  ];

  return (
    <AuthGuard allowedRoles={["admin"]}>
    <div className="min-h-screen bg-[#F8FAFC]">
      <Navbar />
      <div className="flex">

        {/* Sidebar */}
        <aside className="w-64 min-h-screen bg-[#0A2647] hidden lg:block">
          <div className="p-6 border-b border-white/10">
            <div className="text-white font-bold text-lg">Admin Portal</div>
            {/* CONTRAST: text-sky-300 */}
            <div className="text-sky-300 text-sm mt-0.5">Hospital Management</div>
          </div>
          <nav className="p-4">
            {navItems.map(n => (
              <button key={n.id} onClick={() => setActive(n.id)}
                className={`w-full text-left px-4 py-3 rounded-xl mb-1 text-sm font-semibold transition-all flex items-center gap-3 ${
                  active === n.id
                    ? "bg-white/15 text-white"
                    /* CONTRAST: text-sky-200 instead of text-blue-300 */
                    : "text-sky-200 hover:bg-white/8 hover:text-white"
                }`}>
                <i className={`bi bi-${n.icon} text-base`} />
                {n.id}
              </button>
            ))}
          </nav>
        </aside>

        {/* Main */}
        <main className="flex-1 p-8 min-w-0">

          {/* ── Overview ───────────────────────────────────────────── */}
          {active === "Overview" && (
            <div>
              <h1 className="text-3xl font-bold text-[#0A2647] mb-1">Dashboard Overview</h1>
              <p className="text-gray-500 mb-8">Welcome back, Admin</p>

              {overview.error && <ApiError message={overview.error} onRetry={overview.refetch} compact />}

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {stats.map(s => (
                  <div key={s.label} className={`${s.bg} rounded-2xl p-6 border border-transparent stat-card`}>
                    <div className={`${s.bg} w-12 h-12 rounded-xl flex items-center justify-center mb-3`}>
                      <i className={`bi ${s.icon} text-2xl ${s.color}`} />
                    </div>
                    <div className="text-3xl font-bold text-[#0A2647] mb-1">
                      {overview.loading
                        ? <div className="h-8 w-16 bg-gray-200 rounded animate-pulse" />
                        : s.val ?? "—"}
                    </div>
                    <div className="text-gray-600 text-sm font-medium">{s.label}</div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                  <h2 className="font-bold text-[#0A2647] text-lg mb-4 flex items-center gap-2">
                    <i className="bi bi-graph-up text-[#2C74B3]" /> Patient Growth
                  </h2>
                  {overview.loading
                    ? <SkeletonText lines={4} />
                    : (overview.data?.patient_growth ?? [["Jan",85],["Feb",72],["Mar",91],["Apr",78]].map(([m,v])=>({month:m as string,value:v as number}))).map(row => (
                      <div key={row.month} className="flex items-center gap-3 mb-3">
                        <span className="text-gray-500 text-sm w-8">{row.month}</span>
                        <div className="flex-1 bg-gray-100 rounded-full h-2">
                          <div className="bg-[#2C74B3] h-2 rounded-full progress-bar" style={{ width: `${row.value}%` }} />
                        </div>
                        <span className="text-gray-600 text-sm w-8 font-medium">{row.value}%</span>
                      </div>
                    ))}
                </div>
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                  <h2 className="font-bold text-[#0A2647] text-lg mb-4 flex items-center gap-2">
                    <i className="bi bi-currency-dollar text-[#2A9D8F]" /> Revenue (Monthly)
                  </h2>
                  {overview.loading
                    ? <SkeletonText lines={4} />
                    : (overview.data?.revenue_trend ?? [
                        {month:"Jan",amount:"$220K",value:75},{month:"Feb",amount:"$198K",value:67},
                        {month:"Mar",amount:"$260K",value:88},{month:"Apr",amount:"$284K",value:96},
                      ]).map(row => (
                      <div key={row.month} className="flex items-center gap-3 mb-3">
                        <span className="text-gray-500 text-sm w-8">{row.month}</span>
                        <div className="flex-1 bg-gray-100 rounded-full h-2">
                          <div className="bg-[#2A9D8F] h-2 rounded-full progress-bar" style={{ width: `${row.value}%` }} />
                        </div>
                        <span className="text-gray-600 text-sm w-16 text-right font-medium">{row.amount}</span>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          )}

          {/* ── Doctors ────────────────────────────────────────────── */}
          {active === "Doctors" && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-[#0A2647]">Manage Doctors</h1>
                <button className="bg-[#2C74B3] text-white px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-[#0A2647] transition-all flex items-center gap-1.5">
                  <i className="bi bi-plus-lg" /> Add Doctor
                </button>
              </div>
              {docs.error && <ApiError message={docs.error} onRetry={docs.refetch} compact />}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                {docs.loading
                  ? <div className="p-4 space-y-3">{Array.from({length:3}).map((_,i)=><SkeletonRow key={i}/>)}</div>
                  : (
                    <table className="w-full">
                      <thead className="bg-[#F8FAFC]">
                        <tr>
                          {["Doctor","Specialization","Patients","Status","Actions"].map(h => (
                            <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {doctors.map(d => (
                          <tr key={d.id} className="table-row">
                            <td className="px-4 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-9 h-9 bg-gradient-to-br from-[#144272] to-[#2C74B3] rounded-full flex items-center justify-center">
                                  <i className="bi bi-person-circle text-white text-lg" />
                                </div>
                                <span className="font-semibold text-[#0A2647] text-sm">{d.name}</span>
                              </div>
                            </td>
                            <td className="px-4 py-4 text-gray-600 text-sm">{d.specialization}</td>
                            <td className="px-4 py-4 text-gray-600 text-sm">{d.patients_count ?? "—"}</td>
                            <td className="px-4 py-4">
                              <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${statusClass[d.status ?? "Active"] ?? "badge-active"}`}>
                                {d.status ?? "Active"}
                              </span>
                            </td>
                            <td className="px-4 py-4 flex gap-3">
                              <button className="text-[#2C74B3] text-xs font-semibold hover:underline">Edit</button>
                              <button className="text-[#E63946] text-xs font-semibold hover:underline">Remove</button>
                            </td>
                          </tr>
                        ))}
                        {doctors.length === 0 && (
                          <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400 text-sm">No doctors found</td></tr>
                        )}
                      </tbody>
                    </table>
                  )}
              </div>
            </div>
          )}

          {/* ── Patients ───────────────────────────────────────────── */}
          {active === "Patients" && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-[#0A2647]">Manage Patients</h1>
                <div className="relative">
                  <i className="bi bi-search absolute left-3.5 top-3 text-gray-400 text-sm" />
                  <input
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Search patients..."
                    className="border-2 border-gray-200 rounded-xl pl-9 pr-4 py-2 text-sm text-[#0A2647] placeholder-gray-400 focus:border-[#2C74B3] focus:outline-none transition-colors"
                  />
                </div>
              </div>
              {pats.error && <ApiError message={pats.error} onRetry={pats.refetch} compact />}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                {pats.loading
                  ? <div className="p-4 space-y-3">{Array.from({length:3}).map((_,i)=><SkeletonRow key={i}/>)}</div>
                  : (
                    <table className="w-full">
                      <thead className="bg-[#F8FAFC]">
                        <tr>
                          {["Patient","Email","Department","Status","Actions"].map(h => (
                            <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {patients.map(p => (
                          <tr key={p.id} className="table-row">
                            <td className="px-4 py-4 font-semibold text-[#0A2647] text-sm">{p.name}</td>
                            <td className="px-4 py-4 text-gray-600 text-sm">{p.email}</td>
                            <td className="px-4 py-4 text-gray-600 text-sm">{p.department}</td>
                            <td className="px-4 py-4">
                              <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${statusClass[p.status ?? "Active"] ?? "badge-active"}`}>
                                {p.status ?? "Active"}
                              </span>
                            </td>
                            <td className="px-4 py-4 flex gap-3">
                              <button className="text-[#2C74B3] text-xs font-semibold hover:underline">View</button>
                              <button className="text-[#E63946] text-xs font-semibold hover:underline">Remove</button>
                            </td>
                          </tr>
                        ))}
                        {patients.length === 0 && (
                          <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400 text-sm">No patients found</td></tr>
                        )}
                      </tbody>
                    </table>
                  )}
              </div>
            </div>
          )}

          {/* ── Appointments ───────────────────────────────────────── */}
          {active === "Appointments" && (
            <div>
              <h1 className="text-3xl font-bold text-[#0A2647] mb-6">Manage Appointments</h1>
              {apts.error && <ApiError message={apts.error} onRetry={apts.refetch} compact />}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                {apts.loading
                  ? <div className="p-4 space-y-3">{Array.from({length:3}).map((_,i)=><SkeletonRow key={i}/>)}</div>
                  : (
                    <table className="w-full">
                      <thead className="bg-[#F8FAFC]">
                        <tr>
                          {["Patient","Doctor","Date","Status","Actions"].map(h => (
                            <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {appointments.map((a, i) => (
                          <tr key={i} className="table-row">
                            <td className="px-4 py-4 font-semibold text-[#0A2647] text-sm">{a.patientName}</td>
                            <td className="px-4 py-4 text-gray-600 text-sm">{a.doctorName}</td>
                            <td className="px-4 py-4 text-gray-600 text-sm">{a.date}</td>
                            <td className="px-4 py-4">
                              <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${statusClass[a.status] ?? ""}`}>{a.status}</span>
                            </td>
                            <td className="px-4 py-4 flex gap-3">
                              <button className="text-[#2C74B3] text-xs font-semibold hover:underline">View</button>
                              <button className="text-[#E63946] text-xs font-semibold hover:underline">Cancel</button>
                            </td>
                          </tr>
                        ))}
                        {appointments.length === 0 && (
                          <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400 text-sm">No appointments</td></tr>
                        )}
                      </tbody>
                    </table>
                  )}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
    </AuthGuard>
  );
}
