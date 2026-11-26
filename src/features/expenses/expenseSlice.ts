
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { AppData, Expense } from "../../types";
import sampleData from "../../data/sample-data";

const initialState: AppData = sampleData;

const expenseSlice = createSlice({
  name: "expenses",
  initialState,

  reducers: {
    addExpense: (state, action: PayloadAction<Expense>) => {
      state.expenses.push(action.payload);
    },

    deleteExpense: (state, action: PayloadAction<string>) => {
      state.expenses = state.expenses.filter(
        (expense) => expense.id !== action.payload
      );
    },
  },
});

export const { addExpense, deleteExpense } = expenseSlice.actions;

export default expenseSlice.reducer;
