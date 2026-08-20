"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { uid } from "@/lib/utils";
import type { Budget, Goal, Profile, Transaction, TxType, UserData } from "@/lib/types";
import { autoCategorize } from "@/lib/categories";
import { formatMonthKey, todayISO } from "@/lib/format";
import { freshDemoData } from "@/lib/seed";

const EMPTY: UserData = {
  version: 2,
  profile: null,
  transactions: [],
  budgets: [],
  goals: [],
};

interface LumenState {
  data: UserData;
  hydrated: boolean;
  setHydrated: (v: boolean) => void;
  setProfile: (profile: Profile) => void;
  updateProfile: (patch: Partial<Profile>) => void;
  setTransactions: (transactions: Transaction[]) => void;
  setBudgets: (budgets: Budget[]) => void;
  setGoals: (goals: Goal[]) => void;
  addTransaction: (tx: {
    type: TxType;
    amount: number;
    merchant: string;
    date?: string;
    categoryId?: string;
    note?: string;
    recurring?: boolean;
  }) => Transaction;
  updateTransaction: (id: string, patch: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;
  setBudget: (month: string, categoryId: string, amount: number) => void;
  deleteBudget: (month: string, categoryId: string) => void;
  addGoal: (goal: Omit<Goal, "id">) => Goal;
  contributeToGoal: (id: string, amount: number) => void;
  withdrawFromGoal: (id: string, amount: number) => void;
  deleteGoal: (id: string) => void;
  enterDemo: () => void;
  resetAll: () => void;
}

export const useLumen = create<LumenState>()(
  persist(
    (set, get) => ({
      data: EMPTY,
      hydrated: false,
      setHydrated: (v) => set({ hydrated: v }),

      setProfile: (profile) => set((s) => ({ data: { ...s.data, profile } })),
      updateProfile: (patch) =>
        set((s) => ({
          data: { ...s.data, profile: s.data.profile ? { ...s.data.profile, ...patch } : s.data.profile },
        })),

      setTransactions: (transactions) => set((s) => ({ data: { ...s.data, transactions } })),
      setBudgets: (budgets) => set((s) => ({ data: { ...s.data, budgets } })),
      setGoals: (goals) => set((s) => ({ data: { ...s.data, goals } })),

      addTransaction: (tx) => {
        const id = uid("tx");
        const categoryId = tx.categoryId ?? autoCategorize(tx.merchant, tx.type);
        const record: Transaction = {
          id,
          type: tx.type,
          amount: Math.abs(tx.amount),
          merchant: tx.merchant,
          categoryId,
          date: tx.date ?? todayISO(),
          note: tx.note,
          recurring: tx.recurring,
          createdAt: new Date().toISOString(),
        };
        set((s) => ({
          data: { ...s.data, transactions: [record, ...s.data.transactions] },
        }));
        return record;
      },

      updateTransaction: (id, patch) =>
        set((s) => ({
          data: {
            ...s.data,
            transactions: s.data.transactions.map((t) =>
              t.id === id
                ? {
                    ...t,
                    ...patch,
                    categoryId: patch.merchant && !patch.categoryId ? autoCategorize(patch.merchant, t.type) : (patch.categoryId ?? t.categoryId),
                  }
                : t,
            ),
          },
        })),

      deleteTransaction: (id) =>
        set((s) => ({
          data: { ...s.data, transactions: s.data.transactions.filter((t) => t.id !== id) },
        })),

      setBudget: (month, categoryId, amount) => {
        const exists = get().data.budgets.find((b) => b.month === month && b.categoryId === categoryId);
        if (exists) {
          set((s) => ({
            data: {
              ...s.data,
              budgets: s.data.budgets.map((b) => (b.id === exists.id ? { ...b, amount } : b)),
            },
          }));
        } else {
          set((s) => ({
            data: {
              ...s.data,
              budgets: [...s.data.budgets, { id: uid("budget"), month, categoryId, amount }],
            },
          }));
        }
      },

      deleteBudget: (month, categoryId) =>
        set((s) => ({
          data: {
            ...s.data,
            budgets: s.data.budgets.filter((b) => !(b.month === month && b.categoryId === categoryId)),
          },
        })),

      addGoal: (goal) => {
        const g: Goal = { ...goal, id: uid("goal") };
        set((s) => ({ data: { ...s.data, goals: [...s.data.goals, g] } }));
        return g;
      },

      contributeToGoal: (id, amount) =>
        set((s) => ({
          data: {
            ...s.data,
            goals: s.data.goals.map((g) =>
              g.id === id ? { ...g, saved: Math.min(g.target, g.saved + Math.abs(amount)) } : g,
            ),
          },
        })),

      withdrawFromGoal: (id, amount) =>
        set((s) => ({
          data: {
            ...s.data,
            goals: s.data.goals.map((g) => (g.id === id ? { ...g, saved: Math.max(0, g.saved - Math.abs(amount)) } : g)),
          },
        })),

      deleteGoal: (id) =>
        set((s) => ({ data: { ...s.data, goals: s.data.goals.filter((g) => g.id !== id) } })),

      enterDemo: () => {
        const data = freshDemoData();
        set({ data });
      },

      resetAll: () => set({ data: EMPTY }),
    }),
    {
      name: "lumen:data",
      version: 2,
      partialize: (s) => ({ data: s.data }),
      onRehydrateStorage: () => (state) => {
        if (state) state.setHydrated(true);
      },
    },
  ),
);

export function useProfile() {
  return useLumen((s) => s.data.profile);
}

export function useTransactions() {
  return useLumen((s) => s.data.transactions);
}

export function useBudgets() {
  return useLumen((s) => s.data.budgets);
}

export function useGoals() {
  return useLumen((s) => s.data.goals);
}

export { formatMonthKey };