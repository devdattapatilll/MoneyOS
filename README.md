# Money OS

**UPI Spend Analyzer & Personal Financial Health Mapper**

A Next.js-based financial assistant with Supabase backend. Upload your UPI transaction statement (CSV or PDF) and instantly unlock spending insights, leak detection, a financial wellness score, and personalized recommendations — all in a polished dark-mode dashboard.

---

## Features

- **File Upload**: Supports CSV and PDF bank/UPI statements.
- **Auto-Extraction**: Extracts transactions using papaparse (CSV) and pdf-parse (PDF).
- **Smart Categorization**: Automatically tags 14 categories using keyword + fuzzy matching (fuse.js).
- **Financial Analytics**: Spending breakdown, monthly trends, top merchants, weekday analysis.
- **Leak Detection**: Finds subscriptions, BNPL usage, food delivery overuse, shopping spikes, and recurring payments.
- **Wellness Score**: A 0–100 score with grade (Excellent / Good / Moderate / Risky).
- **AI-Style Recommendations**: Data-driven actionable tips with estimated monthly savings.
- **Anomaly Alerts**: Flags unusually large transactions per category.
- **Interactive Dashboard**: Built with Recharts, glassmorphism cards, and a dark fintech theme.
- **Supabase Integration**: Save transactions to Supabase backend.
- **Sample Data**: 100+ realistic Indian UPI transactions for instant demo.

---

## Architecture

```
money_os/
├── app/                      # Next.js App Router
│   ├── actions.ts           # Server actions for parsing & Supabase
│   ├── globals.css          # Global styles
│   ├── layout.tsx           # Root layout
│   └── page.tsx             # Main dashboard
│
├── components/              # React components
│   ├── AnomalyAlerts.tsx
│   ├── Charts.tsx
│   ├── KpiCards.tsx
│   ├── LeakDetection.tsx
│   ├── Recommendations.tsx
│   ├── TransactionTable.tsx
│   ├── UploadSection.tsx
│   └── WellnessGauge.tsx
│
├── lib/                     # Utilities & logic
│   ├── analytics/           # Insights, scoring, leak detection
│   ├── categorizer/         # Category rules & engine
│   ├── parsers/             # CSV & PDF parsers
│   ├── cleaner.ts           # Data cleaning
│   ├── helpers.ts           # Date/amount utilities
│   └── supabaseClient.ts    # Supabase client
│
├── data/                    # Sample data
│   └── sample_transactions.csv
│
├── package.json             # Dependencies
├── next.config.mjs          # Next.js config
├── tailwind.config.ts       # Tailwind config
├── tsconfig.json            # TypeScript config
└── README.md                # This file
```

---

## Setup

1. **Clone or download** this repository.
2. **Install dependencies**:
   ```bash
   npm install
   ```
3. **Set up Supabase**:
   - Create a Supabase project
   - Create a `transactions` table with columns: `date`, `description`, `merchant_clean`, `amount`, `type`, `category`, `month`, `day_of_week`, `hour`, `is_weekend`, `is_night`
   - Update `lib/supabaseClient.ts` with your project URL and anon key
4. **Run the dev server**:
   ```bash
   npm run dev
   ```
5. Open http://localhost:3000

---

## Deployment (Vercel)

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables for Supabase if needed
4. Deploy

---

## Tech Stack

- **Framework**: Next.js 14.2 + React 18 + TypeScript
- **Styling**: Tailwind CSS + glassmorphism
- **Charts**: Recharts
- **Backend**: Supabase
- **Parsing**: papaparse, pdf-parse, fuse.js
- **Icons**: lucide-react

---

## License

MIT — built for hackathons and personal finance experiments.
