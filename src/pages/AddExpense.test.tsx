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

  return render(
    <Provider store={store}>
      <MemoryRouter>
        <AddExpense />
      </MemoryRouter>
    </Provider>
  );
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
});