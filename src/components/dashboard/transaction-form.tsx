"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Sparkles } from "lucide-react";
import { Dialog } from "@/components/ui/dialog";
import { Button, FieldError, Input, Label, Select, Segmented, Textarea } from "@/components/ui/primitives";
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES, autoCategorize } from "@/lib/categories";
import { todayISO } from "@/lib/format";
import type { Transaction, TxType } from "@/lib/types";

const schema = z.object({
  type: z.enum(["income", "expense"]),
  amount: z.coerce.number().positive("Amount must be greater than 0").max(1_000_000, "That amount looks too large"),
  merchant: z.string().min(2, "Add a description").max(80, "Keep it under 80 characters"),
  categoryId: z.string().min(1),
  date: z.string().min(1, "Pick a date"),
  note: z.string().max(200).optional(),
  recurring: z.boolean().optional(),
});

type FormValues = z.infer<typeof schema>;

export function TransactionFormDialog({
  open,
  onClose,
  editing,
  onSubmit,
}: {
  open: boolean;
  onClose: () => void;
  editing?: Transaction | null;
  onSubmit: (values: FormValues) => void;
}) {
  const [type, setType] = React.useState<TxType>(editing?.type ?? "expense");
  const [suggested, setSuggested] = React.useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      type: editing?.type ?? "expense",
      amount: editing?.amount ?? undefined,
      merchant: editing?.merchant ?? "",
      categoryId: editing?.categoryId ?? "food-dining",
      date: editing?.date ?? todayISO(),
      note: editing?.note ?? "",
      recurring: editing?.recurring ?? false,
    },
  });

  const merchant = watch("merchant");

  React.useEffect(() => {
    if (editing) {
      reset({
        type: editing.type,
        amount: editing.amount,
        merchant: editing.merchant,
        categoryId: editing.categoryId,
        date: editing.date,
        note: editing.note ?? "",
        recurring: editing.recurring ?? false,
      });
      setType(editing.type);
      setSuggested(null);
    } else {
      reset({
        type: "expense",
        amount: undefined as unknown as number,
        merchant: "",
        categoryId: "food-dining",
        date: todayISO(),
        note: "",
        recurring: false,
      });
      setType("expense");
      setSuggested(null);
    }
  }, [editing, open, reset]);

  React.useEffect(() => {
    if (!editing && merchant.trim().length >= 3 && !suggested) {
      const cat = autoCategorize(merchant, type);
      setSuggested(cat);
    }
  }, [merchant, type, editing, suggested]);

  const applySuggestion = () => {
    if (!suggested) return;
    setValue("categoryId", suggested);
    setSuggested(null);
  };

  const onTypeChange = (t: TxType) => {
    setType(t);
    setValue("type", t);
    setValue("categoryId", t === "income" ? "salary" : "food-dining");
  };

  const categories = type === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={editing ? "Edit transaction" : "Add transaction"}
      description={editing ? "Update the details below." : "Income or expense — Lumen will categorize it automatically."}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Segmented
          options={[
            { value: "expense", label: "Expense" },
            { value: "income", label: "Income" },
          ]}
          value={type}
          onChange={onTypeChange}
          className="w-full [&>button]:flex-1"
        />
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>Amount</Label>
            <Input
              type="number"
              step="0.01"
              min="0.01"
              placeholder="0.00"
              autoFocus
              {...register("amount")}
            />
            <FieldError message={errors.amount?.message} />
          </div>
          <div>
            <Label>Date</Label>
            <Input type="date" {...register("date")} />
            <FieldError message={errors.date?.message} />
          </div>
        </div>
        <div>
          <Label>Description</Label>
          <Input placeholder={type === "expense" ? "e.g. Starbucks" : "e.g. Acme Corp Payroll"} {...register("merchant")} />
          <FieldError message={errors.merchant?.message} />
          {suggested && (
            <button
              type="button"
              onClick={applySuggestion}
              className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-accent/30 bg-accent/10 px-2.5 py-1 text-xs font-medium text-accent transition-colors hover:bg-accent/20 cursor-pointer"
            >
              <Sparkles className="h-3 w-3" />
              Auto-detected: {categories.find((c) => c.id === suggested)?.name} — apply
            </button>
          )}
        </div>
        <div>
          <Label>Category</Label>
          <Select {...register("categoryId")}>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <Label>Note (optional)</Label>
          <Textarea placeholder="Anything worth remembering?" {...register("note")} />
        </div>
        <label className="flex cursor-pointer items-center gap-2.5 text-sm text-muted">
          <input type="checkbox" className="h-4 w-4 accent-emerald-500" {...register("recurring")} />
          Recurring charge (e.g. subscription)
        </label>
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">{editing ? "Save changes" : "Add transaction"}</Button>
        </div>
      </form>
    </Dialog>
  );
}