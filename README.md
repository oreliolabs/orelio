# 💎 Orelio Wealth Ledger

> A modern, high-performance personal wealth management application built for tracking assets, fixed/recurring deposits, bank liquidity, and net worth growth.

![React 19](https://img.shields.io/badge/React-19.2-blue?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-6.0-blue?logo=typescript)
![Vite](https://img.shields.io/badge/Vite-8.1-646CFF?logo=vite)
![TailwindCSS v4](https://img.shields.io/badge/TailwindCSS-v4.3-38BDF8?logo=tailwindcss)

---

## 🌟 Key Features

- 🏦 **Fixed & Recurring Deposits Management**: Track active and matured Fixed Deposits (FD) and Recurring Deposits (RD) with real-time maturity progress bars, interest rates, principal amounts, and maturity countdowns.
- 💳 **Bank Accounts & Liquidity**: Monitor liquidity across multiple bank accounts with balance breakdowns and account numbers.
- 🔒 **Privacy Mode**: One-click privacy mask toggle (`isPrivate`) to obscure sensitive financial amounts with `••••••` across summary cards and lists.
- ✨ **Tactile Micro-Animations**: Card hover tile lifts, soft green glow shadows (`#006A65`), icon tilt/spin interactions, and smooth popover transitions.
- 🎨 **Unified Material Symbols**: Styled with Google Material Symbols Outlined (`savings`, `refresh`, `check`, `more_vert`, etc.).
- 📐 **Design System**: Fully documented design system in [`DESIGN.md`](./DESIGN.md) featuring curated color palettes, typography hierarchy (*Hanken Grotesk*), and tiered border-radius scales.

---

## 🛠️ Technology Stack

- **Core Framework**: [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Build Tooling**: [Vite 8](https://vitejs.dev/) with SWC/Oxc plugin
- **Styling & Theme**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Typography**: Google Fonts (*Hanken Grotesk*)
- **Iconography**: Google Material Symbols Outlined
- **Linter**: [Oxlint](https://oxc.rs/)

---

## 📁 Directory Structure

```
orelio-ts/
├── .agents/                               # Workspace agent skills & configurations
│   └── skills/
│       └── orelio-design-system-auditor/  # Custom agent skill & guidelines
│           ├── SKILL.md
│           ├── references/
│           └── examples/
├── src/
│   ├── components/
│   │   ├── cash_and_bank/
│   │   │   ├── Deposits.tsx               # Active & Matured Deposits view
│   │   │   ├── AddEditDepositModal.tsx     # Standalone Add / Edit Deposit modal component
│   │   │   ├── DeleteDepositModal.tsx      # Standalone Delete Deposit confirmation modal
│   │   │   └── BankAccounts.tsx           # Bank Accounts list view
│   │   ├── locker/
│   │   │   └── Notes.tsx                  # Locker notes & documents view
│   │   └── manage_family/
│   │       └── ManageFamily.tsx           # Family member permissions
│   ├── App.tsx                            # Root application component
│   ├── main.tsx                           # Application entrypoint
│   └── index.css                          # Theme tokens & glassmorphism utilities
├── DESIGN.md                              # Master design system documentation
├── package.json
├── vite.config.ts
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

Ensure you have [Node.js](https://nodejs.org/) (v18 or higher) and `npm` installed.

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/sejalkore18/orelio_ts.git
   cd orelio-ts
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```
   Open `http://localhost:5173/` in your browser to view the app.

---

## 📜 Scripts & Commands

| Command | Description |
| :--- | :--- |
| `npm run dev` | Starts Vite local development server |
| `npm run build` | Compiles TypeScript & builds production bundle in `dist/` |
| `npm run preview` | Previews production build locally |
| `npm run lint` | Runs Oxlint linter check |

---

## 🎨 Design Tokens & Customization

Refer to [`DESIGN.md`](./DESIGN.md) for full design system guidelines, including:
- Primary Navy (`#00162A`), Teal Green (`#006A65`), Forest Green (`#004D40`), and Neutral Light (`#F2F4F5`) color tokens.
- Tiered Corner Radius scale (`rounded-3xl` 24px, `rounded-2xl` 16px, `rounded-xl` 12px, `rounded-full`).
- Inline stretching section header dividers (`flex-1 h-[1px] bg-[#C3C6CE]/30`).
- Contextual popover menu layering (`z-50`) and `#BA1A1A` destructive text styling.

---

## 📄 License

This project is proprietary and built for personal wealth tracking.
