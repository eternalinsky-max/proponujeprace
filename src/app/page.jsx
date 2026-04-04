// src/app/page.jsx
import Image from 'next/image';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import JobRatingBadge from '@/components/JobRatingBadge';
import { formatDescription } from '@/lib/formatDescription';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

async function getLatestJobs() {
  return prisma.job.findMany({
    where: { status: 'ACTIVE' },
    orderBy: { createdAt: 'desc' },
    take: 6,
    select: {
      id: true,
      title: true,
      description: true,
      city: true,
      isRemote: true,
      salaryMin: true,
      salaryMax: true,
      createdAt: true,
      ratingAvg: true,
      ratingCount: true,
      Company: { select: { id: true, name: true, logoUrl: true } },
    },
  });
}

async function getStats() {
  const [totalJobs, totalCompanies] = await Promise.all([
    prisma.job.count({ where: { status: 'ACTIVE' } }),
    prisma.company.count(),
  ]);
  return { totalJobs, totalCompanies };
}

function SalaryBadge({ min, max }) {
  const fmt = (n) => (Number.isFinite(Number(n)) && n != null ? Number(n).toLocaleString('pl-PL') : null);
  const a = fmt(min);
  const b = fmt(max);
  if (!a && !b) return null;
  return (
    <span className="inline-flex items-center rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-medium text-green-700 border border-green-100">
      {a && b ? `${a}–${b} zł` : a ? `od ${a} zł` : `do ${b} zł`}
    </span>
  );
}

