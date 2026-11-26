
import { useState } from "react";
import { useAppDispatch, useAppSelector } from "./app/hooks";
import { deleteExpense } from "./features/expenses/expenseSlice";
import { calculateBalances, formatINR } from "./utils/money";
import "./App.css";
import { BrowserRouter, Routes, Route, Link, useLocation } from "react-router-dom";
import AddExpense from "./pages/AddExpense";

function ExpensesPage() {
  const dispatch = useAppDispatch();
const location = useLocation();
const successMessage = location.state?.message as string | undefined;
  const members = useAppSelector((state) => state.expenses.members);
  const expenses = useAppSelector((state) => state.expenses.expenses);

  const [category, setCategory] = useState("All");

  const balances = calculateBalances(members, expenses);

  const filteredExpenses = expenses
    .filter((expense) => category === "All" || expense.category === category)
    .sort((a, b) => b.date.localeCompare(a.date));

  const total = filteredExpenses.reduce(
    (sum, expense) => sum + expense.amount,
    0
  );

  const getMemberName = (id: string) =>
    members.find((member) => member.id === id)?.name ?? "Unknown";

  const getSplitLabel = (expense: (typeof expenses)[number]) => {
    if (expense.split.type === "equal") {
      return `Equally, ${expense.split.memberIds.length} people`;
    }

    if (expense.split.type === "exact") {
      return "Exact amounts";
    }

    return "Percentages";
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this expense?")) {
      dispatch(deleteExpense(id));
    }
  };

  return (
    <div className="app">
      <nav className="navbar">
  <h2>Trip Splitter</h2>
  <div>
    <Link to="/">Expenses</Link>
    {" | "}
    <Link to="/expenses/new">Add Expense</Link>
  </div>
</nav>

      <main className="container">
        {successMessage && (
  <p className="success-message">{successMessage}</p>
)}
        <h1>Goa Trip Expenses</h1>
        <p className="subtitle">Manage your group's shared expenses</p>

        <h2>Member Balances</h2>

        <div className="balance-grid">
          {members.map((member) => {
            const balance = balances[member.id] ?? 0;

            return (
              <div className="balance-card" key={member.id}>
                <h3>{member.name}</h3>

                <strong className={balance >= 0 ? "positive" : "negative"}>
                  {balance > 0
                    ? "Gets back "
                    : balance < 0
                      ? "Owes "
                      : "Settled up"}
                  {balance !== 0 && formatINR(Math.abs(balance))}
                </strong>
              </div>
            );
          })}
        </div>

        <div className="expense-heading">
          <h2>Expenses</h2>
          <span>Total: {formatINR(total)}</span>
        </div>

        <div className="filter">
          <label htmlFor="category">Filter by category:</label>

          <select
            id="category"
            value={category}
            onChange={(event) =>
              setCategory(event.target.value)
            }
          >
            <option value="All">All categories</option>
            <option value="Food">Food</option>
            <option value="Travel">Travel</option>
            <option value="Stay">Stay</option>
            <option value="Activities">Activities</option>
            <option value="Other">Other</option>
          </select>
        </div>

        {filteredExpenses.length === 0 ? (
          <p className="empty">No expenses found.</p>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Description</th>
                  <th>Category</th>
                  <th>Paid By</th>
                  <th>Amount</th>
                  <th>Split</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {filteredExpenses.map((expense) => (
                  <tr key={expense.id}>
                    <td>{expense.date}</td>
                    <td>{expense.description}</td>
                    <td>{expense.category}</td>
                    <td>{getMemberName(expense.paidBy)}</td>
                    <td>{formatINR(expense.amount)}</td>
                    <td>{getSplitLabel(expense)}</td>
                    <td>
                      <button
                        className="delete-btn"
                        onClick={() => handleDelete(expense.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}


function NotFound() {
  return (
    <main className="container">
      <h1>Page not found</h1>
      <Link to="/">Back to Expenses</Link>
    </main>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ExpensesPage />} />
        <Route path="/expenses/new" element={<AddExpense />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

