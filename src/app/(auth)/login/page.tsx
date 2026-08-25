import Link from "next/link";
import type { Metadata } from "next";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Sign In" };

export default function LoginPage() {
  return (
    <div>
      <LoginForm />
      <p className="text-center text-sm text-slate mt-6">
        Don&apos;t have an account?{" "}
        <Link href="/signup" className="pressable focusable min-h-touch inline-flex items-center text-gold hover:text-gold-2 font-medium transition-colors dur-fast">
          Sign up
        </Link>
      </p>
    </div>
  );
}
