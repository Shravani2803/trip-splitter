import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { MemoryRouter } from "react-router-dom";
import expenseReducer from "../features/expenses/expenseSlice";
import AddExpense from "./AddExpense";
import "@testing-library/jest-dom/vitest";
function renderForm() {
  const store = configureStore({
    reducer: {
      expenses: expenseReducer,
    },
  });

  const view = render(
    <Provider store={store}>
      <MemoryRouter>
        <AddExpense />
      </MemoryRouter>
    </Provider>
  );

  return { ...view, store };
}

describe("AddExpense form", () => {
  it("shows validation errors when submitted empty", () => {
    renderForm();

    fireEvent.click(screen.getByRole("button", { name: /save expense/i }));

    expect(screen.getByText(/description is required/i)).toBeInTheDocument();
  });

  it("displays the expense form fields", () => {
    renderForm();

    expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/amount/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/paid by/i)).toBeInTheDocument();
  });
  it("saves a valid expense successfully", () => {
  const { store } = renderForm();

  fireEvent.change(screen.getByLabelText(/description/i), {
    target: { value: "Lunch with friends" },
  });

  fireEvent.change(screen.getByLabelText(/amount/i), {
    target: { value: "500" },
  });

  fireEvent.change(screen.getByLabelText(/paid by/i), {
    target: { value: "m1" },
  });

  fireEvent.change(screen.getByLabelText(/date/i), {
    target: { value: "2026-03-12" },
  });

  fireEvent.change(screen.getByLabelText(/category/i), {
    target: { value: "Food" },
  });

  fireEvent.click(screen.getByLabelText(/Aarav/i));

  fireEvent.click(screen.getByRole("button", { name: /save expense/i }));

  expect(
    store.getState().expenses.expenses.some(
      (expense) => expense.description === "Lunch with friends"
    )
  ).toBe(true);
});
});