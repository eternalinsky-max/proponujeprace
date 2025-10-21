export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { verifyFirebaseToken } from "../../../../lib/auth";

export async function GET(req) {
  try {
    const token = req.headers.get("authorization")?.split("Bearer ")[1];
    if (!token)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const decoded = await verifyFirebaseToken(token).catch(() => null);
    if (!decoded)
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });

    let user = await prisma.user.findUnique({
      where: { firebaseUid: decoded.uid },
    });
    if (!user) {
      user = await prisma.user.create({
        data: {
          firebaseUid: decoded.uid,
          email: decoded.email || null,
          displayName: decoded.name || null,
          phone: decoded.phone_number || null,
          photoUrl: decoded.picture || null,
        },
      });
    }

    return NextResponse.json(user);
  } catch (e) {
    console.error("GET /api/auth/me error:", e?.message || e);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
