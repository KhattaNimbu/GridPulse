import type { Metadata } from "next";
import { Inter } from "next/font/google";
import SessionProvider from "@/components/SessionProvider";
import Header from "@/components/Header";
import "./globals.css";

// Inter is the only family in the system — headlines, body, nav, buttons,
// inputs and code all resolve to it.
const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
  variable: "--font-inter-family",
});

export const metadata: Metadata = {
  title: "GridPulse | EV Charging Load Management",
  description: "Predict charging demand, protect grid capacity, and shape behavior with pricing.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-paper-white text-true-black selection:bg-mint-green/15 selection:text-ink-black">
        <SessionProvider>
          <Header />
          <div className="flex-1">
            {children}
          </div>
        </SessionProvider>
      </body>
    </html>
  );
}
