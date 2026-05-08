# SafetyIQ SaaS Order Form

A polished React application for configuring and generating SafetyIQ software order forms with support for:

- **Module selection** across Safety Indicators, DRUID, and JESI product lines
- **Custom line items** with user-defined names, descriptions, and pricing per product
- **Per-item discounts** that reduce prices at the line-item level before subtotals
- **Coterminus proration** — automatically prorates Year 1 fees when new services start mid-cycle, then builds a full year-by-year payment schedule with existing contract escalators
- **Word document generation** — sends structured order data to Claude for professional .docx output with signature lines

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm start
```

The app runs at [http://localhost:3000](http://localhost:3000).

## Build for Production

```bash
npm run build
```

Output goes to the `build/` folder, ready to deploy to any static host.

## How It Works

### 4-Step Wizard Flow

1. **Select Modules** — Choose from 14 standard modules across 3 products. Add custom line items per product. Set discount % on any item.
2. **Configure Plan** — Pick service tier (Standard / Professional / Enterprise) and contract term (36 or 60 months). Toggle coterminus proration and enter existing contract details.
3. **Customer Details** — Company name, contact, email, address, and notes.
4. **Review & Submit** — Full line-item table with discounts, proration schedule, and totals. Generate Word doc or submit.

### Pricing Logic

- **Module price** = base price × tier multiplier × (1 - discount%)
- **Custom item price** = entered price × (1 - discount%) — no tier multiplier
- **Annual Total** = sum of all net line items
- **Proration (Year 1)** = Annual Total × (days to next renewal / 365)
- **Year 2+** = Full SafetyIQ ARR + existing contract ARR × (1 + escalator%)^year

### Coterminus Proration

Enter:
- New service start date
- Next annual renewal date (when existing annual fee is due)
- Master contract end date (end of 36/60 month term)
- Existing contract ARR (optional)
- Annual escalator % (default 3%)

The app builds a year-by-year payment schedule showing SafetyIQ fees, existing contract fees with escalation, and total due per period.

## Tech Stack

- React 18 (Create React App)
- No external UI libraries — pure React with inline styles
- Google Fonts: DM Sans + Playfair Display

## File Structure

```
safetyiq-order-form/
├── public/
│   └── index.html
├── src/
│   ├── index.js
│   └── SafetyIQOrderForm.jsx   # Main app component
├── package.json
└── README.md
```

---

© SafetyIQ, Inc. — Confidential
