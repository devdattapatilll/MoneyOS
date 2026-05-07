# Money OS

**UPI Spend Analyzer & Personal Financial Health Mapper**

## Problem Statement

Millions of users in India transact via UPI daily, but most have no visibility into their spending patterns. Bank statements are static PDFs or CSV dumps that offer no insights. Users cannot easily identify:
- Where their money is going (spending breakdown)
- Recurring subscriptions draining their account
- Overuse of BNPL (Buy Now Pay Later) services
- Food delivery expenses piling up
- Weekend vs weekday spending patterns
- Financial wellness score

## What This Project Solves

Money OS transforms raw UPI/bank statements into actionable financial intelligence. It provides:
- **Automatic categorization** of transactions into 14 categories
- **Financial leak detection** (subscriptions, BNPL, food delivery)
- **Wellness scoring** to gauge financial health
- **Personalized recommendations** with estimated savings
- **Visual analytics** with interactive charts
- **Anomaly detection** for unusual spending

## Architecture

```
money_os/
├── app/                    # Next.js App Router
│   ├── page.tsx           # Two-view UI (Landing + Dashboard)
│   ├── layout.tsx         # Root layout
│   ├── globals.css        # Global styles
│   └── actions.ts        # Server actions for parsing
├── components/            # React components
│   ├── Charts.tsx        # Recharts visualizations
│   ├── KpiCards.tsx      # Financial KPIs
│   ├── LeakDetection.tsx # Leak cards
│   ├── Recommendations.tsx
│   └── WellnessGauge.tsx
├── lib/                  # Core logic
│   ├── parsers/         # CSV/PDF parsing
│   ├── categorizer/     # Transaction categorization
│   ├── analytics/       # Insights, scoring, leak detection
│   └── helpers.ts       # Utility functions
└── data/                # Sample transaction data
```

## Tech Stack

- **Framework**: Next.js 14 + React + TypeScript
- **Styling**: Tailwind CSS + Glassmorphism
- **Charts**: Recharts
- **Parsing**: PapaParse (CSV), pdf-parse (PDF)
- **Matching**: Fuse.js (fuzzy search)
- **Icons**: Lucide React

## Key Features

### 1. Smart Categorization
Automatically tags transactions into 14 categories using keyword matching and fuzzy search:
- Food, Shopping, Transport, Bills
- Healthcare, Entertainment, Travel
- Subscriptions, BNPL, EMI, Investments

### 2. Financial Leak Detection
Identifies money drains:
- **Subscriptions**: Recurring payments to streaming, apps, services
- **BNPL Usage**: Simpl, Lazypay, Zestmoney transactions
- **Food Delivery**: Swiggy, Zomato overuse detection

### 3. Wellness Score (0-100)
Calculates financial health based on:
- Savings ratio (income vs expenses)
- Non-essential spending percentage
- Consistency of monthly balances
- Negative month frequency

### 4. Visual Analytics
- Spend breakdown by category (pie chart)
- Monthly income vs expenses (line chart)
- Top spending categories (bar chart)
- Weekday spending patterns

## How It Works

1. **Upload**: User uploads CSV or PDF bank statement
2. **Parse**: System extracts transactions with date, description, amount
3. **Clean**: Merchant names normalized, amounts parsed
4. **Categorize**: Each transaction tagged by category
5. **Analyze**: Insights computed (totals, trends, anomalies)
6. **Detect**: Leaks identified (subscriptions, BNPL, food)
7. **Score**: Financial wellness calculated
8. **Recommend**: Personalized tips generated with savings estimates
9. **Display**: Dashboard shows all insights

## Sample Data

Includes 100+ realistic Indian UPI transactions for testing without uploading personal data.

## License

MIT — Built for financial awareness and literacy.
