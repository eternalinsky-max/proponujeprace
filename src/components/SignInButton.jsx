"use client";

import { loginWithGoogle } from "@/lib/login-with-google";

export default function SignInButton() {
  return (
    <button
      onClick={loginWithGoogle}
      className="btn bg-red-500 text-white hover:bg-red-600 px-4 py-2 rounded-lg transition-transform hover:scale-[1.03]"
    >
      Zaloguj się przez Google
    </button>
  );
}
