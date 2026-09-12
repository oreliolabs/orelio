# 💎 Orelio Wealth Ledger

> A modern, high-performance, offline-first personal wealth management ledger. Track diversified portfolios, bank liquidity, deposits, insurance coverage, loans, and family net worth with privacy and security.

![React 19](https://img.shields.io/badge/React-19.2-blue?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-6.0-blue?logo=typescript)
![Vite](https://img.shields.io/badge/Vite-8.1-646CFF?logo=vite)
![TailwindCSS v4](https://img.shields.io/badge/TailwindCSS-v4.3-38BDF8?logo=tailwindcss)
![Bun](https://img.shields.io/badge/Bun-1.4+-fbf0df?logo=bun)

---

## 🌟 Key Highlights

- 🔒 **100% Offline-First Architecture**: Your sensitive financial data never leaves your machine. Everything is persisted locally in the browser's encrypted storage (`orelio_database_v2`).
- 👥 **Multi-User Vaults & Family Management**: Create and switch between multiple user vaults. Organize assets and liabilities per family member (Self, Spouse, Children, Parents) or view unified household metrics.
- 📄 **Automated CAS (e-CAS) PDF Parser**: Ingest NSDL / CDSL Consolidated Account Statements (CAS) directly in the browser using client-side PDF parsing to extract equities, mutual funds, and debt holdings.
- 🛡️ **Vault Security & Privacy Mode**: Optional password protection powered by SHA-256 & PBKDF2 cryptography. Includes a one-click Privacy Mask toggle (`isPrivate`) to hide sensitive balances with `••••••` across all views.
- 📊 **Dynamic Portfolio Analytics**: Interactive asset and liability allocation breakdowns powered by Recharts, tracking Liquid Cash vs. Invested Wealth, Total Assets, Total Liabilities, and Net Worth.

---

## 💼 Core Financial Modules

### 1. 📊 Overview & Dashboard
- **Aggregate Wealth Tracking**: Live net worth calculation across all asset classes and debt obligations.
- **Liquidity Ratio**: Instant breakdown between readily accessible liquid funds and long-term invested capital.
- **Visual Allocations**: Interactive donut and bar charts showing portfolio distribution across cash, deposits, equities, mutual funds, and loans.
- **Member Filtering**: Filter the entire dashboard by an individual family member or view combined household finances.

### 2. 📈 Stocks, Mutual Funds & Debts
- **Comprehensive Equity Tracking**: Monitor company holdings, buy quantities, purchase price, current value, and unrealized P&L.
- **Mutual Funds & Debt Instruments**: Categorized portfolios with folio numbers and fund houses.
- **CAS PDF Import**: Upload password-protected e-CAS statements with client-side decryption and auto-population.

### 3. 🏦 Bank Accounts & Liquidity
- **Multi-Bank Management**: Organize savings and current accounts across institutions.
- **Liquidity Monitoring**: Real-time balance summaries, account type badges, and quick-copy account numbers.

### 4. ⏳ Fixed & Recurring Deposits (FD / RD)
- **Active & Matured Tracking**: Separate lifecycle tracking for ongoing investments and completed returns.
- **Maturity Calculations**: Real-time maturity progress bars, interest accrual calculations, maturity dates, and automated status resolution.

### 5. 🛡️ Insurance & Protection
- **Multi-Category Coverage**: Manage Health, Term, Life, and Motor insurance policies.
- **Policy Records**: Policy numbers, insurers, sum assured, annual premiums, payment frequencies, and renewal countdowns.

### 6. 💳 Loans & Liabilities
- **Liability Profiling**: Track home loans, vehicle loans, personal loans, and education lines of credit.
- **Loan Parameters**: Principal amounts, interest rates, tenure, EMI schedules, and remaining balances.

### 7. 🔐 Secure Locker Notes
- **Private Financial Notes**: Store sensitive credentials, document safe locations, insurance agent contacts, and testament reminders.

---

## 🛠️ Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Core Framework** | [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/) |
| **Build Tooling** | [Vite 8](https://vitejs.dev/) + [Bun](https://bun.sh/) / Node.js |
| **Styling & Design** | [Tailwind CSS v4](https://tailwindcss.com/) with custom CSS design tokens |
| **Icons & Typography** | Google Material Symbols Outlined, [Lucide React](https://lucide.dev/), Google Fonts (*Hanken Grotesk*) |
| **Data Visualization** | [Recharts](https://recharts.org/) |
| **PDF Processing** | [PDF.js (`pdfjs-dist`)](https://mozilla.github.io/pdf.js/) for client-side CAS statement parsing |
| **Cryptography** | Web Crypto API (SHA-256 + PBKDF2 hash & verify) |
| **Linter** | [Oxlint](https://oxc.rs/) |

---

## 📁 Project Structure

```
orelio/
├── .agents/skills/                   # Agent custom skills & design auditor
│   └── orelio-design-system-auditor/
├── src/
│   ├── components/
│   │   ├── cash_and_bank/            # Bank Accounts, Deposits & modal controllers
│   │   │   ├── BankAccounts.tsx
│   │   │   ├── Deposits.tsx
│   │   │   ├── AddEditDepositModal.tsx
│   │   │   └── DeleteDepositModal.tsx
│   │   ├── common/                   # Shared UI buttons & modal dialogs
│   │   │   ├── PrimaryButton.tsx
│   │   │   ├── SaveButton.tsx
│   │   │   ├── CancelButton.tsx
│   │   │   └── LogoutConfirmationModal.tsx
│   │   ├── insurance/                # Insurance policies & modals
│   │   │   ├── Insurance.tsx
│   │   │   ├── AddEditPolicyModal.tsx
│   │   │   └── DeletePolicyModal.tsx
│   │   ├── loans_and_credit/         # Loans & liabilities management
│   │   │   ├── LoansAndCredit.tsx
│   │   │   └── AddEditLoanModal.tsx
│   │   ├── locker/                   # Secure encrypted notes & locker records
│   │   │   └── Notes.tsx
│   │   ├── manage_family/            # Household members & role assignments
│   │   │   └── ManageFamily.tsx
│   │   ├── onboarding/               # Multi-step animated user onboarding flow
│   │   │   └── OnboardingFlow.tsx
│   │   ├── settings/                 # Security & application configuration
│   │   │   └── ChangePasswordModal.tsx
│   │   ├── stocks/                   # Stocks, Mutual Funds & CAS PDF upload
│   │   │   ├── Stocks.tsx
│   │   │   └── UploadStockCASModal.tsx
│   │   ├── welcome/                  # Profile lock screen, user switcher & creator
│   │   │   ├── WelcomePage.tsx
│   │   │   ├── SwitchUserModal.tsx
│   │   │   └── CreateUserModal.tsx
│   │   ├── Charts.tsx                # Recharts visualization wrappers
│   │   ├── Overview.tsx              # Net worth dashboard & allocation views
│   │   ├── Sidebar.tsx               # Collapsible navigation & user drawer
│   │   └── Topbar.tsx                # Privacy toggle, family filter & profile quick-look
│   ├── data/
│   │   ├── orelioStore.ts            # Central data access layer, aggregations & persistence
│   │   ├── types.ts                  # Domain TypeScript interfaces & types
│   │   └── orelio_database.json      # Starter seed database
│   ├── utils/
│   │   ├── casParser.ts              # CAS PDF parser & statement extractor
│   │   └── crypto.ts                 # SHA-256 password hashing & verification utilities
│   ├── App.tsx                       # Root orchestrator & route state
│   ├── main.tsx                      # Vite React entrypoint
│   └── index.css                     # Global tokens, typography & animations
├── DESIGN.md                         # Design system specifications & rules
├── package.json
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

Ensure you have [Bun](https://bun.sh/) (recommended) or [Node.js](https://nodejs.org/) (v18+) installed.

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/sejalkore18/orelio.git
   cd orelio
   ```

2. **Install dependencies**:
   ```bash
   bun install
   # or
   npm install
   ```

3. **Start the development server**:
   ```bash
   bun run dev
   # or
   npm run dev
   ```
   Open `http://localhost:5173/` in your browser.

---

## 📜 Available Scripts

| Command | Description |
| :--- | :--- |
| `bun run dev` | Starts Vite local development server with HMR |
| `bun run build` | Validates TypeScript types (`tsc -b`) and bundles for production |
| `bun run preview` | Serves production build locally for verification |
| `bun run lint` | Runs fast Oxlint static code checks |

---

## 🎨 Design System & Aesthetics

Orelio follows a custom design system detailed in [`DESIGN.md`](./DESIGN.md):

* **Color Palette**:
  - Primary Navy: `#00162A` (Text, deep headings)
  - Dark Teal: `#006A65` (Primary accents, active states, buttons)
  - Deep Forest: `#004D40` (Interactive hover depth)
  - Mint Tint: `#E6F4F1` (Badges, subtle active chips)
  - Surface Neutral: `#F8F9FA` & `#FBFCFD` (Backgrounds, clean card surfaces)
* **Micro-Interactions**: Subtle elevation shadows, scale transitions (`active:scale-[0.99]`), and smooth popover animations.
* **Typography**: Clean modern type scale utilizing *Hanken Grotesk* with distinct weights (SemiBold, Bold, ExtraBold).
* **Iconography**: Material Symbols Outlined paired with Lucide React.

---

## 📄 License

This project is proprietary and intended for personal wealth tracking and ledger management.
