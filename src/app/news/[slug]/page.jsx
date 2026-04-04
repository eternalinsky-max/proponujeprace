// src/app/news/[slug]/page.jsx
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }) {
  const post = await prisma.post.findUnique({
    where: { slug: params.slug },
    select: { title: true, excerpt: true },
  });
  if (!post) return {};
  return {
    title: `${post.title} — proponujeprace.pl`,
    description: post.excerpt || post.title,
  };
}

export default async function PostPage({ params }) {
  const post = await prisma.post.findUnique({
    where: { slug: params.slug, published: true },
  });

  if (!post) return notFound();

  return (
    <section className="mx-auto max-w-3xl px-4 py-10">
      <Link href="/news" className="text-sm text-blue-600 hover:underline mb-6 inline-block">
        ← Aktualności
      </Link>

      <p className="text-xs text-gray-400 mb-3">
        {new Date(post.createdAt).toLocaleDateString('pl-PL', {
          day: 'numeric', month: 'long', year: 'numeric',
        })}
      </p>

      <h1 className="text-3xl font-bold text-gray-900 mb-4">{post.title}</h1>

      {post.excerpt && (
        <p className="text-gray-500 text-base mb-8 border-l-4 border-blue-200 pl-4">
          {post.excerpt}
        </p>
      )}

      <div
        className="prose prose-blue max-w-none prose-h2:font-semibold prose-h2:text-gray-900 prose-p:text-gray-700 prose-li:text-gray-700"
        dangerouslySetInnerHTML={{ __html: post.content }}
      />
    </section>
  );
}