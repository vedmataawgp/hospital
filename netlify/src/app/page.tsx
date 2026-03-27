"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { LogIn, Menu, X, CheckSquare, Heart, Shield, Activity, Users, Plus, Bell, MessageSquare, BriefcaseMedical } from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function LandingPage() {
  const { user } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-white text-slate-900 overflow-x-hidden selection:bg-blue-100 selection:text-blue-700">
      {/* Navbar */}
      <nav 
        className={`fixed top-0 w-full z-50 transition-all duration-300 ${
          scrolled ? "bg-white/80 backdrop-blur-md shadow-sm py-3" : "bg-transparent py-5"
        }`}
      >
        <div className="container mx-auto px-6 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-blue-200">
              M+
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-800">MediCare+</span>
          </div>
          
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">Features</a>
            <a href="#demo" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">Product</a>
            <a href="#pricing" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">Pricing</a>
            {user ? (
              <Link 
                href={user.role === 'patient' ? '/patient/dashboard' : user.role === 'doctor' ? '/doctor/dashboard' : '/admin/dashboard'}
                className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-full text-sm font-semibold transition-all shadow-md hover:shadow-lg active:scale-95"
              >
                Dashboard
              </Link>
            ) : (
              <div className="flex items-center gap-4">
                <Link href="/login" className="text-sm font-semibold text-slate-700 hover:text-blue-600 transition-colors flex items-center gap-2">
                  <LogIn className="w-4 h-4" /> Sign In
                </Link>
                <Link href="/login" className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-full text-sm font-semibold transition-all shadow-md hover:shadow-lg active:scale-95">
                  Get Started
                </Link>
              </div>
            )}
          </div>

          <button className="md:hidden p-2" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
        
        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-white border-b overflow-hidden"
            >
              <div className="flex flex-col p-6 gap-4">
                <a href="#features" onClick={() => setMobileMenuOpen(false)} className="font-medium">Features</a>
                <a href="#pricing" onClick={() => setMobileMenuOpen(false)} className="font-medium">Pricing</a>
                <Link href="/login" className="bg-blue-600 text-white px-5 py-3 rounded-xl text-center font-bold">Sign In</Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      <main>
        {/* Hero Section */}
        <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 lg:pt-56 lg:pb-40 overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full -z-10 pointer-events-none overflow-hidden">
             <div className="absolute top-[10%] left-[5%] w-[40%] h-[40%] bg-blue-100/50 rounded-full blur-3xl opacity-60"></div>
             <div className="absolute bottom-[10%] right-[5%] w-[35%] h-[35%] bg-indigo-100/50 rounded-full blur-3xl opacity-60"></div>
          </div>
          <div className="container mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 py-1.5 px-3 rounded-full bg-blue-50 text-blue-700 text-xs font-bold uppercase tracking-wider mb-6 border border-blue-100 animate-pulse">
                <Activity className="w-3.5 h-3.5" /> 2026 NEXT-GEN Patient Care
              </div>
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.05] text-slate-900 mb-8">
                Revolutionize Your <br/> <span className="text-blue-600">Hospital Workflow</span>
              </h1>
              <p className="text-xl text-slate-600 max-w-lg mb-10 leading-relaxed">
                Empower your medical staff and provide superior patient experiences with the most advanced, all-in-one Hospital Management System.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/login" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-full text-lg font-bold transition-all shadow-xl shadow-blue-200 hover:shadow-blue-300 active:scale-95 text-center flex items-center justify-center gap-2">
                  Launch Free Demo <BriefcaseMedical className="w-5 h-5"/>
                </Link>
                <div className="flex items-center gap-3 px-6 py-4 rounded-full border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50 transition-colors cursor-pointer justify-center">
                   View Features
                </div>
              </div>
              <div className="mt-12 flex items-center gap-4">
                 <div className="flex -space-x-3">
                    {[1,2,3,4].map(i => (
                      <img key={i} src={`https://i.pravatar.cc/100?u=${i+10}`} className="w-10 h-10 rounded-full border-2 border-white shadow-sm" alt="avatar" />
                    ))}
                 </div>
                 <div className="text-sm">
                   <p className="font-bold text-slate-800">500+ Hospitals</p>
                   <p className="text-slate-500">Trusting MediCare+ daily</p>
                 </div>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9, rotateY: -10 }}
              animate={{ opacity: 1, scale: 1, rotateY: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative hidden lg:block"
            >
              <div className="relative rounded-[2rem] overflow-hidden shadow-2xl border-4 border-white transform hover:scale-[1.02] transition-transform duration-500">
                <img 
                  src="https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=2053&ixlib=rb-4.0.3" 
                  alt="Dashboard Preview" 
                  className="w-full h-auto"
                />
                <div className="absolute inset-0 bg-blue-600/10 mix-blend-multiply"></div>
                <div className="absolute bottom-6 left-6 right-6 glass p-6 rounded-2xl flex justify-between items-center">
                  <div className="flex gap-4">
                    <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-white">
                      <CheckSquare />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800">New patient registered</p>
                      <p className="text-xs text-slate-500">Just a few seconds ago</p>
                    </div>
                  </div>
                  <div className="bg-blue-600 text-white text-[10px] px-2 py-1 rounded font-bold">LIVE</div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-24 bg-slate-50">
          <div className="container mx-auto px-6 text-center mb-16">
            <h2 className="text-blue-600 font-bold uppercase tracking-widest text-sm mb-4">Core Ecosystem</h2>
            <h3 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-6">Designed for Seamless Operations</h3>
            <p className="text-slate-600 max-w-2xl mx-auto text-lg leading-relaxed">
              Everything you need to manage your medical facility, from appointment scheduling and patient records to real-time chat and billing.
            </p>
          </div>
          
          <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: <Plus className="w-8 h-8 text-blue-600" />, title: "Smart Scheduling", desc: "AI-driven appointment booking system that reduces patient wait times and optimizes doctor schedules." },
              { icon: <MessageSquare className="w-8 h-8 text-indigo-600" />, title: "Instant Telehealth", desc: "Integrated secure messaging and high-definition video calls for remote patient consultations." },
              { icon: <Shield className="w-8 h-8 text-emerald-600" />, title: "Secure EMR", desc: "End-to-end encrypted electronic medical records accessible securely from any device." },
              { icon: <Activity className="w-8 h-8 text-rose-600" />, title: "Live Monitoring", desc: "Real-time tracking of ward occupancy, patient status, and medical equipment availability." },
              { icon: <Users className="w-8 h-8 text-amber-600" />, title: "Staff Coordination", desc: "Powerful tools for team communication, shift management, and resource allocation." },
              { icon: <Bell className="w-8 h-8 text-purple-600" />, title: "Smart Notifications", desc: "Automated reminders for meds, appointments, and report availability via SMS and Email." },
            ].map((feature, i) => (
              <motion.div 
                key={i}
                whileHover={{ y: -10 }}
                className="bg-white p-10 rounded-[2.5rem] shadow-sm hover:shadow-xl transition-all border border-slate-100 group"
              >
                <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-blue-50 transition-colors">
                  {feature.icon}
                </div>
                <h4 className="text-2xl font-bold text-slate-800 mb-4">{feature.title}</h4>
                <p className="text-slate-600 leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Demo Section */}
        <section id="demo" className="py-24 bg-white overflow-hidden">
          <div className="container mx-auto px-6">
            <div className="grid lg:grid-cols-5 gap-16 items-center">
              <div className="lg:col-span-2">
                <h3 className="text-3xl font-extrabold mb-8 text-slate-900">Experience the Full Suite</h3>
                 <div className="space-y-6">
                    {[
                      { role: "Patients", desc: "Easy booking, chat with doctors, and access to medical history anywhere.", link: "/login" },
                      { role: "Doctors", desc: "Manage patient load, update records instantly, and communicate securely.", link: "/login" },
                      { role: "Administrators", desc: "Bird's-eye view of hospital stats, revenue, and staff management.", link: "/login" }
                    ].map((item, i) => (
                      <div key={i} className="flex gap-4 p-6 hover:bg-blue-50/50 rounded-2xl transition-all cursor-pointer border border-transparent hover:border-blue-100 group">
                         <div className="h-10 w-10 shrink-0 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">0{i+1}</div>
                         <div>
                            <h5 className="font-extrabold text-slate-800 group-hover:text-blue-600">{item.role} Portal</h5>
                            <p className="text-sm text-slate-500 mt-1">{item.desc}</p>
                         </div>
                      </div>
                    ))}
                 </div>
              </div>
              <div className="lg:col-span-3 relative">
                <div className="relative z-10 p-4 bg-slate-100 rounded-[2.5rem] shadow-2xl overflow-hidden border-8 border-slate-50">
                   <img src="https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&q=80&w=2070" className="rounded-3xl shadow-inner mb-4" alt="Doctor Dashboard" />
                   <div className="flex gap-4 p-2 overflow-x-auto no-scrollbar">
                      <img src="https://images.unsplash.com/photo-1551076805-e1869033e561?auto=format&fit=crop&q=80&w=1000" className="h-20 w-32 object-cover rounded-xl" alt="patient portal" />
                      <img src="https://images.unsplash.com/photo-1538108149393-fdfd818d594f?auto=format&fit=crop&q=80&w=1000" className="h-20 w-32 object-cover rounded-xl" alt="admin dashboard" />
                      <img src="https://images.unsplash.com/photo-1550831107-1553da8c8464?auto=format&fit=crop&q=80&w=1000" className="h-20 w-32 object-cover rounded-xl" alt="chat ui" />
                   </div>
                </div>
                <div className="absolute top-1/2 -right-20 transform -translate-y-1/2 w-80 h-80 bg-blue-600 rounded-full blur-[100px] opacity-10"></div>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-24 bg-slate-900 text-white overflow-hidden relative">
           <div className="container mx-auto px-6 relative z-10">
              <div className="text-center mb-16">
                 <h2 className="text-blue-400 font-bold uppercase tracking-widest text-sm mb-4">Flexible Pricing</h2>
                 <h3 className="text-4xl md:text-5xl font-extrabold mb-6">Scaled for your Facility</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                 {[
                   { name: "Clinic", price: "$199", features: ["Up to 5 Doctors", "Infinite Patients", "Scheduling", "Basic Reports"] },
                   { name: "General Hospital", price: "$899", features: ["Up to 50 Doctors", "EMR Integration", "Pharmacy Management", "Staff Scheduling"], featured: true },
                   { name: "Enterprise", price: "Custom", features: ["Unlimited Everything", "On-Premise Option", "White-labeling", "Priority Support"] },
                 ].map((plan, i) => (
                   <div key={i} className={`p-10 rounded-[2.5rem] border ${plan.featured ? 'border-blue-500 bg-white/5 shadow-2xl shadow-blue-500/10' : 'border-white/10'} relative overflow-hidden`}>
                      {plan.featured && <div className="absolute top-6 right-6 bg-blue-600 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-tighter">Most Popular</div>}
                      <h4 className="text-xl font-bold mb-2">{plan.name}</h4>
                      <div className="flex items-baseline gap-1 mb-6">
                         <span className="text-4xl font-extrabold">{plan.price}</span>
                         <span className="text-white/40 text-sm">{plan.price !== 'Custom' && '/month'}</span>
                      </div>
                      <div className="space-y-4 mb-10">
                         {plan.features.map((f, j) => (
                           <div key={j} className="flex items-center gap-3 text-sm text-white/70">
                              <CheckSquare className="w-4 h-4 text-blue-500" /> {f}
                           </div>
                         ))}
                      </div>
                      <Link href="/login" className={`block w-full py-4 text-center rounded-2xl font-bold transition-all ${plan.featured ? 'bg-blue-600 hover:bg-blue-700' : 'bg-white/10 hover:bg-white/15'}`}>
                         Get Started
                      </Link>
                   </div>
                 ))}
              </div>
           </div>
        </section>
        
        {/* Testimonials */}
        <section className="py-24 bg-white">
          <div className="container mx-auto px-6">
            <div className="flex flex-col lg:flex-row gap-16 items-center">
              <div className="max-w-md">
                 <h3 className="text-3xl font-extrabold mb-6">What healthcare leaders say</h3>
                 <p className="text-slate-500 mb-8 leading-relaxed">Join thousands of clinics and hospitals that have already upgraded their digital infrastructure.</p>
                 <div className="flex gap-4">
                    <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center cursor-pointer hover:bg-blue-50 transition-colors"><X className="w-5 h-5"/></div>
                    <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center cursor-pointer hover:bg-blue-50 transition-colors"><LogIn className="w-5 h-5"/></div>
                 </div>
              </div>
              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6">
                 {[
                   { name: "Dr. James Aris", role: "Chief of Surgery, St. Lukes", text: "MediCare+ has completely eliminated our paperwork. The scheduling system is exceptionally intuitive." },
                   { name: "Sarah Jenkins", role: "Clinic Manager, CareFirst", text: "Since implementing the patient portal, our show-up rate has increased by 35%. Exceptional ROI." }
                 ].map((t, i) => (
                   <div key={i} className="p-8 rounded-3xl bg-slate-50 border border-slate-100 relative shadow-sm">
                      <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold mb-4 italic text-2xl">"</div>
                      <p className="text-slate-700 font-medium mb-6 italic leading-relaxed">{t.text}</p>
                      <div className="flex gap-4 items-center">
                         <div className="h-12 w-12 rounded-full bg-slate-300"></div>
                         <div>
                            <p className="font-bold text-slate-900">{t.name}</p>
                            <p className="text-xs text-slate-500">{t.role}</p>
                         </div>
                      </div>
                   </div>
                 ))}
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-20">
          <div className="container mx-auto px-6">
            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[3rem] p-12 md:p-20 text-center relative overflow-hidden">
               <div className="relative z-10">
                 <h2 className="text-4xl md:text-6xl font-extrabold text-white mb-8">Ready to transform your care?</h2>
                 <p className="text-blue-100 text-xl max-w-2xl mx-auto mb-12">Start your 30-day free trial today. No credit card required. Setup takes less than 15 minutes.</p>
                 <Link href="/login" className="inline-block bg-white text-blue-600 px-10 py-5 rounded-full text-xl font-bold shadow-2xl hover:scale-105 transition-transform active:scale-95">
                    Book Free Demo Now
                 </Link>
               </div>
               <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
               <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-slate-50 py-16 border-t border-slate-200">
        <div className="container mx-auto px-6 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-12">
          <div className="col-span-2">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">M+</div>
              <span className="text-lg font-bold">MediCare+</span>
            </div>
            <p className="text-slate-500 max-w-xs mb-8">Bridging the gap between technology and healthcare to provide better lives for everyone.</p>
            <div className="flex gap-4">
               {[1,2,3,4].map(i => <div key={i} className="h-10 w-10 rounded-full bg-white border border-slate-200 hover:border-blue-500 transition-colors cursor-pointer"></div>)}
            </div>
          </div>
          <div>
            <h6 className="font-bold mb-6">Product</h6>
            <ul className="space-y-4 text-slate-500 text-sm">
              <li><a href="#" className="hover:text-blue-600">Features</a></li>
              <li><a href="#" className="hover:text-blue-600">For Clinics</a></li>
              <li><a href="#" className="hover:text-blue-600">For Hospitals</a></li>
              <li><a href="#" className="hover:text-blue-600">Pricing</a></li>
            </ul>
          </div>
          <div>
            <h6 className="font-bold mb-6">Company</h6>
            <ul className="space-y-4 text-slate-500 text-sm">
              <li><a href="#" className="hover:text-blue-600">About Us</a></li>
              <li><a href="#" className="hover:text-blue-600">Careers</a></li>
              <li><a href="#" className="hover:text-blue-600">Contact</a></li>
              <li><a href="#" className="hover:text-blue-600">Legal</a></li>
            </ul>
          </div>
          <div>
             <h6 className="font-bold mb-6">Support</h6>
             <ul className="space-y-4 text-slate-500 text-sm">
               <li><a href="#" className="hover:text-blue-600">Help Center</a></li>
               <li><a href="#" className="hover:text-blue-600">API Docs</a></li>
               <li><a href="#" className="hover:text-blue-600">Status</a></li>
             </ul>
          </div>
        </div>
        <div className="container mx-auto px-6 mt-16 pt-8 border-t border-slate-200 flex justify-between items-center text-xs text-slate-400 font-medium uppercase tracking-widest">
           <p>© 2026 MediCare+ Inc. All rights reserved.</p>
           <div className="flex gap-8">
              <span>Privacy Policy</span>
              <span>Terms of Service</span>
           </div>
        </div>
      </footer>
    </div>
  );
}
