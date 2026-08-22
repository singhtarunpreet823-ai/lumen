"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Save, Download, RotateCcw, Trash2, Moon, Sun } from "lucide-react";
import { PageHeader } from "@/components/dashboard/shared";
import { Button, Card, CardHeader, Input, Label, FieldError, Select } from "@/components/ui/primitives";
import { ConfirmDialog } from "@/components/ui/confirm";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useTheme } from "@/components/theme";
import { useLumen, useProfile } from "@/lib/store";
import { freshDemoData } from "@/lib/seed";
import { toast } from "sonner";

const schema = z.object({
  name: z.string().min(2, "Enter your name").max(60),
  email: z.string().email("Enter a valid email"),
  monthlyIncome: z.coerce.number().min(0).max(100_000_000),
  currency: z.string().min(3),
});

export default function SettingsPage() {
  const profile = useProfile();
  const updateProfile = useLumen((s) => s.updateProfile);
  const resetAll = useLumen((s) => s.resetAll);
  const setProfile = useLumen((s) => s.setProfile);
  const setTransactions = useLumen((s) => s.setTransactions);
  const setBudgets = useLumen((s) => s.setBudgets);
  const setGoals = useLumen((s) => s.setGoals);
  const { theme } = useTheme();
  const [confirmWipe, setConfirmWipe] = useState(false);
  const [confirmReseed, setConfirmReseed] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: profile?.name ?? "",
      email: profile?.email ?? "",
      monthlyIncome: profile?.monthlyIncome ?? 0,
      currency: profile?.currency ?? "USD",
    },
  });

  const onSave = handleSubmit((values) => {
    updateProfile(values);
    toast.success("Profile updated");
  });

  const exportData = () => {
    const data = useLumen.getState().data;
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "lumen-data.json";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Data exported");
  };

  const reseed = () => {
    const demo = freshDemoData({ profileName: profile?.name ?? "Ava Chen", email: profile?.email ?? "ava@lumen.app" });
    setTransactions(demo.transactions);
    setBudgets(demo.budgets);
    setGoals(demo.goals);
    if (profile) setProfile({ ...profile, monthlyIncome: demo.profile?.monthlyIncome ?? profile.monthlyIncome });
    toast.success("Demo data regenerated");
  };

  const wipe = () => {
    resetAll();
    toast("All data cleared", { description: "Sign in or enter the demo again to continue." });
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Settings" description="Profile, preferences and your data." />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card className="p-5">
          <CardHeader title="Profile" subtitle="How Lumen addresses you and your money" />
          <form onSubmit={onSave} className="mt-4 space-y-4">
            <div>
              <Label>Full name</Label>
              <Input {...register("name")} />
              <FieldError message={errors.name?.message} />
            </div>
            <div>
              <Label>Email</Label>
              <Input type="email" {...register("email")} />
              <FieldError message={errors.email?.message} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Monthly income</Label>
                <Input type="number" min="0" step="0.01" {...register("monthlyIncome")} />
                <FieldError message={errors.monthlyIncome?.message} />
              </div>
              <div>
                <Label>Currency</Label>
                <Select {...register("currency")}>
                  {["USD", "EUR", "GBP", "INR", "CAD", "AUD", "JPY", "SGD"].map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </Select>
              </div>
            </div>
            <div className="flex justify-end">
              <Button type="submit">
                <Save className="h-4 w-4" /> Save changes
              </Button>
            </div>
          </form>
        </Card>

        <div className="space-y-4">
          <Card className="p-5">
            <CardHeader title="Appearance" subtitle="Calm, minimal, in any light" />
            <div className="mt-4 flex items-center justify-between rounded-xl bg-surface-2/60 p-4">
              <div className="flex items-center gap-3">
                {theme === "dark" ? <Moon className="h-5 w-5 text-primary" /> : <Sun className="h-5 w-5 text-warning" />}
                <div>
                  <p className="text-sm font-medium text-ink">{theme === "dark" ? "Dark mode" : "Light mode"}</p>
                  <p className="text-xs text-muted">Frosted glass, tuned for this theme.</p>
                </div>
              </div>
              <ThemeToggle />
            </div>
          </Card>

          <Card className="p-5">
            <CardHeader title="Your data" subtitle="You own it. Export it, refresh it, or clear it." />
            <div className="mt-4 space-y-2.5">
              <Button variant="secondary" className="w-full justify-start" onClick={exportData}>
                <Download className="h-4 w-4" /> Export as JSON
              </Button>
              <Button variant="secondary" className="w-full justify-start" onClick={() => setConfirmReseed(true)}>
                <RotateCcw className="h-4 w-4" /> Regenerate demo data
              </Button>
              <Button variant="danger" className="w-full justify-start" onClick={() => setConfirmWipe(true)}>
                <Trash2 className="h-4 w-4" /> Clear all data
              </Button>
            </div>
            <p className="mt-3 text-xs leading-relaxed text-muted">
              In demo mode data lives in your browser only. With Supabase connected, every table is protected by
              row-level security.
            </p>
          </Card>
        </div>
      </div>

      <ConfirmDialog
        open={confirmWipe}
        onClose={() => setConfirmWipe(false)}
        onConfirm={wipe}
        title="Clear all data?"
        description="This permanently deletes every transaction, budget and goal stored in this browser. This cannot be undone."
        confirmLabel="Yes, delete everything"
        danger
      />
      <ConfirmDialog
        open={confirmReseed}
        onClose={() => setConfirmReseed(false)}
        onConfirm={reseed}
        title="Regenerate demo data?"
        description="Your current transactions, budgets and goals will be replaced with a fresh seeded workspace."
        confirmLabel="Regenerate"
      />
    </div>
  );
}