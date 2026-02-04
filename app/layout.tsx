import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FINCORE | Premium Personal Finance",
  description: "Enterprise-grade financial tracking and goal management hub",
};

import Sidebar from "./components/Sidebar";

import { SupabaseFinanceProvider } from "./components/SupabaseFinanceContext";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <SupabaseFinanceProvider>
          <Sidebar />
          <main style={{ flex: 1, overflowY: 'auto', height: '100vh', position: 'relative' }}>
            {children}
          </main>
        </SupabaseFinanceProvider>
      </body>
    </html>
  );
}
