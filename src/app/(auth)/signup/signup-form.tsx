"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function SignupForm() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
        emailRedirectTo: `${window.location.origin}/callback`,
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3.5">
      <div>
        <input
          type="text"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="Full Name"
          required
          className="w-full bg-white/[0.04] border border-white/10 rounded-sm text-bone font-body text-body-lg font-medium px-4 py-3.5 outline-none focus:border-gold/50 focus:bg-gold/[0.04] transition-colors placeholder:text-ink-4 placeholder:font-normal"
        />
      </div>
      <div>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          required
          className="w-full bg-white/[0.04] border border-white/10 rounded-sm text-bone font-body text-body-lg font-medium px-4 py-3.5 outline-none focus:border-gold/50 focus:bg-gold/[0.04] transition-colors placeholder:text-ink-4 placeholder:font-normal"
        />
      </div>
      <div>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          required
          minLength={8}
          className="w-full bg-white/[0.04] border border-white/10 rounded-sm text-bone font-body text-body-lg font-medium px-4 py-3.5 outline-none focus:border-gold/50 focus:bg-gold/[0.04] transition-colors placeholder:text-ink-4 placeholder:font-normal"
        />
      </div>
      {error && (
        <p className="font-condensed text-xs font-bold tracking-[0.15em] uppercase text-blood-2 text-center">
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={loading}
        className="pressable-sink focusable press-redline w-full bg-gold border-none rounded-sm text-ink font-condensed text-sm font-bold tracking-[0.2em] uppercase py-3.5 cursor-pointer hover:bg-gold-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? "Creating account..." : "Create Account"}
      </button>
    </form>
  );
}
