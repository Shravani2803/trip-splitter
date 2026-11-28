import { describe, it, expect } from "vitest";
import { calculateShares, calculateBalances } from "./money";
import type { Expense, Member } from "../types";

describe("calculateShares", () => {
  it("splits ₹100 equally among 3 members", () => {
    const expense: Expense = {
      id: "e1",
      description: "Dinner",
      amount: 10000,
      paidBy: "m1",
      date: "2026-03-12",
      category: "Food",
      split: {
        type: "equal",
        memberIds: ["m1", "m2", "m3"],
      },
    };

    expect(calculateShares(expense)).toEqual({
      m1: 3334,
      m2: 3333,
      m3: 3333,
    });
  });
});

describe("calculateBalances", () => {
  it("calculates balances correctly", () => {
    const members: Member[] = [
      { id: "m1", name: "Aarav" },
      { id: "m2", name: "Diya" },
    ];

    const expenses: Expense[] = [
      {
        id: "e1",
        description: "Dinner",
        amount: 10000,
        paidBy: "m1",
        date: "2026-03-12",
        category: "Food",
        split: {
          type: "equal",
          memberIds: ["m1", "m2"],
        },
      },
    ];

    expect(calculateBalances(members, expenses)).toEqual({
      m1: 5000,
      m2: -5000,
    });
  });
});