export default async function HomePage() {
  const [latestJobs, stats] = await Promise.all([getLatestJobs(), getStats()]);

  return (
    <div className="min-h-screen">
      {/* ── HERO ── */}
      <section className="relative overflow-hidden bg-white border-b">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: 'radial-gradient(circle, #000 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }}
        />
        <div className="pointer-events-none absolute -top-32 right-0 h-96 w-96 rounded-full bg-blue-600/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 left-10 h-64 w-64 rounded-full bg-indigo-400/10 blur-3xl" />

        <div className="relative mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
          <div className="grid items-center gap-12 md:grid-cols-2">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" />
                Portal ogłoszeń pracy w Polsce
              </div>

              <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl md:text-6xl">
                Znajdź pracę{' '}
                <span className="relative whitespace-nowrap text-blue-600">
                  szybciej
                  <svg className="absolute -bottom-1 left-0 w-full" viewBox="0 0 200 8" fill="none">
                    <path d="M0 6 Q100 0 200 6" stroke="#2563eb" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.4"/>
                  </svg>
                </span>
              </h1>

              <p className="mt-5 text-lg text-gray-500 leading-relaxed">
                Dodawaj oferty, oceniaj pracodawców i pracowników.<br />
                Rejestracja przez Google lub telefon — bez zbędnych formalności.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/jobs"
                  className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 transition-colors"
                >
                  Przeglądaj oferty
                  <svg className="h-4 w-4" viewBox="0 0 16 16" fill="none">
                    <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </Link>
                <Link
                  href="/post-job"
                  className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-6 py-3 text-sm font-semibold text-gray-700 hover:border-gray-300 hover:bg-gray-50 transition-colors"
                >
                  Dodaj ofertę
                </Link>
              </div>

              <div className="mt-10 flex gap-8">
                <div>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalJobs}</p>
                  <p className="text-sm text-gray-500">aktywnych ofert</p>
                </div>
                <div className="w-px bg-gray-100" />
                <div>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalCompanies}</p>
                  <p className="text-sm text-gray-500">firm</p>
                </div>
                <div className="w-px bg-gray-100" />
                <div>
                  <p className="text-2xl font-bold text-gray-900">100%</p>
                  <p className="text-sm text-gray-500">bezpłatnie</p>
                </div>
              </div>
            </div>

            <div className="relative hidden md:flex justify-center">
              <div className="relative h-[380px] w-full max-w-[480px] rounded-2xl overflow-hidden border border-gray-100 shadow-xl">
                <Image
                  src="/images/hero-work.png"
                  alt="Znajdź pracę szybciej"
                  fill
                  sizes="480px"
                  className="object-cover"
                  priority
                />
                <div className="absolute bottom-4 left-4 right-4 rounded-xl border border-white/60 bg-white/90 backdrop-blur-sm p-3 shadow-lg">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-white text-xs font-bold">MO</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">Nowa oferta dodana</p>
                      <p className="text-xs text-gray-500">Technik serwisu · Warszawa</p>
                    </div>
                    <span className="text-xs text-green-600 font-medium bg-green-50 px-2 py-0.5 rounded-full">ACTIVE</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── NAJNOWSZE OFERTY ── */}
      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Najnowsze oferty</h2>
            <p className="mt-0.5 text-sm text-gray-500">Świeżo dodane ogłoszenia pracy</p>
          </div>
          <Link
            href="/jobs"
            className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            Zobacz wszystkie
            <svg className="h-4 w-4" viewBox="0 0 16 16" fill="none">
              <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </Link>
        </div>

        {latestJobs.length === 0 ? (
          <div className="rounded-2xl border border-dashed bg-gray-50 px-6 py-12 text-center">
            <p className="text-gray-500">Brak ofert.{' '}
              <Link href="/post-job" className="text-blue-600 hover:underline">Dodaj pierwszą!</Link>
            </p>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {latestJobs.map((job) => {
              const desc = formatDescription(job.description);
              const company = job.Company;
              const initials = (company?.name || '??').slice(0, 2).toUpperCase();

              return (
                <article
                  key={job.id}
                  className="flex flex-col rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-all hover:border-blue-200 hover:shadow-md"
                >
                  {/* Компанія */}
                  <div className="mb-3 flex items-center gap-2.5">
                    {company?.logoUrl ? (
                      <Image
                        src={company.logoUrl}
                        alt={company.name}
                        width={28}
                        height={28}
                        className="rounded-md border object-cover"
                      />
                    ) : (
                      <div className="flex h-7 w-7 items-center justify-center rounded-md bg-blue-50 text-[10px] font-bold text-blue-700 border border-blue-100">
                        {initials}
                      </div>
                    )}
                    <span className="text-xs text-gray-500 truncate">{company?.name || '—'}</span>
                  </div>

                  {/* Назва */}
                  <h3 className="font-semibold text-gray-900 line-clamp-1">
                    <Link href={`/jobs/${job.id}`} className="hover:text-blue-600 transition-colors">
                      {job.title}
                    </Link>
                  </h3>

                  {/* Місто */}
                  {job.city && (
                    <p className="mt-0.5 text-xs text-gray-500">
                      {job.city}{job.isRemote ? ' · zdalnie' : ''}
                    </p>
                  )}

                  {/* Опис */}
                  <div
                    className="mt-2 line-clamp-2 text-xs text-gray-500 flex-1"
                    dangerouslySetInnerHTML={{ __html: desc }}
                  />

                  {/* Футер */}
                  <div className="mt-4 flex items-center justify-between gap-2">
                    <Link href={`/jobs/${job.id}`} className="text-xs text-blue-600 hover:underline">
                      Szczegóły →
                    </Link>
                    <div className="flex items-center gap-2">
                      <SalaryBadge min={job.salaryMin} max={job.salaryMax} />
                      <JobRatingBadge avg={job.ratingAvg} count={job.ratingCount} />
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {/* ── CTA ── */}
      <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
        <div className="relative overflow-hidden rounded-2xl bg-blue-600 px-8 py-12 text-center">
          <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-white/10" />
          <div className="pointer-events-none absolute -left-8 -bottom-12 h-32 w-32 rounded-full bg-white/10" />
          <div className="relative">
            <h2 className="text-2xl font-bold text-white sm:text-3xl">
              Szukasz pracowników?
            </h2>
            <p className="mt-2 text-blue-100">
              Dodaj ogłoszenie bezpłatnie i dotrzyj do tysięcy kandydatów.
            </p>
            <Link
              href="/post-job"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-semibold text-blue-600 hover:bg-blue-50 transition-colors"
            >
              Dodaj ofertę za darmo
              <svg className="h-4 w-4" viewBox="0 0 16 16" fill="none">
                <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}