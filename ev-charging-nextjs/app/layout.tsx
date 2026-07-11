import type { Metadata } from "next";
import SessionProvider from "@/components/SessionProvider";
import Header from "@/components/Header";
import "./globals.css";

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
    <html lang="en" className="h-full antialiased dark">
      <body className="min-h-full flex flex-col bg-[var(--color-gp-bg)] text-[var(--color-gp-text)] selection:bg-[var(--color-gp-cyan)]/30 selection:text-white">
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
