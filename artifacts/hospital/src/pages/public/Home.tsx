import React from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { motion } from "framer-motion";
import { Activity, ShieldCheck, Clock, ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <PublicLayout>
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <img 
            src={`${import.meta.env.BASE_URL}images/hero-bg.png`}
            alt="Medical background" 
            className="w-full h-full object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-white/40 via-white/80 to-background"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="max-w-3xl mx-auto"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary font-medium text-sm mb-6">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              Accepting New Patients
            </div>
            <h1 className="text-5xl lg:text-7xl font-display font-extrabold text-slate-900 tracking-tight mb-8 leading-tight">
              Premium Healthcare <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary-foreground">Reimagined.</span>
            </h1>
            <p className="text-lg lg:text-xl text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed">
              Experience world-class medical care with our advanced digital hospital system. Book appointments, access records, and consult with top specialists seamlessly.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/register">
                <Button size="lg" className="w-full sm:w-auto text-lg px-8 shadow-xl shadow-primary/20 group">
                  Book an Appointment
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="glass" className="w-full sm:w-auto text-lg px-8">
                  Patient Portal
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={Activity}
              title="Advanced Diagnostics"
              description="State-of-the-art facilities equipped with the latest medical technology for accurate results."
            />
            <FeatureCard 
              icon={ShieldCheck}
              title="Expert Specialists"
              description="A team of renowned doctors and surgeons dedicated to providing exceptional care."
            />
            <FeatureCard 
              icon={Clock}
              title="24/7 Emergency"
              description="Round-the-clock emergency services ensuring you get help when you need it most."
            />
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}

function FeatureCard({ icon: Icon, title, description }: { icon: any, title: string, description: string }) {
  return (
    <div className="glass-card p-8 group hover:-translate-y-1 transition-all duration-300">
      <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-white transition-colors duration-300 text-primary">
        <Icon className="w-7 h-7" />
      </div>
      <h3 className="text-xl font-bold text-slate-900 mb-3">{title}</h3>
      <p className="text-slate-500 leading-relaxed">{description}</p>
    </div>
  );
}
