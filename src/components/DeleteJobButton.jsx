'use client';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';

import { auth } from '@/lib/firebase';

export default function DeleteJobButton({ jobId, className = 'btn btn-ghost' }) {
  const [loading, setLoading] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  async function handleDelete() {
    // просте підтвердження без window.confirm
    // можна замінити на власний діалог у майбутньому
    if (!window.confirm('Na pewno chcesz usunąć tę ofertę?')) return;

    const user = auth.currentUser;
    if (!user) {
      router.push('/login?next=/jobs');
      return;
    }

    try {
      setLoading(true);
      const token = await user.getIdToken(); // без форс-рефрешу зазвичай достатньо
      const res = await fetch(`/api/jobs/${jobId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        // оновити список інколи приємніше, ніж редіректити
        startTransition(() => router.refresh());
        // якщо хочеш – заміни на router.push('/jobs')
      } else if (res.status === 401) {
        router.push('/login?next=/jobs');
      } else if (res.status === 403) {
        // немає прав на видалення
        console.warn('Brak uprawnień do usunięcia tej oferty.');
      } else {
        const ct = res.headers.get('content-type') || '';
        const msg = ct.includes('application/json')
          ? ((await res.json())?.error ?? `HTTP ${res.status}`)
          : (await res.text()) || `HTTP ${res.status}`;
        console.error('Delete error:', msg);
      }
    } catch (e) {
      console.error('Network error:', e);
    } finally {
      setLoading(false);
    }
  }

  const disabled = loading || isPending;

  return (
    <button
      onClick={handleDelete}
      disabled={disabled}
      aria-disabled={disabled}
      aria-busy={disabled}
      className={className}
      type="button"
    >
      {disabled ? 'Usuwanie…' : 'Usuń ofertę'}
    </button>
  );
}
