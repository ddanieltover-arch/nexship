import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth";
import { SiteHeader } from "@/components/SiteHeader";
import { MobileDock } from "@/components/MobileDock";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Nexships | Precision shipping & live tracking",
  description: "Ship, track, and deliver with real-time visibility. Nexships global logistics platform.",
  openGraph: {
    title: "Nexships",
    description: "Precision shipping and live package tracking at nexships.com.",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={`${geistSans.variable} ${geistMono.variable} min-h-screen pb-16 font-sans md:pb-0 bg-navy text-slate-100 antialiased`}>
        <AuthProvider>
          <SiteHeader />
          <main>{children}</main>
          <MobileDock />
        </AuthProvider>
      </body>
    </html>
  );
}
