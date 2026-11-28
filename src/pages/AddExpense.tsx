
import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { addExpense } from "../features/expenses/expenseSlice";
import type { Category, Split } from "../types";
import "./AddExpense.css";

type SplitType = "equal" | "exact" | "percent";

function AddExpense() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const members = useAppSelector((state) => state.expenses.members);

  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [paidBy, setPaidBy] = useState("");
  const [date, setDate] = useState("");
  const [category, setCategory] = useState<Category | "">("");
  const [splitType, setSplitType] = useState<SplitType>("equal");

  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [shares, setShares] = useState<Record<string, string>>({});

  const [errors, setErrors] = useState<Record<string, string>>({});

  const today = new Date().toLocaleDateString("en-CA");

  const toggleMember = (id: string) => {
    setSelectedMembers((previous) =>
      previous.includes(id)
        ? previous.filter((memberId) => memberId !== id)
        : [...previous, id]
    );
  };

  const updateShare = (id: string, value: string) => {
    setShares((previous) => ({
      ...previous,
      [id]: value,
    }));
  };
const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const newErrors: Record<string, string> = {};

    const parsedAmount = Number(amount);
    const amountInPaise = Math.round(parsedAmount * 100);

    if (!description.trim()) {
      newErrors.description = "Description is required";
    } else if (description.trim().length > 60) {
      newErrors.description = "Maximum 60 characters allowed";
    }

    if (!amount.trim() || !/^\d+(\.\d{1,2})?$/.test(amount) ||
      !Number.isFinite(parsedAmount)) {
      newErrors.amount = "Enter a valid amount with up to 2 decimals";
    } else if (parsedAmount <= 0) {
      newErrors.amount = "Amount must be more than ₹0";
    } else if (parsedAmount > 1000000) {
      newErrors.amount = "Amount cannot exceed ₹10,00,000";
    }

    if (!paidBy) {
      newErrors.paidBy = "Select who paid";
    }

    if (!date) {
      newErrors.date = "Date is required";
    } else if (date > today) {
      newErrors.date = "Date cannot be in the future";
    }

    if (!category) {
      newErrors.category = "Select a category";
    }

    let split: Split | null = null;

    if (splitType === "equal") {
      if (selectedMembers.length === 0) {
        newErrors.split = "Select at least one member";
      } else {
        split = {
          type: "equal",
          memberIds: selectedMembers,
        };
      }
    }

    if (splitType === "exact") {
      const exactShares: Record<string, number> = {};
      let valid = true;
      let total = 0;

      members.forEach((member) => {
        const value = shares[member.id] ?? "0";

        if (!/^\d+(\.\d{1,2})?$/.test(value)) {
          valid = false;
        } else {
          const paise = Math.round(Number(value) * 100);
          exactShares[member.id] = paise;
          total += paise;
        }
      });

      if (!valid) {
        newErrors.split = "Enter valid amounts with up to 2 decimals";
      } else if (total !== amountInPaise) {
        const difference = Math.abs(amountInPaise - total);
        const formatted = (difference / 100).toFixed(2);

        newErrors.split = `₹${formatted} ${
          total < amountInPaise ? "left to assign" : "over assigned"
        }`;
      } else {
        split = {
          type: "exact",
          shares: exactShares,
        };
      }
    }

    if (splitType === "percent") {
      const percentShares: Record<string, number> = {};
      let total = 0;
      let valid = true;

      members.forEach((member) => {
        const value = shares[member.id] ?? "0";

        if (!/^\d+(\.\d{1,2})?$/.test(value) ||
          Number(value) < 0 || Number(value) > 100) {
          valid = false;
        } else {
          percentShares[member.id] = Number(value);
          total += Number(value);
        }
      });

      if (!valid) {
        newErrors.split = "Each percentage must be between 0 and 100";
      } else if (Math.round(total * 100) !== 10000) {
        newErrors.split = `Percentages must total exactly 100%. Current total: ${total}%`;
      } else {
        split = {
          type: "percent",
          shares: percentShares,
        };
      }
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0 || !split || !category) {
      return;
    }

    dispatch(
      addExpense({
        id: crypto.randomUUID(),
        description: description.trim(),
        amount: amountInPaise,
        paidBy,
        date,
        category,
        split,
      })
    );

    navigate("/", {
      state: { message: "Expense added successfully!" },
    });
  };

  return (
    <main className="form-container">
      <h1>Add New Expense</h1>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="description">Description</label>
          <input
            id="description"
            value={description}
            maxLength={61}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g. Dinner"
          />
          {errors.description && <p className="error">{errors.description}</p>}
        </div>

        <div className="form-group">
          <label htmlFor="amount">Amount (₹)</label>
          <input
            id="amount"
            type="number"
            min="0.01"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter amount"
          />
          {errors.amount && <p className="error">{errors.amount}</p>}
        </div>

        <div className="form-group">
          <label htmlFor="paidBy">Paid by</label>
          <select
            id="paidBy"
            value={paidBy}
            onChange={(e) => setPaidBy(e.target.value)}
          >
            <option value="">Select member</option>
            {members.map((member) => (
              <option key={member.id} value={member.id}>
                {member.name}
              </option>
            ))}
          </select>
          {errors.paidBy && <p className="error">{errors.paidBy}</p>}
        </div>

        <div className="form-group">
          <label htmlFor="date">Date</label>
          <input
            id="date"
            type="date"
            max={today}
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
          {errors.date && <p className="error">{errors.date}</p>}
        </div>

        <div className="form-group">
          <label htmlFor="category">Category</label>
          <select
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value as Category | "")}
          >
            <option value="">Select category</option>
            <option value="Food">Food</option>
            <option value="Travel">Travel</option>
            <option value="Stay">Stay</option>
            <option value="Activities">Activities</option>
            <option value="Other">Other</option>
          </select>
          {errors.category && <p className="error">{errors.category}</p>}
        </div>

        <div className="form-group">
          <label>Split type</label>
          <select
            value={splitType}
            onChange={(e) => {
              setSplitType(e.target.value as SplitType);
              setShares({});
              setSelectedMembers([]);
              setErrors({});
            }}
          >
            <option value="equal">Equally</option>
            <option value="exact">Exact amounts</option>
            <option value="percent">Percentages</option>
          </select>
        </div>

        {splitType === "equal" && (
          <div className="form-group">
            <label>Select members</label>

            {members.map((member) => (
              <label className="member-option" key={member.id}>
                <input
                  type="checkbox"
                  checked={selectedMembers.includes(member.id)}
                  onChange={() => toggleMember(member.id)}
                />
                {member.name}
              </label>
            ))}
          </div>
        )}

        {(splitType === "exact" || splitType === "percent") && (
          <div className="form-group">
            <label>
              {splitType === "exact"
                ? "Enter each member's share (₹)"
                : "Enter each member's percentage (%)"}
            </label>

            {members.map((member) => (
              <div className="share-input" key={member.id}>
                <label htmlFor={`share-${member.id}`}>
                  {member.name}
                </label>

                <input
                  id={`share-${member.id}`}
                  type="number"
                  min="0"
                  max={splitType === "percent" ? "100" : undefined}
                  step="0.01"
                  value={shares[member.id] ?? ""}
                  onChange={(e) => updateShare(member.id, e.target.value)}
                />
              </div>
            ))}
          </div>
        )}

        {errors.split && <p className="error">{errors.split}</p>}

        <div className="form-actions">
          <button type="submit" className="save-btn">
            Save Expense
          </button>

          <button
            type="button"
            className="cancel-btn"
            onClick={() => navigate("/")}
          >
            Cancel
          </button>
        </div>
      </form>
    </main>
  );
}

export default AddExpense;
