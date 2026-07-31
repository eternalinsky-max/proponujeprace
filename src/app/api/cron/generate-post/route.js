// src/app/api/cron/generate-post/route.js
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const TOPICS = [
  'Choroby zawodowe elektryka w Polsce — na co choruje elektryk i jak się chronić',
  'Choroby zawodowe kierowcy zawodowego w Polsce — kręgosłup, prostaty i zmęczenie',
  'Choroby zawodowe księgowego w Polsce — kręgosłup, wzrok i stres',
  'Choroby zawodowe programisty w Polsce — cieśń nadgarstka i wypalenie zawodowe',
  'Choroby zawodowe spawacza w Polsce — płuca, wzrok i pylica',
  'Choroby zawodowe mechanika samochodowego w Polsce — alergie i choroby kręgosłupa',
  'Choroby zawodowe pielęgniarki w Polsce — żylaki, ból pleców i zakażenia',
  'Choroby zawodowe budowlańca w Polsce — zespół wibracyjny i choroby stawów',
  'Choroby zawodowe magazyniera w Polsce — przepukliny i urazy kręgosłupa',
  'Choroby zawodowe kucharza w Polsce — żylaki, oparzenia i astma',
  'Choroby zawodowe sprzedawcy w Polsce — żylaki i choroby kręgosłupa od stania',
  'Choroby zawodowe operatora wózka widłowego — kręgosłup i choroba wibracyjna',
  'Choroby zawodowe hydraulika w Polsce — kolana, plecy i choroby skóry',
  'Choroby zawodowe nauczyciela w Polsce — utrata głosu i wypalenie zawodowe',
  'Choroby zawodowe ochroniarza w Polsce — kręgosłup i stres',
  'Choroby zawodowe fryzjera w Polsce — alergie, egzema i żylaki',
  'Choroby zawodowe logistyka w Polsce — stres i choroby od siedzącej pracy',
  'Choroby zawodowe pracownika produkcji w Polsce — hałas i pylica płuc',
  'Choroby zawodowe kierowcy ciężarówki w Polsce — hemoroidy i zakrzepica',
  'Choroby zawodowe kierowcy autobusu — kręgosłup i stres',
  'Choroby zawodowe kuriera i dostawcy — stawy kolanowe i wypadki',
  'Choroby zawodowe rolnika w Polsce — alergie, kleszcze i choroby płuc',
  'Choroby zawodowe stomatologa w Polsce — kręgosłup i zespół cieśni nadgarstka',
  'Choroby zawodowe lekarza w Polsce — infekcje i wypalenie zawodowe',
  'Choroby zawodowe fizjoterapeuty w Polsce — zapalenie ścięgien i ból pleców',
  'Choroby zawodowe kosmetyczki w Polsce — alergie i ból kręgosłupa',
  'Choroby zawodowe masażysty w Polsce — stawy dłoni i kręgosłup',
  'Choroby zawodowe manicurzystki w Polsce — alergia na pył i astma',
  'Choroby zawodowe baristy i kelnera w Polsce — żylaki i płaskostopie',
  'Choroby zawodowe sprzątaczki w Polsce — alergie na chemię i dermatozy',
  'Choroby zawodowe pracownika biurowego w Polsce — zespół suchego oka',
  'Choroby zawodowe grafika komputerowego — wzrok i cieśń nadgarstka',
  'Choroby zawodowe copywritera i tłumacza — kręgosłup szyjny',
  'Choroby zawodowe muzyka w Polsce — niedosłuch i choroby stawów',
  'Choroby zawodowe DJ-a i realizatora dźwięku — utrata słuchu',
  'Choroby zawodowe nauczyciela WF — stawy i urazy',
  'Choroby zawodowe tancerza i artysty — stawy i żylaki',
  'Choroby zawodowe sportowca i trenera — artroza i przepukliny',
  'Choroby zawodowe górnika w Polsce — pylica płuc i choroba wibracyjna',
  'Choroby zawodowe hutnika w Polsce — płuca i choroby skóry',
  'Choroby zawodowe lakiernika samochodowego — astma i alergie',
  'Choroby zawodowe malarza budowlanego — astma i choroby płuc',
  'Choroby zawodowe stolarza w Polsce — niedosłuch i alergia na pył drzewny',
  'Choroby zawodowe dekarza w Polsce — upadki i choroby kolan',
  'Choroby zawodowe glazurnika i parkieciarza — kolana i kręgosłup',
  'Choroby zawodowe operatora koparki — choroba wibracyjna i kręgosłup',
  'Choroby zawodowe pracownika drogowego — hałas i płuca',
  'Choroby zawodowe listonosza i kuriera pieszego — stawy i żylaki',
  'Choroby zawodowe krawcowej i szwaczki — wzrok i kręgosłup',
  'Choroby zawodowe piekarza w Polsce — astma mączna i alergie',
  'Choroby zawodowe rzeźnika i pracownika ubojni — choroby stawów i infekcje',
  'Choroby zawodowe pracownika call center — utrata głosu i słuchu',
  'Choroby zawodowe informatyka — zespół chronicznego zmęczenia',
  'Choroby zawodowe administratora sieci — wzrok i kręgosłup',
  'Choroby zawodowe kierowcy taxi w Polsce — prostaty i hemoroidy',
  'Choroby zawodowe motorniczego i maszynisty — stres i kręgosłup',
  'Choroby zawodowe stewardessy — żylaki i zaburzenia snu',
  'Choroby zawodowe pilota — promieniowanie i bezsenność',
  'Choroby zawodowe pracownika leśnego — borelioza i kleszczowe zapalenie mózgu',
  'Choroby zawodowe weterynarza w Polsce — alergie i zakażenia od zwierząt',
  'Choroby zawodowe zootechnika i dojarza — bruceloza i bóle stawów',
  'Choroby zawodowe pracownika szklarni — grzybice i alergie',
  'Choroby zawodowe traktorzysty — kręgosłup i niedosłuch',
  'Choroby zawodowe pracownika chłodni — choroby stawów od zimna',
  'Choroby zawodowe chemika i laboranta — zatrucia i alergie',
  'Choroby zawodowe farmaceuty w Polsce — alergie i ból pleców',
  'Choroby zawodowe pracownika apteki — żylaki od stania',
  'Choroby zawodowe hutnika szkła — choroby płuc i oparzenia',
  'Choroby zawodowe pracownika cementowni — pylica i bronchit',
  'Choroby zawodowe pracownika pralni chemicznej — alergie na chemikalia',
  'Choroby zawodowe drukarza — astma i choroby skóry',
  'Choroby zawodowe jubilera — wzrok i zespół cieśni nadgarstka',
  'Choroby zawodowe zegarmistrza — wzrok i kręgosłup',
  'Choroby zawodowe szewca — alergie na kleje i pył',
  'Choroby zawodowe pracownika sortowni odpadów — infekcje i alergie',
  'Choroby zawodowe kominiarza w Polsce — choroby płuc i skóry',
  'Choroby zawodowe strażaka w Polsce — płuca i stres pourazowy',
  'Choroby zawodowe policjanta w Polsce — kręgosłup i wypalenie zawodowe',
  'Choroby zawodowe żołnierza — słuch i stawy',
  'Choroby zawodowe aktora i prezentera — chrypka i choroby strun głosowych',
  'Choroby zawodowe dziennikarza — stres i wypalenie',
  'Choroby zawodowe fotografa — kręgosłup i stawy',
  'Choroby zawodowe filmowca i montażysty — wzrok i kręgosłup',
  'Choroby zawodowe architekta — zespół cieśni nadgarstka od komputera',
  'Choroby zawodowe inżyniera budowlanego — stres i choroby od pyłu',
  'Choroby zawodowe geodety — stawy kolanowe i borelioza',
  'Choroby zawodowe pracownika IT — jak udowodnić chorobę zawodową',
  'Choroby zawodowe w Polsce 2026 — pełna lista chorób zawodowych i objawy',
  'Jak udowodnić chorobę zawodową w Polsce — krok po kroku',
  'Odszkodowanie za chorobę zawodową w Polsce — ile wynosi i jak je uzyskać',
  'Badania profilaktyczne a choroby zawodowe — co musi zapewnić pracodawca',
  'Najczęstsze choroby zawodowe w Polsce — TOP 10 zawodów ryzyka',
  'Wypalenie zawodowe jako choroba zawodowa w Polsce — nowe przepisy',
  'Choroby zawodowe na emeryturze — czy można uzyskać rentę',
  'Rehabilitacja po chorobie zawodowej w Polsce — gdzie i za ile',
  'Ubezpieczenie od chorób zawodowych w Polsce — co obejmuje',
  'Jak nie nabawić się choroby zawodowej — 15 zasad profilaktyki dla każdego zawodu',
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
