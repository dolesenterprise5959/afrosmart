import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { BottomNav } from "@/components/layout/BottomNav";
import { Footer } from "@/components/layout/Footer";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { UnreadProvider } from "@/components/messaging/UnreadProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://afrosmart.app"),
  title: {
    default: "AfroSmart — Buy. Sell. Connect Across Africa.",
    template: "%s · AfroSmart",
  },
  description:
    "AfroSmart — Liberia's community marketplace for food, services, transport, businesses, real estate, jobs, and everyday commerce.",
  applicationName: "AfroSmart",
  openGraph: {
    type: "website",
    siteName: "AfroSmart",
    title: "AfroSmart — Buy. Sell. Connect Across Africa.",
    description:
      "Liberia's trusted marketplace for vehicles, real estate, electronics, jobs, services and more.",
    url: "https://afrosmart.app",
  },
  twitter: {
    card: "summary_large_image",
    title: "AfroSmart — Buy. Sell. Connect Across Africa.",
    description:
      "Liberia's trusted marketplace for vehicles, real estate, electronics, jobs, services and more.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <AuthProvider>
          <UnreadProvider>
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
            <BottomNav />
          </UnreadProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
