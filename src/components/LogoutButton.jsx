"use client";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";

export default function LogoutButton({
  className = "w-full text-left px-3 py-2 hover:bg-gray-50 rounded-lg",
}) {
  return (
    <button type="button" onClick={() => signOut(auth)} className={className}>
      Wyloguj
    </button>
  );
}
