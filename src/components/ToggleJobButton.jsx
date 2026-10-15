"use client";

import { useState } from "react";
import { auth } from "@/lib/firebase";

export default function ToggleJobButton({ id, status, onToggled, className = "" }) {
  const isActive = status === "ACTIVE";
  const [loading, setLoading] = useState(false);

  async function handleToggle() {
    const newStatus = isActive ? "INACTIVE" : "ACTIVE";
    

    try {
      setLoading(true);
      const user = auth.currentUser;
      const token = await user?.getIdToken(true);
      if (!token) { alert("Najpierw zaloguj się."); return; }

      const res = await fetch(`/api/jobs/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `HTTP ${res.status}`);
      }

      const updated = await res.json();
      if (typeof onToggled === "function") onToggled(updated);
    } catch (e) {
      console.error("Toggle job error:", e);
      alert("Nie udało się zmienić statusu oferty.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={loading}
      className={`rounded-lg border px-3 py-1.5 text-sm transition-colors ${
        isActive
          ? "border-yellow-200 text-yellow-700 hover:bg-yellow-50"
          : "border-green-200 text-green-700 hover:bg-green-50"
      } ${className}`}
    >
      {loading ? "…" : isActive ? "Dezaktywuj" : "Aktywuj"}
    </button>
  );
}