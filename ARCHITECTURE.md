# Architecture

## System Overview

Money OS is a Next.js application that processes UPI/bank statements and provides financial insights.

## Data Flow

1. **Upload**: User uploads CSV/PDF via landing page
2. **Parse**: Server actions extract transaction data
3. **Clean**: Merchant names normalized, amounts parsed
4. **Categorize**: Transactions tagged by category
5. **Analyze**: Insights computed from processed data
6. **Display**: Dashboard renders visualizations

## Component Structure

- `page.tsx`: Two-view UI (Landing + Dashboard)
- `actions.ts`: Server-side parsing logic
- `components/`: Reusable UI components
- `lib/`: Core business logic
