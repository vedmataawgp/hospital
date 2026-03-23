import React from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { HeartPulse } from "lucide-react";

export function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background flex flex-col selection:bg-primary/20">
      <header className="sticky top-0 z-50 w-full border-b border-white/20 glass-panel">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="bg-primary/10 p-2 rounded-xl group-hover:bg-primary/20 transition-colors">
              <HeartPulse className="w-6 h-6 text-primary" />
            </div>
            <span className="font-display font-bold text-xl tracking-tight text-foreground">
              NovaHealth
            </span>
          </Link>
          
          <nav className="hidden md:flex gap-8 items-center">
            <Link href="/" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Home</Link>
            <Link href="/" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Specialties</Link>
            <Link href="/" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Find a Doctor</Link>
          </nav>

          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost" className="font-medium">Sign In</Button>
            </Link>
            <Link href="/register">
              <Button className="font-medium shadow-primary/25">Book Appointment</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-grow">
        {children}
      </main>

      <footer className="bg-white border-t border-slate-100 py-12 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-slate-500">
          <div className="flex items-center justify-center gap-2 mb-4">
            <HeartPulse className="w-5 h-5 text-primary" />
            <span className="font-display font-bold text-lg text-slate-900">NovaHealth</span>
          </div>
          <p>© {new Date().getFullYear()} NovaHealth Medical Center. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
