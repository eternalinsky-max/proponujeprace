// src/app/layout.jsx
import "./globals.css";
import { Inter } from "next/font/google";
import NavBar from "@/components/NavBar";

export const viewport = {
  themeColor: "#377ff9",
};

export const metadata = {
  title: "proponujeprace.pl",
  description: "Portal z ofertami pracy — dodaj, wyszukuj, aplikuj.",
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
        className={`${inter.variable} flex min-h-dvh flex-col bg-gray-50 font-sans text-gray-900`}
      >
        <NavBar />

        <main className="mx-auto w-full max-w-6xl flex-1 py-8">
          {children}
        </main>

        <Footer />
      </body>
    </html>
  );
}

function Footer() {
  return (
    <footer className="border-t bg-white">
      <div className="mx-auto max-w-6xl py-6 text-sm text-gray-600 text-center">
        © proponujeprace.pl — Wszelkie prawa zastrzeżone.
      </div>
    </footer>
  );
}
