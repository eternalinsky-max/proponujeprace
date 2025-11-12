// src/app/api/jobs/[id]/route.js
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';

import { verifyFirebaseToken } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/** GET /api/jobs/[id] — деталі вакансії */
export async function GET(_req, { params }) {
  try {
    const id = params?.id;
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

    const job = await prisma.job.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        description: true,
        city: true,
        isRemote: true,
        status: true,
        salaryMin: true,
        salaryMax: true,
        tagsCsv: true,
        createdAt: true,
        ownerId: true,
        companyId: true,
        ratingAvg: true,
        ratingCount: true,
        bayesScore: true,
        Company: { select: { id: true, name: true, logoUrl: true } },
        User: { select: { id: true, displayName: true, photoUrl: true, firebaseUid: true } },
      },
    });

    if (!job) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    return NextResponse.json(job, { status: 200 });
  } catch (e) {
    console.error('GET /api/jobs/[id] error:', e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

/** PUT /api/jobs/[id] — оновлення вакансії (авторизований власник) */
export async function PUT(req, { params }) {
  try {
    const id = params?.id;
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

    // auth
    const authHeader = req.headers.get('authorization') || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
    const decoded = await verifyFirebaseToken(token);
    if (!decoded) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const me = await prisma.user.findUnique({
      where: { firebaseUid: decoded.uid },
      select: { id: true },
    });
    if (!me) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    // перевір власність
    const existing = await prisma.job.findUnique({
      where: { id },
      select: { ownerId: true },
    });
    if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    if (existing.ownerId !== me.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));

    const title = String(body.title || '').trim();
    const description = String(body.description || '');
    const isRemote = !!body.isRemote;
    const city = isRemote ? null : String(body.city || '').trim() || null;
    const salaryMin = body.salaryMin == null ? null : Number(body.salaryMin);
    const salaryMax = body.salaryMax == null ? null : Number(body.salaryMax);
    const companyName = String(body.companyName || '').trim();

    if (!title || title.length < 3) {
      return NextResponse.json({ error: 'Title too short' }, { status: 400 });
    }
    if (
      salaryMin != null &&
      salaryMax != null &&
      Number.isFinite(salaryMin) &&
      Number.isFinite(salaryMax) &&
      salaryMax < salaryMin
    ) {
      return NextResponse.json({ error: 'salaryMax < salaryMin' }, { status: 400 });
    }

    // якщо передали companyName — оновимо/створимо компанію і зв'яжемо
    let companyId = undefined;
    if (companyName) {
      const company = await prisma.company.upsert({
        where: {
          id:
            (await prisma.company.findFirst({ where: { name: companyName }, select: { id: true } }))
              ?.id || '__none__',
        },
        create: {
          id: crypto.randomUUID(),
          name: companyName,
          ownerId: me.id,
        },
        update: { name: companyName },
        select: { id: true },
      });
      companyId = company.id;
    }

    const updated = await prisma.job.update({
      where: { id },
      data: {
        title,
        description,
        isRemote,
        city,
        salaryMin: salaryMin == null || !Number.isFinite(salaryMin) ? null : salaryMin,
        salaryMax: salaryMax == null || !Number.isFinite(salaryMax) ? null : salaryMax,
        ...(companyId ? { companyId } : {}),
      },
      select: {
        id: true,
        title: true,
        description: true,
        city: true,
        isRemote: true,
        status: true,
        salaryMin: true,
        salaryMax: true,
        tagsCsv: true,
        createdAt: true,
        ownerId: true,
        companyId: true,
        ratingAvg: true,
        ratingCount: true,
        bayesScore: true,
        Company: { select: { id: true, name: true, logoUrl: true } },
        User: { select: { id: true, displayName: true, photoUrl: true } },
      },
    });

    return NextResponse.json(updated, { status: 200 });
  } catch (e) {
    console.error('PUT /api/jobs/[id] error:', e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
