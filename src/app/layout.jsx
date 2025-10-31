// src/app/layout.jsx
import "./globals.css";
import { Inter } from "next/font/google";
import NavBar from "@/components/NavBar";
import SiteFooter from "@/components/SiteFooter";

export const viewport = {
  themeColor: "#377ff9",
};

export const metadata = {
  title: "proponujeprace.pl",
  description: "Portal ogłoszeń pracy dla Polski",
};

const inter = Inter({
  subsets: ["latin", "latin-ext"],
  display: "swap",
  variable: "--font-sans",
});

export default function RootLayout({ children }) {
  return (
    <html lang="pl">
      <body
        className={`${inter.variable} min-h-dvh bg-gray-50 font-sans text-gray-900`}
      >
        <div className="flex min-h-dvh flex-col">
          <NavBar />
          <main className="flex-1 mx-auto w-full max-w-6xl py-8">
            {children}
          </main>
          <SiteFooter />
        </div>
      </body>
    </html>
  );
}
