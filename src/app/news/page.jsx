// src/app/news/page.jsx
import Link from 'next/link';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export const metadata = {
  title: 'Aktualności — proponujeprace.pl',
  description: 'Porady i aktualności z rynku pracy w Polsce',
};

export default async function NewsPage() {
  const posts = await prisma.post.findMany({
    where: { published: true },
    orderBy: { createdAt: 'desc' },
    select: { id: true, title: true, slug: true, excerpt: true, createdAt: true },
  });

  return (
    <section className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Aktualności</h1>
      <p className="text-gray-500 mb-8">Porady i aktualności z rynku pracy w Polsce</p>

      {posts.length === 0 ? (
        <p className="text-gray-500">Brak artykułów.</p>
      ) : (
        <div className="grid gap-4">
          {posts.map((post) => (
            <article key={post.id} className="rounded-2xl border bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
              <p className="text-xs text-gray-400 mb-2">
                {new Date(post.createdAt).toLocaleDateString('pl-PL', {
                  day: 'numeric', month: 'long', year: 'numeric',
                })}
              </p>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">
                <Link href={`/news/${post.slug}`} className="hover:text-blue-600 transition-colors">
                  {post.title}
                </Link>
              </h2>
              {post.excerpt && <p className="text-sm text-gray-500 line-clamp-2">{post.excerpt}</p>}
              <Link href={`/news/${post.slug}`} className="mt-3 inline-flex text-sm font-medium text-blue-600 hover:underline">
                Czytaj więcej →
              </Link>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}