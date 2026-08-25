import Link from "next/link";
import type { Metadata } from "next";
import { SignupForm } from "./signup-form";

export const metadata: Metadata = { title: "Sign Up" };

export default function SignupPage() {
  return (
    <div>
      <SignupForm />
      <p className="text-center text-sm text-slate mt-6">
        Already have an account?{" "}
        <Link href="/login" className="min-h-touch inline-flex items-center text-gold hover:text-gold-2 font-medium transition-colors dur-fast">
          Sign in
        </Link>
      </p>
    </div>
  );
}
