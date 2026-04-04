// src/app/api/cron/generate-post/route.js
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const TOPICS = [
  'Najnowsze trendy na rynku pracy w Polsce 2026',
  'Jak napisać skuteczne CV które przyciągnie pracodawcę',
  'Najpopularniejsze zawody w Polsce i ich zarobki',
  'Praca zdalna w Polsce — zalety, wady i przyszłość',
  'Jak przygotować się do rozmowy kwalifikacyjnej',
  'Branże z największym zapotrzebowaniem na pracowników w 2026',
  'Jak negocjować wynagrodzenie — praktyczne porady',
  'Rynek IT w Polsce — zarobki i perspektywy',
  'Jak zmienić pracę i nie żałować — poradnik',
  'Prawa pracownika w Polsce — co warto wiedzieć',
  'Freelancing w Polsce — jak zacząć i ile zarobić',
  'Jak budować markę osobistą na rynku pracy',
];

function slugify(text) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/ł/g, 'l')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

export async function GET(req) {
  try {
    const authHeader = req.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const topic = TOPICS[Math.floor(Math.random() * TOPICS.length)];

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 2000,
        messages: [
          {
            role: 'user',
            content: `Napisz artykuł o tematyce rynku pracy w Polsce na temat: "${topic}".

Artykuł powinien:
- Mieć tytuł (pierwsza linia, bez prefixu)
- Mieć krótki wstęp (2-3 zdania) jako excerpt
- Zawierać 4-5 sekcji z nagłówkami <h2>
- Używać tagów HTML: <h2>, <p>, <ul>, <li>, <strong>
- Być praktyczny i pomocny dla osób szukających pracy w Polsce
- Mieć około 500 słów (NIE więcej)
- Być napisany po polsku

Format odpowiedzi (JSON):
{
  "title": "tytuł artykułu",
  "excerpt": "krótki wstęp 2-3 zdania",
  "content": "pełna treść HTML"
}

Odpowiedz TYLKO JSONem, bez żadnego dodatkowego tekstu.`,
          },
        ],
      }),
    });

    const data = await response.json();

    if (data.type === 'error') {
      return NextResponse.json({ error: data.error?.message }, { status: 500 });
    }

    const text = data.content?.[0]?.text || '';
    const clean = text.replace(/```json|```/g, '').trim();

    let parsed;
    try {
      parsed = JSON.parse(clean);
    } catch (e) {
      console.error('JSON parse error, raw text:', clean.slice(0, 500));
      return NextResponse.json({ error: 'Invalid JSON from AI', raw: clean.slice(0, 300) }, { status: 500 });
    }

    const slug = slugify(parsed.title) + '-' + Date.now();

    const post = await prisma.post.create({
      data: {
        title: parsed.title,
        slug,
        content: parsed.content,
        excerpt: parsed.excerpt,
        published: true,
      },
    });

    return NextResponse.json({ ok: true, post });
  } catch (e) {
    console.error('generate-post error:', e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}