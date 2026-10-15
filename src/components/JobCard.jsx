// src/components/JobCard.jsx
import Link from "next/link";
import DeleteJobButton from "@/components/DeleteJobButton";
import ToggleJobButton from "@/components/ToggleJobButton";
import JobRatingBadge from "@/components/JobRatingBadge";
import { formatDescription } from "@/lib/formatDescription";

export default function JobCard({ job, onDeleted, onToggled, showDelete = false, showToggle = false }) {
  const safeDescription = formatDescription(job.description);
  const isInactive = job.status === "INACTIVE";

  return (
    <article className={`rounded-xl border bg-white p-4 shadow-sm ${isInactive ? "opacity-60" : ""}`}>
      <header className="mb-2 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold flex items-center gap-2">
            <Link href={`/jobs/${job.id}`} className="hover:underline">
              {job.title}
            </Link>
            {isInactive && (
              <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500">
                Nieaktywna
              </span>
            )}
          </h2>
          {job.city && (
            <p className="text-sm text-gray-600">
              {job.city} {job.isRemote ? "· praca zdalna" : null}
            </p>
          )}
        </div>
      <JobRatingBadge avg={job.ratingAvg} count={job.ratingCount} />
      </header>

      <div
        className="line-clamp-2 text-sm text-gray-700 prose prose-sm max-w-none"
        dangerouslySetInnerHTML={{ __html: safeDescription }}
      />

      <footer className="mt-3 flex items-center justify-between gap-3">
        <Link
          href={`/jobs/${job.id}`}
          className="text-sm font-medium text-brand-600 hover:underline"
        >
          Szczegóły
        </Link>
        <div className="flex gap-2">
          {showToggle && (
            <ToggleJobButton id={job.id} status={job.status} onToggled={onToggled} />
          )}
          {showDelete && (
            <DeleteJobButton id={job.id} onDeleted={onDeleted} />
          )}
        </div>
      </footer>
    </article>
  );
}
