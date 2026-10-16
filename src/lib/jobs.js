import { prisma } from '@/lib/prisma';

const ALLOWED_SORT = new Set(['createdAt', 'salaryMin', 'salaryMax', 'bayesScore', 'ratingAvg']);

export async function listJobs(input = {}) {
  const page = Math.max(1, Number(input.page) || 1);
  const perPage = Math.min(100, Math.max(1, Number(input.perPage) || 12));

  const sort = String(input.sort || 'createdAt');
  const dir = String(input.dir || 'desc') === 'asc' ? 'asc' : 'desc';
  const status = String(input.status || 'ACTIVE');
  const city = String(input.city || '').trim();
  const remote = String(input.remote ?? '').trim();
  const q = String(input.q || '').trim();

  const orderByField = ALLOWED_SORT.has(sort) ? sort : 'createdAt';
  const orderBy = { [orderByField]: dir };

  const where = { status };
  if (remote === '1') where.isRemote = true;
  else if (remote === '0') where.isRemote = false;
  if (city) where.city = { contains: city, mode: 'insensitive' };
  if (q) {
    where.OR = [
      { title: { contains: q, mode: 'insensitive' } },
      { description: { contains: q, mode: 'insensitive' } },
      { tagsCsv: { contains: q, mode: 'insensitive' } },
    ];
  }

  const [items, total] = await Promise.all([
    prisma.job.findMany({
      where,
      orderBy,
      skip: (page - 1) * perPage,
      take: perPage,
      select: {
        id: true,
        title: true,
        description: true,
        city: true,
        isRemote: true,
        salaryMin: true,
        salaryMax: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        ratingAvg: true,
        ratingCount: true,
        ratingSum: true,
        bayesScore: true,
        companyId: true,
        ownerId: true,
        Company: { select: { id: true, name: true, logoUrl: true } },
      },
    }),
    prisma.job.count({ where }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / perPage));
  return { ok: true, items, page, perPage, total, totalPages, hasNext: page < totalPages };
}