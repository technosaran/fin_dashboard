import type { Metadata, Viewport } from "next";
import "./globals.css";
import ClientLayout from "./components/ClientLayout";

export const metadata: Metadata = {
  title: "FINCORE | Digital Wealth Hub",
  description: "Enterprise-grade financial tracking and goal management hub",
  keywords: ["finance", "portfolio", "wealth", "investment", "tracking"],
  authors: [{ name: "FINCORE Team" }],
  openGraph: {
    title: "FINCORE | Digital Wealth Hub",
    description: "Enterprise-grade financial tracking and goal management hub",
    type: "website",
    locale: "en_US",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body style={{ fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
        <ClientLayout>
          {children}
        </ClientLayout>
      </body>
    </html>
  );
}
