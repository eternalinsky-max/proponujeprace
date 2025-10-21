// src/components/AddJobButton.jsx
"use client";

import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";

export default function AddJobButton({
  className = "btn btn-primary",
  children = "Dodaj ofertę",
}) {
  const router = useRouter();

  const handleClick = () => {
    const user = auth.currentUser;
    if (!user) {
      router.push("/login?next=/post-job");
    } else {
      router.push("/post-job");
    }
  };

  return (
    <button className={className} onClick={handleClick} type="button">
      {children}
    </button>
  );
}
