// src/app/layout.jsx
import './globals.css';
import NavBar from '@/components/NavBar';

export const metadata = {
  title: 'proponujeprace.pl',
  description: 'Portal ogłoszeń o pracy w Polsce',
};

export default function RootLayout({ children }) {
  return (
    <html lang="pl">
      <body className="bg-gray-50">
        <NavBar />
        <main className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-6">
          {children}
        </main>
      </body>
    </html>
  );
}
