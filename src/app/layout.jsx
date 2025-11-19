// src/app/layout.jsx
import './globals.css';
import NavBar from '@/components/NavBar';
import Footer from '@/components/Footer';

export const metadata = {
  title: 'proponujeprace.pl',
  description: 'Portal ogłoszeń o pracy w Polsce',
};

export default function RootLayout({ children }) {
  return (
    <html lang="pl">
      <body className="bg-gray-50 min-h-screen flex flex-col">
        {/* шапка */}
        <NavBar />

        {/* основний контент, розтягується на всю висоту між шапкою та футером */}
        <main className="mx-auto flex-1 w-full max-w-6xl px-4 sm:px-6 lg:px-8 py-6">
          {children}
        </main>

        {/* футер */}
        <Footer />
      </body>
    </html>
  );
}
