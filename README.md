# Trip Splitter

A React and TypeScript application for tracking shared trip expenses and calculating how much each member owes or should receive.

## Features

- Add and delete trip expenses.
- Split expenses equally, by exact amounts, or by percentages.
- View member-wise balances.
- Filter expenses by category.
- Automatically save data using browser local storage.
- Responsive interface with React Router navigation.

## Tech Stack

- React
- TypeScript
- Redux Toolkit
- React Router
- CSS
- Vitest and React Testing Library

## Getting Started

Clone the repository:

```bash
git clone https://github.com/Shravani2803/trip-splitter.git
cd trip-splitter
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

## Design Decisions

1. **Integer paise:** All expense amounts are stored as integer paise to avoid floating-point precision issues.
2. **Equal split rounding:** When an amount cannot be divided equally, extra paise are assigned in the selected members' order.
3. **Largest remainder method:** Percentage splits use the largest remainder method to ensure that allocated shares add up exactly to the expense amount.

## AI Usage

AI tools were used for assistance with implementation guidance, debugging, and test development. The application code and functionality were reviewed and tested during development.