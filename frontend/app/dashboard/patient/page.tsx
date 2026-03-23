"use client";
import { useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";

const sections = ["Dashboard", "Appointments", "Reports", "Billing", "Profile"];

const upcomingAppointments = [
  { doctor: "Dr. Sarah Johnson", dept: "Cardiology", date: "2026-04-01", time: "10:00 AM", status: "Confirmed" },
  { doctor: "Dr. Michael Chen", dept: "Neurology", date: "2026-04-08", time: "2:30 PM", status: "Pending" },
];

const pastAppointments = [
  { doctor: "Dr. Aisha Patel", dept: "Pediatrics", date: "2026-03-15", time: "11:00 AM", status: "Completed" },
  { doctor: "Dr. James Wilson", dept: "Orthopedics", date: "2026-03-01", time: "9:00 AM", status: "Completed" },
];

const invoices = [
  { id: "INV-001", desc: "Cardiology Consultation", amount: "$150", date: "2026-03-15", status: "Paid" },
  { id: "INV-002", desc: "Lab Tests", amount: "$85", date: "2026-03-01", status: "Paid" },
  { id: "INV-003", desc: "Neurology Consultation", amount: "$200", date: "2026-02-20", status: "Pending" },
];

const statusColor: Record<string, string> = {
  Confirmed: "bg-blue-50 text-[#2C74B3]",
  Pending: "bg-yellow-50 text-yellow-600",
  Completed: "bg-green-50 text-[#2A9D8F]",
  Paid: "bg-green-50 text-[#2A9D8F]",
  Cancelled: "bg-red-50 text-[#E63946]",
};

export default function PatientDashboard() {
  const [active, setActive] = useState("Dashboard");

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
      <Navbar />
      <div className="flex flex-1 max-w-7xl mx-auto w-full px-4 py-8 gap-8">
        {/* Sidebar */}
        <aside className="w-64 flex-shrink-0 hidden lg:block">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-br from-[#0A2647] to-[#2C74B3] p-6 text-center">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center text-3xl mx-auto mb-3">👤</div>
              <div className="text-white font-bold">John Patient</div>
              <div className="text-blue-200 text-sm">Patient</div>
            </div>
            <nav className="p-4">
              {sections.map(s => (
                <button key={s} onClick={() => setActive(s)}
                  className={`w-full text-left px-4 py-3 rounded-xl mb-1 text-sm font-medium transition-all ${active === s ? "bg-[#2C74B3] text-white" : "text-gray-600 hover:bg-gray-50"}`}>
                  {s === "Dashboard" ? "📊" : s === "Appointments" ? "📅" : s === "Reports" ? "📋" : s === "Billing" ? "💳" : "👤"} {s}
                </button>
              ))}
            </nav>
          </div>
        </aside>

        {/* Main */}
        <main className="flex-1 min-w-0">
          {active === "Dashboard" && (
            <div>
              <h1 className="text-3xl font-bold text-[#0A2647] mb-2">Welcome back, John! 👋</h1>
              <p className="text-gray-500 mb-8">Here&apos;s your health overview</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {[
                  { label: "Upcoming Appointments", val: "2", icon: "📅", color: "bg-blue-50 border-blue-100" },
                  { label: "Reports Available", val: "5", icon: "📋", color: "bg-green-50 border-green-100" },
                  { label: "Unread Notifications", val: "3", icon: "🔔", color: "bg-yellow-50 border-yellow-100" },
                ].map(c => (
                  <div key={c.label} className={`${c.color} border rounded-2xl p-6`}>
                    <div className="text-4xl mb-3">{c.icon}</div>
                    <div className="text-3xl font-bold text-[#0A2647]">{c.val}</div>
                    <div className="text-gray-500 text-sm mt-1">{c.label}</div>
                  </div>
                ))}
              </div>
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h2 className="font-bold text-[#0A2647] text-xl mb-4">Next Appointment</h2>
                {upcomingAppointments[0] && (
                  <div className="flex items-center gap-4 p-4 bg-[#F8FAFC] rounded-xl">
                    <div className="w-12 h-12 bg-gradient-to-br from-[#144272] to-[#2C74B3] rounded-full flex items-center justify-center text-2xl">👨‍⚕️</div>
                    <div className="flex-1">
                      <div className="font-bold text-[#0A2647]">{upcomingAppointments[0].doctor}</div>
                      <div className="text-[#2C74B3] text-sm">{upcomingAppointments[0].dept}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-[#0A2647] text-sm">{upcomingAppointments[0].date}</div>
                      <div className="text-gray-400 text-sm">{upcomingAppointments[0].time}</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {active === "Appointments" && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-[#0A2647]">Appointments</h1>
                <Link href="/appointments" className="bg-[#2C74B3] text-white px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-[#0A2647] transition-all">
                  + Book New
                </Link>
              </div>
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6">
                <div className="p-4 border-b border-gray-100">
                  <h2 className="font-bold text-[#0A2647]">Upcoming</h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-[#F8FAFC]">
                      <tr>
                        {["Doctor", "Department", "Date", "Time", "Status", "Actions"].map(h => (
                          <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {upcomingAppointments.map((a, i) => (
                        <tr key={i} className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-4 font-medium text-[#0A2647] text-sm">{a.doctor}</td>
                          <td className="px-4 py-4 text-gray-500 text-sm">{a.dept}</td>
                          <td className="px-4 py-4 text-gray-500 text-sm">{a.date}</td>
                          <td className="px-4 py-4 text-gray-500 text-sm">{a.time}</td>
                          <td className="px-4 py-4">
                            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusColor[a.status]}`}>{a.status}</span>
                          </td>
                          <td className="px-4 py-4">
                            <button className="text-[#E63946] text-xs hover:underline font-medium">Cancel</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-4 border-b border-gray-100">
                  <h2 className="font-bold text-[#0A2647]">Past Appointments</h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-[#F8FAFC]">
                      <tr>
                        {["Doctor", "Department", "Date", "Status", "Actions"].map(h => (
                          <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {pastAppointments.map((a, i) => (
                        <tr key={i} className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-4 font-medium text-[#0A2647] text-sm">{a.doctor}</td>
                          <td className="px-4 py-4 text-gray-500 text-sm">{a.dept}</td>
                          <td className="px-4 py-4 text-gray-500 text-sm">{a.date}</td>
                          <td className="px-4 py-4">
                            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusColor[a.status]}`}>{a.status}</span>
                          </td>
                          <td className="px-4 py-4">
                            <button className="text-[#2C74B3] text-xs hover:underline font-medium">View</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {active === "Reports" && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-[#0A2647]">Medical Reports</h1>
                <button className="bg-[#2C74B3] text-white px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-[#0A2647] transition-all">
                  ↑ Upload Report
                </button>
              </div>
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                {["Blood Test Results - Mar 2026", "ECG Report - Feb 2026", "X-Ray Chest - Jan 2026", "MRI Brain Scan - Dec 2025"].map(r => (
                  <div key={r} className="flex items-center justify-between py-4 border-b border-gray-50 last:border-0">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[#F8FAFC] rounded-xl flex items-center justify-center text-xl">📄</div>
                      <div>
                        <div className="font-medium text-[#0A2647] text-sm">{r}</div>
                        <div className="text-gray-400 text-xs">PDF · 2.1 MB</div>
                      </div>
                    </div>
                    <button className="text-[#2C74B3] text-sm font-medium hover:underline">↓ Download</button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {active === "Billing" && (
            <div>
              <h1 className="text-3xl font-bold text-[#0A2647] mb-6">Billing & Payments</h1>
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-[#F8FAFC]">
                      <tr>
                        {["Invoice #", "Description", "Amount", "Date", "Status", "Action"].map(h => (
                          <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {invoices.map(inv => (
                        <tr key={inv.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-4 font-mono text-sm text-[#2C74B3] font-medium">{inv.id}</td>
                          <td className="px-4 py-4 text-gray-600 text-sm">{inv.desc}</td>
                          <td className="px-4 py-4 font-bold text-[#0A2647]">{inv.amount}</td>
                          <td className="px-4 py-4 text-gray-500 text-sm">{inv.date}</td>
                          <td className="px-4 py-4">
                            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusColor[inv.status]}`}>{inv.status}</span>
                          </td>
                          <td className="px-4 py-4">
                            <button className="text-[#2C74B3] text-xs hover:underline font-medium">↓ Invoice</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {active === "Profile" && (
            <div>
              <h1 className="text-3xl font-bold text-[#0A2647] mb-6">My Profile</h1>
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[
                    { label: "Full Name", val: "John Patient" },
                    { label: "Email", val: "john@example.com" },
                    { label: "Phone", val: "+1 (555) 123-4567" },
                    { label: "Date of Birth", val: "1985-06-15" },
                    { label: "Blood Group", val: "A+" },
                    { label: "Allergies", val: "None" },
                  ].map(f => (
                    <div key={f.label}>
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">{f.label}</label>
                      <input defaultValue={f.val} className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-[#0A2647] focus:border-[#2C74B3] focus:outline-none transition-colors text-sm" />
                    </div>
                  ))}
                </div>
                <button className="mt-6 bg-[#2C74B3] text-white font-semibold px-6 py-3 rounded-xl hover:bg-[#0A2647] transition-all">
                  Save Changes
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
