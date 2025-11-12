// src/app/jobs/[id]/edit/page.jsx
'use client';

import React from 'react';

import JobEditForm from '@/components/JobEditForm';
import { withAuth } from '@/lib/withAuth';

function EditJobPage({ params, user }) {
  const id = params.id; // <-- рядок!
  return (
    <section className="mx-auto grid max-w-2xl gap-6">
      <h1 className="text-2xl font-bold">Edytuj ofertę</h1>
      <JobEditForm jobId={id} user={user} />
    </section>
  );
}

export default withAuth(EditJobPage);
