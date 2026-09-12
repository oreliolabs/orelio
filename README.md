# 💎 Orelio Wealth Ledger

> A modern and high-performance personal wealth ledger. Track diversified portfolios, bank liquidity, deposits, insurance coverage, loans, and family net worth with privacy and security.

![React 19](https://img.shields.io/badge/React-19.2-blue?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-6.0-blue?logo=typescript)
![Vite](https://img.shields.io/badge/Vite-8.1-646CFF?logo=vite)
![TailwindCSS v4](https://img.shields.io/badge/TailwindCSS-v4.3-38BDF8?logo=tailwindcss)
![Bun](https://img.shields.io/badge/Bun-1.4+-fbf0df?logo=bun)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)

---

## 🌟 Key Highlights

- 📊 **Dynamic Portfolio Analytics**: Interactive asset and liability allocation breakdowns powered by Recharts.
- 👥 **Multi-User Accounts & Family Management**: Create and switch between multiple user accounts. Organize assets and liabilities per family member (Self, Spouse, Children, Parents) or view unified household metrics.
- 📄 **Automated CAS (e-CAS) PDF Parser**: Ingest NSDL / CDSL Consolidated Account Statements (CAS) directly in the browser using client-side PDF parsing to extract equities, mutual funds, and debt holdings.
- 🛡️ **Account Security & Privacy Mode**: Optional password protection powered by SHA-256 & PBKDF2 cryptography. Includes a one-click Privacy Mask toggle (`isPrivate`) to hide sensitive balances with `••••••` across all views.
- **Free & Open Source**: Free and open-source software licensed under MIT.

---

## 🛠️ Technology Stack

| Layer                  | Technology                                                                                             |
| :--------------------- | :----------------------------------------------------------------------------------------------------- |
| **Core Framework**     | [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)                         |
| **Build Tooling**      | [Vite 8](https://vitejs.dev/) + [Bun](https://bun.sh/) / Node.js                                       |
| **Styling & Design**   | [Tailwind CSS v4](https://tailwindcss.com/) with custom CSS design tokens                              |
| **Icons & Typography** | Google Material Symbols Outlined, [Lucide React](https://lucide.dev/), Google Fonts (_Hanken Grotesk_) |
| **Data Visualization** | [Recharts](https://recharts.org/)                                                                      |
| **PDF Processing**     | [PDF.js (`pdfjs-dist`)](https://mozilla.github.io/pdf.js/) for client-side CAS statement parsing       |
| **Cryptography**       | Web Crypto API (SHA-256 + PBKDF2 hash & verify)                                                        |
| **Linter**             | [Oxlint](https://oxc.rs/)                                                                              |

---

## 🚀 Getting Started

### Prerequisites

Ensure you have [Bun](https://bun.sh/) (recommended) or [Node.js](https://nodejs.org/) (v18+) installed.

### Installation

1. **Clone the repository**:

   ```bash
   git clone https://github.com/oreliolabs/orelio.git
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

---

## 📜 Available Scripts

| Command           | Description                                                      |
| :---------------- | :--------------------------------------------------------------- |
| `bun run dev`     | Starts Vite local development server with HMR                    |
| `bun run build`   | Validates TypeScript types (`tsc -b`) and bundles for production |
| `bun run preview` | Serves production build locally for verification                 |
| `bun run lint`    | Runs fast Oxlint static code checks                              |

---

## 📄 License

This website project is licensed under the [MIT License](./LICENSE).
