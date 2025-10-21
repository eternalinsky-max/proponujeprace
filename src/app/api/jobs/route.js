// src/app/api/jobs/route.js
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);

    const page = Math.max(Number(searchParams.get("page")) || 1, 1);
    const limitParam =
      Number(searchParams.get("limit")) ||
      Number(searchParams.get("perPage")) ||
      12;
    const perPage = Math.min(Math.max(limitParam, 1), 100);
    const skip = (page - 1) * perPage;

    const status = (searchParams.get("status") || "").trim();
    const city = (searchParams.get("city") || "").trim();
    const remoteParam = searchParams.get("remote"); // "1" | "0" | null
    const remote =
      remoteParam === "1" ? true : remoteParam === "0" ? false : undefined;
    const q = (searchParams.get("q") || "").trim();

    const sort = (searchParams.get("sort") || "createdAt").trim();
    const dir = (searchParams.get("dir") || "desc").trim().toLowerCase() === "asc" ? "asc" : "desc";
    const sortable = new Set(["createdAt", "salaryMin", "salaryMax", "bayesScore", "ratingAvg"]);
    const orderBy = sortable.has(sort) ? { [sort]: dir } : { createdAt: "desc" };

    const where = {
      ...(status ? { status } : {}),
      ...(city ? { city: { contains: city, mode: "insensitive" } } : {}),
      ...(typeof remote === "boolean" ? { isRemote: remote } : {}),
      ...(q
        ? {
            OR: [
              { title: { contains: q, mode: "insensitive" } },
              { description: { contains: q, mode: "insensitive" } },
              { tagsCsv: { contains: q, mode: "insensitive" } },
              { Company: { name: { contains: q, mode: "insensitive" } } },
            ],
          }
        : {}),
    };

    const rowsPlusOne = await prisma.job.findMany({
      where,
      orderBy,
      skip,
      take: perPage + 1,
      select: {
        id: true,
        title: true,
        description: true,
        city: true,
        isRemote: true,
        status: true,
        salaryMin: true,
        salaryMax: true,
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

    const hasNext = rowsPlusOne.length > perPage;
    const items = hasNext ? rowsPlusOne.slice(0, perPage) : rowsPlusOne;

    let total = null;
    let totalPages = null;
    try {
      total = await prisma.job.count({ where });
      totalPages = Math.max(1, Math.ceil(total / perPage));
    } catch {
      totalPages = hasNext ? page + 1 : page;
    }

    return NextResponse.json(
      {
        items,
        total,
        page,
        perPage,
        totalPages,
        hasNext,
        sort: sortable.has(sort) ? sort : "createdAt",
        dir,
        filters: { status, city, remote, q },
      },
      { status: 200 },
    );
  } catch (e) {
    console.error("GET /api/jobs error:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
