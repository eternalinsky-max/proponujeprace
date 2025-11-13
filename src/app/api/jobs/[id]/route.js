// src/app/api/jobs/[id]/route.js
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { adminAuth } from '@/lib/firebase-admin';

// GET за потреби
export async function GET(_req, { params }) {
  const job = await prisma.job.findUnique({
    where: { id: params.id },
    include: { Company: { select: { id: true, name: true, logoUrl: true } } },
  });
  if (!job) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(job);
}

// DELETE — оце головне
export async function DELETE(req, { params }) {
  try {
    const id = params?.id;
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

    const authHeader = req.headers.get('authorization') || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const decoded = await adminAuth.verifyIdToken(token);
    if (!decoded?.uid) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // хто робить запит
    const me = await prisma.user.upsert({
      where: { firebaseUid: decoded.uid },
      create: {
        id: crypto.randomUUID(),
        firebaseUid: decoded.uid,
        email: decoded.email || null,
        displayName: decoded.name || null,
        photoUrl: decoded.picture || null,
      },
      update: { email: decoded.email || null, displayName: decoded.name || null, photoUrl: decoded.picture || null },
      select: { id: true, isAdmin: true },
    });

    // чи є право видалити
    const job = await prisma.job.findUnique({ where: { id }, select: { ownerId: true } });
    if (!job) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    if (!me.isAdmin && job.ownerId !== me.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // м’яке видалення або фізичне — вибери що треба:
    // 1) м’яко: ставимо статус HIDDEN
    const deleted = await prisma.job.update({
      where: { id },
      data: { status: 'HIDDEN' },
      select: { id: true, status: true },
    });

    // 2) якщо хочеш повністю стерти — заміни на prisma.job.delete({ where: { id } })
    return NextResponse.json({ ok: true, id: deleted.id, status: deleted.status }, { status: 200 });
  } catch (e) {
    console.error('[DELETE /api/jobs/[id]]', e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
