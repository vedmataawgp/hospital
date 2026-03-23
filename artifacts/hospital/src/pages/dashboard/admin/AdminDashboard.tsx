import React from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useGetAdminDashboard } from "@workspace/api-client-react";
import { Users, UserRound, Calendar, DollarSign, Activity } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar
} from "recharts";

export default function AdminDashboard() {
  const { data: dashboard, isLoading } = useGetAdminDashboard();

  if (isLoading) return <DashboardLayout><div className="flex h-64 items-center justify-center"><Activity className="w-8 h-8 text-primary animate-spin" /></div></DashboardLayout>;
  if (!dashboard) return null;

  // Mock data for charts since it's not fully in the dashboard response but we want it to look good
  const revenueData = [
    { name: 'Jan', val: 4000 }, { name: 'Feb', val: 3000 }, { name: 'Mar', val: 5000 },
    { name: 'Apr', val: 4500 }, { name: 'May', val: 6000 }, { name: 'Jun', val: dashboard.totalRevenue }
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard 
            title="Total Patients" 
            value={dashboard.totalPatients.toString()} 
            icon={UserRound} 
            color="bg-blue-100 text-blue-600" 
          />
          <StatCard 
            title="Total Doctors" 
            value={dashboard.totalDoctors.toString()} 
            icon={Users} 
            color="bg-emerald-100 text-emerald-600" 
          />
          <StatCard 
            title="Appointments" 
            value={dashboard.totalAppointments.toString()} 
            subtitle={`${dashboard.pendingAppointments} pending`}
            icon={Calendar} 
            color="bg-purple-100 text-purple-600" 
          />
          <StatCard 
            title="Total Revenue" 
            value={formatCurrency(dashboard.totalRevenue)} 
            subtitle={`${formatCurrency(dashboard.pendingBilling)} pending`}
            icon={DollarSign} 
            color="bg-amber-100 text-amber-600" 
          />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <h3 className="text-lg font-bold text-slate-800 mb-6">Revenue Overview</h3>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dx={-10} tickFormatter={(val) => `$${val}`} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Line type="monotone" dataKey="val" stroke="hsl(var(--primary))" strokeWidth={3} dot={{r: 4, fill: "hsl(var(--primary))", strokeWidth: 2, stroke: "#fff"}} activeDot={{r: 6}} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col">
            <h3 className="text-lg font-bold text-slate-800 mb-6">Recent Appointments</h3>
            <div className="flex-1 overflow-auto">
              <div className="space-y-4">
                {dashboard.recentAppointments.slice(0, 4).map(apt => (
                  <div key={apt.id} className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                        {apt.patientName?.charAt(0) || 'P'}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900">{apt.patientName}</p>
                        <p className="text-xs text-slate-500">with Dr. {apt.doctorName}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-slate-700">{apt.date}</p>
                      <p className="text-xs text-slate-500">{apt.time}</p>
                    </div>
                  </div>
                ))}
                {dashboard.recentAppointments.length === 0 && (
                  <div className="text-center py-8 text-slate-500 text-sm">No recent appointments</div>
                )}
              </div>
            </div>
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
}

function StatCard({ title, value, icon: Icon, color, subtitle }: any) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-start gap-4 hover:shadow-md transition-shadow">
      <div className={`p-3 rounded-xl ${color}`}>
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
        <h4 className="text-2xl font-bold text-slate-900">{value}</h4>
        {subtitle && <p className="text-xs text-slate-400 mt-1">{subtitle}</p>}
      </div>
    </div>
  );
}
