"use client";
import { useEffect, useState } from "react";
import Image from "next/image";

export default function ReviewsList({ targetType, targetId }) {
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [hasNext, setHasNext] = useState(false);
  const [loading, setLoading] = useState(false);

  async function load(p = 1) {
    setLoading(true);
    try {
      const params = new URLSearchParams({ targetType, targetId, page: String(p), perPage: "10" });
      const res = await fetch(`/api/reviews?${params.toString()}`, { cache: "no-store" });
      const data = await res.json();
      setItems(data.items || []);
      setHasNext(!!data.hasNext);
      setPage(p);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(1); }, [targetType, targetId]);

  return (
    <div className="grid gap-3">
      {loading && <div className="text-gray-600">Ładowanie opinii…</div>}
      {!loading && items.length === 0 && (
        <div className="text-gray-600">Brak opinii.</div>
      )}
      {items.map((r) => (
        <div key={r.id} className="rounded-xl border bg-white p-3">
          <div className="mb-1 flex items-center gap-2 text-sm text-gray-700">
            {r.User?.photoUrl ? (
              <Image src={r.User.photoUrl} alt="" width
