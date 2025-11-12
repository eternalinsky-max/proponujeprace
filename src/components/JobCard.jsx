'use client';

import Link from 'next/link';

import JobRatingBadge from '@/components/JobRatingBadge';

/**
 * Картка вакансії у списку
 */
export default function JobCard({ job }) {
  return (
    <Link
      href={`/jobs/${job.id}`}
      className="group block rounded-xl border bg-white p-4 shadow-sm transition hover:shadow-md"
    >
      <div className="flex flex-col gap-2">
        {/* Заголовок */}
        <h2 className="text-lg font-semibold text-gray-900 group-hover:text-brand-600">
          {job.title}
        </h2>

        {/* Назва компанії */}
        {job.company?.name && <p className="text-sm text-gray-600">{job.company.name}</p>}

        {/* Місто / Режим */}
        <p className="text-sm text-gray-500">{job.isRemote ? 'Zdalnie' : job.city || '—'}</p>

        {/* 💫 Рейтинг вакансії */}
        {job.ratingCount > 0 && (
          <div className="mt-1">
            <JobRatingBadge avg={job.ratingAvg} count={job.ratingCount} className="text-xs" />
          </div>
        )}

        {/* Короткий опис */}
        {job.description && (
          <p className="mt-2 line-clamp-3 text-sm text-gray-700">{job.description}</p>
        )}

        {/* Зарплата (якщо є) */}
        {(job.salaryMin || job.salaryMax) && (
          <p className="mt-2 text-sm font-medium text-gray-900">
            {job.salaryMin ? `${job.salaryMin.toLocaleString('pl-PL')} zł` : ''}
            {job.salaryMax ? ` – ${job.salaryMax.toLocaleString('pl-PL')} zł` : ''}
          </p>
        )}
      </div>
    </Link>
  );
}
