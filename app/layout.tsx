import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MoneyOS - UPI Spend Analyzer",
  description: "AI-powered personal financial health mapper for Indian UPI transactions",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-950 text-slate-200">
        {children}
      </body>
    </html>
  );
}
