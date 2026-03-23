"use client";
import { useState } from "react";
import Navbar from "@/components/Navbar";

const navItems = ["Overview", "Doctors", "Patients", "Appointments"];

const patients = [
  { name: "John Patient", email: "john@example.com", dept: "Cardiology", status: "Active" },
  { name: "Maria Santos", email: "maria@example.com", dept: "Neurology", status: "Active" },
  { name: "Robert Kim", email: "robert@example.com", dept: "Pediatrics", status: "Inactive" },
];

const doctors = [
  { name: "Dr. Sarah Johnson", spec: "Cardiology", patients: 128, status: "Active" },
  { name: "Dr. Michael Chen", spec: "Neurology", patients: 94, status: "Active" },
  { name: "Dr. Aisha Patel", spec: "Pediatrics", patients: 76, status: "Active" },
];

const appointments = [
  { patient: "John Patient", doctor: "Dr. Sarah Johnson", date: "2026-04-01", status: "Confirmed" },
  { patient: "Maria Santos", doctor: "Dr. Michael Chen", date: "2026-04-02", status: "Pending" },
  { patient: "Robert Kim", doctor: "Dr. Aisha Patel", date: "2026-04-03", status: "Cancelled" },
];

const statusColor: Record<string, string> = {
  Active: "bg-green-50 text-[#2A9D8F]",
  Inactive: "bg-gray-100 text-gray-500",
  Confirmed: "bg-blue-50 text-[#2C74B3]",
  Pending: "bg-yellow-50 text-yellow-600",
  Cancelled: "bg-red-50 text-[#E63946]",
};

