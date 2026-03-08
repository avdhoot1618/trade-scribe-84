# 📒 Digital Trade Book

A comprehensive trading journal web application designed for Indian market traders to log, analyze, and improve their trading performance.

![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3-06B6D4?logo=tailwindcss&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-5-646CFF?logo=vite&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-Backend-3FCF8E?logo=supabase&logoColor=white)

---

## 🚀 Features

### 📊 Dashboard
- Real-time portfolio overview with key metrics (Total P&L, Win Rate, Trade Count)
- Daily performance summary
- Live stock price ticker via edge functions

### 📝 Trade Journal
- Log trades with full details: instrument, entry/exit prices, quantity, stop loss, target
- Support for **Long** and **Short** trade types
- Session tracking: Pre-Market, Regular, Post-Market
- Market sentiment tagging (Bullish, Bearish, Sideways, Neutral, Volatile)
- Mood tracking per trade (Frustrated, Neutral, Confident, Anxious, Disciplined)
- Save as draft functionality
- Search and filter trades by instrument
- Expandable trade cards with detailed breakdown

### 📈 Analytics
- Visual performance charts and statistics
- P&L trends over time
- Win/loss ratio analysis
- Instrument-wise performance breakdown

### ⚠️ Violations Tracker
- Track trading rule violations per trade
- 10 predefined violation types (FOMO entry, Revenge traded, Broke stop loss, etc.)
- Severity levels: Low, Medium, High
- Custom violation notes

### 📄 Trading Notes
- Consolidated view of all trade notes
- Mood-based emoji indicators
- Chronological organization

### 🔐 Authentication
- Secure email-based authentication
- Row-Level Security (RLS) for data isolation
- Each user can only access their own trades

---

## 🏗️ Tech Stack

| Layer        | Technology                          |
|------------- |-------------------------------------|
| **Frontend** | React 18, TypeScript, Vite          |
| **Styling**  | Tailwind CSS, shadcn/ui, Radix UI   |
| **Backend**  | Supabase (PostgreSQL, Auth, RLS)    |
| **Charts**   | Recharts                            |
| **Forms**    | React Hook Form, Zod validation     |
| **Routing**  | React Router v6                     |
| **State**    | TanStack React Query                |

---

## 📁 Project Structure

```
src/
├── components/
│   ├── journal/          # Trade entry form
│   ├── layout/           # AppShell (sidebar, header)
│   └── ui/               # shadcn/ui components
├── hooks/                # Custom hooks (toast, mobile, stock prices)
├── integrations/
│   └── supabase/         # Auto-generated client & types
├── lib/                  # Utility functions & calculations
├── pages/                # Route pages
│   ├── Auth.tsx           # Login / Signup
│   ├── Dashboard.tsx      # Overview
│   ├── Journal.tsx        # Trade log
│   ├── Analytics.tsx      # Charts & stats
│   ├── Violations.tsx     # Rule violations
│   ├── Notes.tsx          # Trade notes
│   └── Landing.tsx        # Public landing page
├── types/
│   └── trade.ts          # TypeScript interfaces & constants
└── index.css             # Design system tokens
supabase/
├── config.toml           # Supabase project config
└── functions/
    └── stock-prices/     # Edge function for live prices
```

---

## 🗄️ Database Schema

### `trade_entries`
| Column             | Type      | Description                    |
|--------------------|-----------|--------------------------------|
| `id`               | UUID (PK) | Auto-generated                 |
| `user_id`          | UUID      | References auth.users          |
| `trade_date`       | Date      | Date of the trade              |
| `trade_day`        | Text      | Day of the week                |
| `session`          | Text      | Pre-Market / Regular / Post    |
| `instrument`       | Text      | Stock or instrument name       |
| `trade_type`       | Text      | Long / Short                   |
| `sentiment`        | Text      | Market sentiment               |
| `entry_price`      | Numeric   | Entry price                    |
| `exit_price`       | Numeric   | Exit price                     |
| `target_quantity`   | Numeric   | Planned quantity               |
| `executed_quantity` | Numeric   | Actual quantity                |
| `stop_loss`        | Numeric   | Stop loss price                |
| `target_price`     | Numeric   | Target price                   |
| `gross_pnl`        | Numeric   | Gross profit/loss              |
| `brokerage`        | Numeric   | Brokerage charges              |
| `net_pnl`          | Numeric   | Net profit/loss                |
| `mood`             | Text      | Trader's mood                  |
| `notes`            | Text      | Trade notes                    |
| `is_draft`         | Boolean   | Draft status                   |

### `violations`
| Column           | Type      | Description                    |
|------------------|-----------|--------------------------------|
| `id`             | UUID (PK) | Auto-generated                 |
| `trade_entry_id` | UUID (FK) | References trade_entries       |
| `user_id`        | UUID      | References auth.users          |
| `violation_type` | Text      | Type of violation              |
| `severity`       | Text      | Low / Medium / High            |
| `violation_notes` | Text     | Additional notes               |
| `violation_date` | Date      | Date of violation              |

### `user_settings`
| Column             | Type      | Description                   |
|--------------------|-----------|-------------------------------|
| `id`               | UUID (PK) | Auto-generated               |
| `user_id`          | UUID      | References auth.users         |
| `default_brokerage`| Numeric   | Default brokerage amount      |
| `currency`         | Text      | Preferred currency (INR)      |
| `timezone`         | Text      | User timezone                 |

---

## 🛠️ Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18+)
- npm or bun

### Installation

```bash
# Clone the repository
git clone <YOUR_GIT_URL>

# Navigate to the project
cd digital-trade-book

# Install dependencies
npm install

# Start the development server
npm run dev
```

The app will be available at `http://localhost:8080`.

### Available Scripts

| Script          | Description                        |
|-----------------|------------------------------------|
| `npm run dev`   | Start dev server with HMR          |
| `npm run build` | Production build                   |
| `npm run lint`  | Run ESLint                         |
| `npm run test`  | Run tests with Vitest              |
| `npm run preview` | Preview production build         |

---

## 🔒 Security

- **Row-Level Security (RLS)** enabled on all tables
- Users can only read/write their own data
- Authentication handled via Supabase Auth
- No sensitive keys stored in client code

---

## 📜 License

This project is private and not licensed for public distribution.

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

Built with ❤️ using [Lovable](https://lovable.dev)
