import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import "bootstrap-icons/font/bootstrap-icons.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: {
    default: "MediCare — Advanced Healthcare for Everyone",
    template: "%s | MediCare Hospital",
  },
  description: "Enterprise-grade hospital management and patient experience platform. Book appointments, consult doctors, and manage your health online.",
  keywords: ["hospital", "healthcare", "doctor", "appointment", "medical", "online consultation", "specialist", "Medicare"],
  robots: { index: true, follow: true, googleBot: { index: true, follow: true } },
  openGraph: {
    title: "MediCare — Advanced Healthcare for Everyone",
    description: "Book appointments with top specialists. 500+ certified doctors. 24/7 care.",
    type: "website",
    siteName: "MediCare Hospital",
    locale: "en_US",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "MediCare — Advanced Healthcare for Everyone",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "MediCare — Advanced Healthcare for Everyone",
    description: "Book appointments with top specialists. 500+ certified doctors. 24/7 care.",
    images: ["/og-image.png"],
  },
  category: "healthcare",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0A2647",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <body className="min-h-screen bg-[#F8FAFC] font-sans antialiased" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
