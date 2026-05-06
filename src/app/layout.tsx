// src/app/layout.tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { DataProvider } from "@/contexts/data-context";
import { MainNav } from "@/components/features/nav/main-nav";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "GPSC Market Intelligence",
  description: "Internal collaborative platform for GPSC market intelligence report production",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-zinc-950 text-zinc-100 min-h-screen`}>
        <DataProvider>
          <MainNav />
          <main className="mx-auto w-full max-w-[1920px] px-4 sm:px-6 lg:px-10 py-6 lg:py-8">
            {children}
          </main>
        </DataProvider>
      </body>
    </html>
  );
}
