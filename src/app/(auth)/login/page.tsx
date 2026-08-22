"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { ArrowRight, Eye, EyeOff, Sparkles } from "lucide-react";
import { Button, FieldError, Input, Label } from "@/components/ui/primitives";
import { Logo } from "@/components/ui/logo";
import { useLumen } from "@/lib/store";
import { isSupabaseConfigured, signIn } from "@/lib/supabase/client";
import { toast } from "sonner";

const schema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type FormValues = z.infer<typeof schema>;

function nameFromEmail(email: string) {
  return (
    email
      .split("@")[0]
      .replace(/[._-]+/g, " ")
      .trim()
      .replace(/\b\w/g, (c) => c.toUpperCase()) || "You"
  );
}

export default function LoginPage() {
  const router = useRouter();
  const enterDemo = useLumen((s) => s.enterDemo);
  const setProfile = useLumen((s) => s.setProfile);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [supabaseError, setSupabaseError] = useState("");
  const failsRef = useRef(0);
  const lockUntilRef = useRef(0);
  const [lockSeconds, setLockSeconds] = useState(0);

  useEffect(() => {
    if (lockSeconds <= 0) return;
    const t = setInterval(() => {
      const left = Math.max(0, Math.ceil((lockUntilRef.current - Date.now()) / 1000));
      setLockSeconds(left);
      if (left === 0) failsRef.current = 0;
    }, 1000);
    return () => clearInterval(t);
  }, [lockSeconds]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onLogin = handleSubmit(async (values) => {
    if (Date.now() < lockUntilRef.current) return;
    setLoading(true);
    setSupabaseError("");
    try {
      if (isSupabaseConfigured) {
        await signIn(values.email, values.password);
        router.push("/dashboard");
      } else {
        setProfile({
          name: nameFromEmail(values.email),
          email: values.email,
          currency: "USD",
          monthlyIncome: 6800,
          onboarded: true,
          demo: true,
        });
        toast.success("Welcome back");
        router.push("/dashboard");
      }
    } catch (e) {
      failsRef.current += 1;
      if (failsRef.current >= 5) {
        lockUntilRef.current = Date.now() + 30_000;
        setLockSeconds(30);
        toast.error("Too many attempts. Try again in 30 seconds.");
      } else {
        const msg = e instanceof Error ? e.message : "Something went wrong";
        setSupabaseError(msg);
        toast.error(msg);
      }
    } finally {
      setLoading(false);
    }
  });

  const onDemo = () => {
    enterDemo();
    toast.success("Demo workspace loaded - explore everything");
    router.push("/dashboard");
  };

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <div className="mb-8 lg:hidden">
        <Logo />
      </div>
      <h1 className="font-display text-2xl font-semibold tracking-tight text-ink">Welcome back</h1>
      <p className="mt-1.5 text-sm text-muted">Log in to pick up where you left off.</p>

      <form onSubmit={onLogin} className="mt-8 space-y-4">
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" autoComplete="email" placeholder="you@example.com" {...register("email")} />
          <FieldError message={errors.email?.message} />
        </div>
        <div>
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              placeholder="********"
              className="pr-11"
              {...register("password")}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="absolute right-3 top-1/2 -translate-y-1/2 flex h-7 w-7 items-center justify-center rounded-lg text-muted transition-colors hover:bg-surface-2 hover:text-ink cursor-pointer"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          <FieldError message={errors.password?.message} />
        </div>
        {supabaseError && <p className="text-sm text-expense">{supabaseError}</p>}
        {lockSeconds > 0 && (
          <p className="text-sm text-warning">
            Too many failed attempts. You can try again in {lockSeconds}s.
          </p>
        )}
        <Button type="submit" loading={loading} disabled={lockSeconds > 0} className="w-full" size="lg">
          Log in <ArrowRight className="h-4 w-4" />
        </Button>
      </form>

      <div className="my-6 flex items-center gap-3 text-xs text-muted">
        <div className="h-px flex-1 bg-border" />
        or
        <div className="h-px flex-1 bg-border" />
      </div>

      <Button onClick={onDemo} variant="outline" size="lg" className="w-full border-accent/30 text-accent hover:bg-accent/10">
        <Sparkles className="h-4 w-4" />
        Explore the live demo
      </Button>

      <p className="mt-8 text-center text-sm text-muted">
        New to Lumen?{" "}
        <Link href="/signup" className="font-medium text-primary hover:underline">
          Create an account
        </Link>
      </p>
      <p className="mt-2 text-center text-xs text-muted/70">
        {isSupabaseConfigured ? "Connected to Supabase backend." : "Demo mode - your data stays in this browser."}
      </p>
    </motion.div>
  );
}