export default function AdminDashboard() {
  const [active, setActive] = useState("Overview");

  const stats = [
    { label: "Total Patients", val: "12,483", icon: "👥", trend: "+12%" },
    { label: "Total Doctors", val: "524", icon: "👨‍⚕️", trend: "+3%" },
    { label: "Appointments Today", val: "247", icon: "📅", trend: "+8%" },
    { label: "Monthly Revenue", val: "$284K", icon: "💰", trend: "+15%" },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Navbar />
      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 min-h-screen bg-[#0A2647] hidden lg:block">
          <div className="p-6 border-b border-white/10">
            <div className="text-white font-bold text-lg">Admin Portal</div>
            <div className="text-blue-300 text-sm">Hospital Management</div>
          </div>
          <nav className="p-4">
            {navItems.map(n => (
              <button key={n} onClick={() => setActive(n)}
                className={`w-full text-left px-4 py-3 rounded-xl mb-1 text-sm font-medium transition-all ${active === n ? "bg-white/10 text-white" : "text-blue-300 hover:bg-white/5 hover:text-white"}`}>
                {n === "Overview" ? "📊" : n === "Doctors" ? "👨‍⚕️" : n === "Patients" ? "👥" : "📅"} {n}
              </button>
            ))}
          </nav>
        </aside>

        {/* Main */}
        <main className="flex-1 p-8">
          {active === "Overview" && (
            <div>
              <h1 className="text-3xl font-bold text-[#0A2647] mb-2">Dashboard Overview</h1>
              <p className="text-gray-500 mb-8">Welcome back, Admin</p>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {stats.map(s => (
                  <div key={s.label} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <div className="text-3xl mb-3">{s.icon}</div>
                    <div className="text-3xl font-bold text-[#0A2647] mb-1">{s.val}</div>
                    <div className="text-gray-400 text-sm mb-2">{s.label}</div>
                    <span className="text-[#2A9D8F] text-xs font-medium bg-green-50 px-2 py-1 rounded-full">{s.trend}</span>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                  <h2 className="font-bold text-[#0A2647] text-lg mb-4">Patient Growth</h2>
                  <div className="space-y-3">
                    {[["Jan", 85], ["Feb", 72], ["Mar", 91], ["Apr", 78]].map(([m, v]) => (
                      <div key={m} className="flex items-center gap-3">
                        <span className="text-gray-400 text-sm w-8">{m}</span>
                        <div className="flex-1 bg-gray-100 rounded-full h-2">
                          <div className="bg-[#2C74B3] h-2 rounded-full" style={{ width: `${v}%` }}></div>
                        </div>
                        <span className="text-gray-500 text-sm w-8">{v}%</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                  <h2 className="font-bold text-[#0A2647] text-lg mb-4">Revenue (Monthly)</h2>
                  <div className="space-y-3">
                    {[["Jan", "$220K", 75], ["Feb", "$198K", 67], ["Mar", "$260K", 88], ["Apr", "$284K", 96]].map(([m, r, v]) => (
                      <div key={m} className="flex items-center gap-3">
                        <span className="text-gray-400 text-sm w-8">{m}</span>
                        <div className="flex-1 bg-gray-100 rounded-full h-2">
                          <div className="bg-[#2A9D8F] h-2 rounded-full" style={{ width: `${v}%` }}></div>
                        </div>
                        <span className="text-gray-500 text-sm w-16 text-right">{r}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {active === "Doctors" && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-[#0A2647]">Manage Doctors</h1>
                <button className="bg-[#2C74B3] text-white px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-[#0A2647] transition-all">
                  + Add Doctor
                </button>
              </div>
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full">
                  <thead className="bg-[#F8FAFC]">
                    <tr>
                      {["Doctor", "Specialization", "Patients", "Status", "Actions"].map(h => (
                        <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {doctors.map(d => (
                      <tr key={d.name} className="hover:bg-gray-50">
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 bg-gradient-to-br from-[#144272] to-[#2C74B3] rounded-full flex items-center justify-center text-lg">👨‍⚕️</div>
                            <span className="font-medium text-[#0A2647] text-sm">{d.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-gray-500 text-sm">{d.spec}</td>
                        <td className="px-4 py-4 text-gray-500 text-sm">{d.patients}</td>
                        <td className="px-4 py-4">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusColor[d.status]}`}>{d.status}</span>
                        </td>
                        <td className="px-4 py-4 flex gap-2">
                          <button className="text-[#2C74B3] text-xs hover:underline font-medium">Edit</button>
                          <button className="text-[#E63946] text-xs hover:underline font-medium">Remove</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {active === "Patients" && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-[#0A2647]">Manage Patients</h1>
                <input placeholder="Search patients..." className="border-2 border-gray-200 rounded-xl px-4 py-2 text-sm focus:border-[#2C74B3] focus:outline-none" />
              </div>
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full">
                  <thead className="bg-[#F8FAFC]">
                    <tr>
                      {["Patient", "Email", "Department", "Status", "Actions"].map(h => (
                        <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {patients.map(p => (
                      <tr key={p.name} className="hover:bg-gray-50">
                        <td className="px-4 py-4 font-medium text-[#0A2647] text-sm">{p.name}</td>
                        <td className="px-4 py-4 text-gray-500 text-sm">{p.email}</td>
                        <td className="px-4 py-4 text-gray-500 text-sm">{p.dept}</td>
                        <td className="px-4 py-4">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusColor[p.status]}`}>{p.status}</span>
                        </td>
                        <td className="px-4 py-4 flex gap-2">
                          <button className="text-[#2C74B3] text-xs hover:underline font-medium">View</button>
                          <button className="text-[#E63946] text-xs hover:underline font-medium">Remove</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {active === "Appointments" && (
            <div>
              <h1 className="text-3xl font-bold text-[#0A2647] mb-6">Manage Appointments</h1>
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full">
                  <thead className="bg-[#F8FAFC]">
                    <tr>
                      {["Patient", "Doctor", "Date", "Status", "Actions"].map(h => (
                        <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {appointments.map((a, i) => (
                      <tr key={i} className="hover:bg-gray-50">
                        <td className="px-4 py-4 text-sm font-medium text-[#0A2647]">{a.patient}</td>
                        <td className="px-4 py-4 text-sm text-gray-500">{a.doctor}</td>
                        <td className="px-4 py-4 text-sm text-gray-500">{a.date}</td>
                        <td className="px-4 py-4">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusColor[a.status]}`}>{a.status}</span>
                        </td>
                        <td className="px-4 py-4 flex gap-2">
                          <button className="text-[#2C74B3] text-xs hover:underline font-medium">View</button>
                          <button className="text-[#E63946] text-xs hover:underline font-medium">Cancel</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
