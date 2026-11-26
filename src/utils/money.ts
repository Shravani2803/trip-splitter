
import type { Expense, Member } from "../types";

// Calculate each member's share of an expense
export function calculateShares(expense: Expense): Record<string, number> {
  const { amount, split } = expense;

  // Equal split
  if (split.type === "equal") {
    const memberIds = split.memberIds;
    const baseShare = Math.floor(amount / memberIds.length);
    const remainder = amount % memberIds.length;

    return Object.fromEntries(
      memberIds.map((id, index) => [
        id,
        baseShare + (index < remainder ? 1 : 0),
      ])
    );
  }

  // Exact split
  if (split.type === "exact") {
    return { ...split.shares };
  }

  // Percentage split
  const entries = Object.entries(split.shares).map(([id, percent]) => {
    const basisPoints = Math.round(percent * 100);
    const numerator = amount * basisPoints;

    return {
      id,
      share: Math.floor(numerator / 10000),
      remainder: numerator % 10000,
    };
  });

  const totalAssigned = entries.reduce(
    (total, entry) => total + entry.share,
    0
  );

  const remaining = amount - totalAssigned;

  const sorted = [...entries].sort(
    (a, b) => b.remainder - a.remainder
  );

  const extraPaise = new Set(
    sorted.slice(0, remaining).map((entry) => entry.id)
  );

  return Object.fromEntries(
    entries.map((entry) => [
      entry.id,
      entry.share + (extraPaise.has(entry.id) ? 1 : 0),
    ])
  );
}

// Calculate every member's balance
export function calculateBalances(
  members: Member[],
  expenses: Expense[]
): Record<string, number> {
  const balances: Record<string, number> = {};

  members.forEach((member) => {
    balances[member.id] = 0;
  });

  expenses.forEach((expense) => {
    const shares = calculateShares(expense);

    // Add the amount paid by the payer
    balances[expense.paidBy] =
      (balances[expense.paidBy] ?? 0) + expense.amount;

    // Subtract each member's share
    Object.entries(shares).forEach(([memberId, share]) => {
      balances[memberId] =
        (balances[memberId] ?? 0) - share;
    });
  });

  return balances;
}

// Convert paise into Indian currency format
export function formatINR(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount / 100);
}
