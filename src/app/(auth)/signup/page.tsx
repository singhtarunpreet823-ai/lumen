"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button, FieldError, Input, Label } from "@/components/ui/primitives";
import { Logo } from "@/components/ui/logo";
import { useLumen } from "@/lib/store";
import { isSupabaseConfigured, signUp } from "@/lib/supabase/client";
import { toast } from "sonner";

const schema = z
  .object({
    name: z.string().min(2, "Enter your name"),
    email: z.string().email("Enter a valid email address"),
    password: z.string().min(8, "Use at least 8 characters"),
    confirm: z.string(),
  })
  .refine((d) => d.password === d.confirm, {
    message: "Passwords don't match",
    path: ["confirm"],
  });

type FormValues = z.infer<typeof schema>;

export default function SignupPage() {
  const router = useRouter();
  const setProfile = useLumen((s) => s.setProfile);
  const [loading, setLoading] = useState(false);
  const [supabaseError, setSupabaseError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSignup = handleSubmit(async (values) => {
    setLoading(true);
    setSupabaseError("");
    try {
      if (isSupabaseConfigured) {
        await signUp(values.email, values.password, values.name);
        toast.success("Account created — check your inbox to confirm");
        router.push("/dashboard");
      } else {
        setProfile({
          name: values.name,
          email: values.email,
          currency: "USD",
          monthlyIncome: 0,
          onboarded: true,
          demo: true,
        });
        toast.success("Welcome to Lumen");
        router.push("/dashboard");
      }
    } catch (e) {
      setSupabaseError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  });

  const onDemo = () => {
    const data = useLumen.getState().data;
    const hasData = data.profile && data.transactions.length > 0;
    if (!hasData) useLumen.getState().enterDemo();
    toast.success("Demo workspace loaded — explore everything");
    router.push("/dashboard");
  };

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <div className="mb-8 lg:hidden">
        <Logo />
      </div>
      <h1 className="font-display text-2xl font-semibold tracking-tight text-ink">Create your account</h1>
      <p className="mt-1.5 text-sm text-muted">Start making smarter money decisions in minutes.</p>

      <form onSubmit={onSignup} className="mt-8 space-y-4">
        <div>
          <Label htmlFor="name">Full name</Label>
          <Input id="name" autoComplete="name" placeholder="Ava Chen" {...register("name")} />
          <FieldError message={errors.name?.message} />
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" autoComplete="email" placeholder="you@example.com" {...register("email")} />
          <FieldError message={errors.email?.message} />
        </div>
        <div>
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" autoComplete="new-password" placeholder="8+ characters" {...register("password")} />
          <FieldError message={errors.password?.message} />
        </div>
        <div>
          <Label htmlFor="confirm">Confirm password</Label>
          <Input id="confirm" type="password" autoComplete="new-password" placeholder="Repeat password" {...register("confirm")} />
          <FieldError message={errors.confirm?.message} />
        </div>
        {supabaseError && <p className="text-sm text-expense">{supabaseError}</p>}
        <Button type="submit" loading={loading} className="w-full" size="lg">
          Create account <ArrowRight className="h-4 w-4" />
        </Button>
      </form>

      <div className="my-6 flex items-center gap-3 text-xs text-muted">
        <div className="h-px flex-1 bg-border" />
        or
        <div className="h-px flex-1 bg-border" />
      </div>

      <Button onClick={onDemo} variant="outline" size="lg" className="w-full border-accent/30 text-accent hover:bg-accent/10">
        <Sparkles className="h-4 w-4" />
        Try the seeded demo instead
      </Button>

      <p className="mt-8 text-center text-sm text-muted">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-primary hover:underline">
          Log in
        </Link>
      </p>
    </motion.div>
  );
}