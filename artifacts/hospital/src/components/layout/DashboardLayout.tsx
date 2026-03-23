import React from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { 
  HeartPulse, LayoutDashboard, Users, UserRound, 
  Calendar, FileText, Bell, Settings, LogOut, Receipt, BarChart3
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const [location] = useLocation();

  const getLinks = () => {
    if (!user) return [];
    
    if (user.role === 'admin') {
      return [
        { href: "/dashboard/admin", label: "Overview", icon: LayoutDashboard },
        { href: "/dashboard/admin/appointments", label: "Appointments", icon: Calendar },
        { href: "/dashboard/admin/patients", label: "Patients", icon: UserRound },
        { href: "/dashboard/admin/doctors", label: "Doctors", icon: Users },
        { href: "/dashboard/admin/billing", label: "Billing", icon: Receipt },
        { href: "/dashboard/admin/reports", label: "Reports", icon: FileText },
        { href: "/dashboard/admin/users", label: "System Users", icon: Settings },
      ];
    } else if (user.role === 'doctor') {
      return [
        { href: "/dashboard/doctor", label: "My Schedule", icon: Calendar },
        { href: "/dashboard/doctor/patients", label: "My Patients", icon: UserRound },
        { href: "/dashboard/doctor/reports", label: "Medical Reports", icon: FileText },
      ];
    } else {
      return [
        { href: "/dashboard/patient", label: "My Health", icon: LayoutDashboard },
        { href: "/dashboard/patient/appointments", label: "Appointments", icon: Calendar },
        { href: "/dashboard/patient/reports", label: "Lab Reports", icon: FileText },
        { href: "/dashboard/patient/billing", label: "Billing & Invoices", icon: Receipt },
      ];
    }
  };

  const links = getLinks();

  if (!user) return null; // Or a loading spinner

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col fixed h-full z-10">
        <div className="h-20 flex items-center px-6 border-b border-slate-100">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="bg-primary p-1.5 rounded-lg text-white">
              <HeartPulse className="w-5 h-5" />
            </div>
            <span className="font-display font-bold text-xl text-slate-900 tracking-tight">NovaHealth</span>
          </Link>
        </div>

        <div className="px-6 py-6 text-xs font-semibold text-slate-400 uppercase tracking-wider">
          {user.role} Menu
        </div>

        <nav className="flex-1 px-4 space-y-1">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = location === link.href;
            return (
              <Link key={link.href} href={link.href}>
                <div className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer relative",
                  isActive 
                    ? "text-primary bg-primary/10" 
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                )}>
                  {isActive && (
                    <motion.div 
                      layoutId="sidebar-active" 
                      className="absolute inset-0 bg-primary/10 rounded-xl"
                      initial={false}
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                  <Icon className={cn("w-5 h-5 relative z-10", isActive ? "text-primary" : "text-slate-400")} />
                  <span className="relative z-10">{link.label}</span>
                </div>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-100">
          <div className="flex items-center gap-3 px-3 py-3 bg-slate-50 rounded-xl mb-4">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
              {user.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-900 truncate">{user.name}</p>
              <p className="text-xs text-slate-500 capitalize">{user.role}</p>
            </div>
          </div>
          <Button variant="outline" className="w-full justify-start text-slate-600 border-slate-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200" onClick={logout}>
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 min-h-screen flex flex-col">
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-20 flex items-center justify-between px-8">
          <h1 className="font-display text-xl font-semibold text-slate-800 capitalize">
            {location.split('/').pop()?.replace('-', ' ') || 'Dashboard'}
          </h1>
          <div className="flex items-center gap-4">
            <button className="relative p-2 text-slate-400 hover:bg-slate-100 rounded-full transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-destructive rounded-full"></span>
            </button>
          </div>
        </header>
        <div className="p-8 flex-1">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="max-w-6xl mx-auto"
          >
            {children}
          </motion.div>
        </div>
      </main>
    </div>
  );
}
