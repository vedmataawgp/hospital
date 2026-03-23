import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import "bootstrap-icons/font/bootstrap-icons.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "MediCare — Advanced Healthcare for Everyone",
  description: "Enterprise-grade hospital management and patient experience platform. Book appointments, consult doctors, and manage your health online.",
  keywords: "hospital, healthcare, doctor, appointment, medical",
  robots: "index, follow",
  openGraph: {
    title: "MediCare — Advanced Healthcare for Everyone",
    description: "Book appointments with top specialists. 500+ certified doctors. 24/7 care.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen bg-[#F8FAFC] font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
