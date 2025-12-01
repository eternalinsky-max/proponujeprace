import './globals.css';
import NavBar from '@/components/NavBar';
import SiteFooter from '@/components/Footer';

export const metadata = {
  title: 'proponujeprace.pl',
  description: 'Portal ogłoszeń o pracy w Polsce',
};

export default function RootLayout({ children }) {
  return (
    <html lang="pl">
      <head>
        {/* Явно вказуємо favicon — браузер бере саме його */}
        <link rel="icon" href="/favicon.svg?v=4" type="image/svg+xml" />
        {/* Якщо PNG видалені — ці рядки можна прибрати або залишити закоментованими */}
        {/* <link rel="icon" href="/favicon-32.png?v=4" sizes="32x32" />
        <link rel="icon" href="/favicon-16.png?v=4" sizes="16x16" /> */}
        <link rel="apple-touch-icon" href="/apple-touch-icon.png?v=4" />
        <link rel="manifest" href="/site.webmanifest?v=4" />
      </head>

      <body className="bg-gray-50">
        <NavBar />

        <main className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-6">
          {children}
        </main>

        <SiteFooter />
      </body>
    </html>
  );
}
