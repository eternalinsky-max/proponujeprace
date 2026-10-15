// src/app/api/my-jobs/bulk/route.js
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { adminAuth } from '@/lib/firebase-admin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req) {
  try {
    const authHeader = req.headers.get('authorization') || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
    if (!token) return NextResponse.json({ error: 'NO_TOKEN' }, { status: 401 });

    const decoded = await adminAuth.verifyIdToken(token);
    const me = await prisma.user.findUnique({
      where: { firebaseUid: decoded.uid },
      select: { id: true, isAdmin: true },
    });
    if (!me) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const body = await req.json().catch(() => null);
    const { ids, action } = body || {};

    if (!Array.isArray(ids) || ids.length === 0)
      return NextResponse.json({ error: 'No ids provided' }, { status: 400 });

    if (!['activate', 'deactivate', 'delete'].includes(action))
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

    // Перевіряємо що всі оголошення належать цьому користувачу
    const jobs = await prisma.job.findMany({
      where: { id: { in: ids } },
      select: { id: true, ownerId: true },
    });

    const allOwned = jobs.every((j) => j.ownerId === me.id || me.isAdmin);
    if (!allOwned)
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    if (action === 'delete') {
      await prisma.job.deleteMany({ where: { id: { in: ids } } });
    } else {
      await prisma.job.updateMany({
        where: { id: { in: ids } },
        data: { status: action === 'activate' ? 'ACTIVE' : 'INACTIVE' },
      });
    }

    return NextResponse.json({ ok: true, affected: ids.length });
  } catch (e) {
    console.error('POST /api/my-jobs/bulk error:', e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}