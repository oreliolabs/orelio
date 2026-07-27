# Orelio Design System & Architecture Guide

Welcome to the **Orelio Wealth Ledger** design system documentation. This guide outlines the core design philosophy, color tokens, typography scale, component blueprints, micro-animations, and UI layout patterns used across the application.

---

## 1. Design Philosophy

Orelio is designed as a premium, state-of-the-art personal wealth management platform. The design balances visual elegance with functional clarity through:

- **Rich Aesthetics & Tactile Feedback**: Polished glassmorphism cards, micro-animations on hover, soft green glow shadows, and curated color palettes.
- **Visual Hierarchy & Typography**: Strong typographic contrast using *Hanken Grotesk*, distinct weight scaling, and uppercase tracking for category headers.
- **Privacy & User Control**: Built-in privacy masking toggles for financial values (`isPrivate`) and clear, non-intrusive action controls.
- **Material Symbol Standardization**: Crisp, recognizable iconography powered by Google Material Symbols Outlined.

---

## 2. Color System & Design Tokens

### Core Brand Palette
| Token | Hex / Value | Description | Usage |
| :--- | :--- | :--- | :--- |
| `--color-orelio-bg` | `#FBFCFD` | Background Canvas | Main page background |
| `--color-orelio-navy` | `#00162A` | Primary Dark Navy | Main headings, primary monetary text |
| `--color-orelio-darkgreen` | `#006A65` | Primary Teal Green | Active hover borders, progress bars, highlights |
| `--color-forest-800` | `#004D40` | Forest Dark Green | Active Deposits stats card background |
| `--color-forest-900` | `#00342B` | Deep Forest Green | Dark card gradient start |
| `--color-orelio-lightgreen` | `#AFEFDD` / `#E6F4F1` | Mint Tint | Active icon badge hover background |
| `--color-orelio-text` | `#43474D` | Body Text | Standard paragraph text, section titles |
| `--color-orelio-gray` | `#74777F` | Muted Subtext | Category titles, account numbers, labels |
| `--color-orelio-light-gray` | `#F2F4F5` | Light Neutral Fill | Card backgrounds, badge fills |
| `--color-orelio-border` | `rgba(195, 198, 206, 0.3)` | Card Border Neutral | Standard card borders |
| Custom Matured Border | `rgba(191, 201, 196, 0.1)` | Matured Border (`#BFC9C4` 10%) | Matured deposit card border |
| Destructive Red | `#BA1A1A` | Destructive Action Text | Delete options, delete confirmation buttons |
| Destructive Light Fill | `#FFF8F7` / `#FFEDEA` | Destructive Hover | Delete item hover background |

---

## 3. Typography & Hierarchy

**Font Family**: `'Hanken Grotesk', system-ui, -apple-system, sans-serif`

| Element | Class Name / Size | Weight | Tracking | Usage |
| :--- | :--- | :--- | :--- | :--- |
| **Page Title** | `text-2xl` (24px) | `font-extrabold` | `tracking-tight` | Main page view heading |
| **Section Title** | `text-xl` (20px) | `font-semibold` | `tracking-tight` | Section headings ("Active Deposits", "Matured Deposits") |
| **Card Primary Value** | `text-base` (16px) | `font-extrabold` | Normal | Financial totals, interest rates, nicknames |
| **Category Header** | `text-[10px]` | `font-extrabold` | `tracking-widest` | Uppercase field headers (`FD NICKNAME`, `INTEREST RATE`) |
| **Subtext & Labels** | `text-xs` (12px) | `font-medium` | Normal | Account numbers (`Account No.: **** 8829`), dates |
| **Pill Badge Label** | `text-[11px]` | `font-extrabold` | `tracking-wider` | Item count badges (`5 ITEMS`) |

---

## 4. Corner Radius & Border Radius System

Orelio uses a tiered corner radius system to maintain soft, modern curves across all components:

| Scale Token | Tailwind Class | Pixel Value | Usage / Component Target |
| :--- | :--- | :--- | :--- |
| **Extra Large (Card)** | `rounded-3xl` | `24px` (`1.5rem`) | Main list cards (Active & Matured Deposits), Modals, KPI Summary Cards |
| **Large (Container)** | `rounded-2xl` | `16px` (`1rem`) | Popover menu box, Icon badges (`w-12 h-12`), Inner glass card containers |
| **Medium (Control)** | `rounded-xl` | `12px` (`0.75rem`) | Pagination controls, Input form fields, Secondary action buttons |
| **Full (Pill / Circle)** | `rounded-full` | `9999px` | Item count badges (`5 ITEMS`), Growth pill badges, More menu trigger button (`w-9 h-9`), Progress bars |
| **Custom Flat-Bottom** | `borderRadius: '10px 10px 0px 0px'` | `10px 10px 0 0` | Net Value decorative bar graphic (flush `right-6 bottom-0`) |

---

## 5. Iconography

All icons use **Google Material Symbols Outlined** (`material-symbols-outlined`) with consistent sizing:
- **Deposit Type Icons**:
  - `savings`: Fixed Deposit (FD) piggy bank icon.
  - `refresh`: Recurring Deposit (RD) recurring arrow icon.
- **Action & Navigation Icons**:
  - `add`: Primary action button trigger ("New Deposit").
  - `more_vert`: Card context menu trigger.
  - `visibility` / `visibility_off`: Privacy mask toggle.
  - `check`: Matured deposit completion indicator.
  - `close`: Modal close trigger.

---

## 6. Component Guidelines

### A. Summary KPI Cards
1. **Net Current Value Card**:
   - White glassmorphism container with `#C3C6CE` border at 10% opacity (`border-[#C3C6CE]/10`) and drop shadow `shadow-[0_4px_20px_0_rgba(0,0,0,0.02)]`.
   - Privacy mode support (`isPrivate` state displaying `••••••`).
   - Integrated growth pill (`+4.2% this year`).
   - Flat-bottomed bar graphic (`borderRadius: '10px 10px 0px 0px'`) flush at `right-6 bottom-0`.

2. **Active Deposits Stats Card**:
   - Dark forest green background (`bg-[#004D40]`).
   - Active deposit count display with vertical padding (`pb-3 md:pb-4`) above the horizontal divider.
   - FD vs RD amount breakdown rows.

---

### B. Section Headers with Inline Divider
Section headers use a 3-part flex layout:
```tsx
<div className="flex items-center gap-4 w-full">
  <h2 className="text-xl font-semibold text-[#43474D] tracking-tight whitespace-nowrap">
    Active Deposits
  </h2>
  <div className="flex-1 h-[1px] bg-[#C3C6CE]/30" />
  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold text-[#74777F] bg-[#F2F4F5] uppercase tracking-wider whitespace-nowrap">
    5 ITEMS
  </span>
</div>
```
- **Spacing**: 24px vertical gap (`space-y-6`) between section header and cards list below.

---

### C. Active Deposits Cards
- **Card Container**: `rounded-3xl`, white background, `border-[#C3C6CE]/30`, 20px vertical list spacing (`space-y-5`).
- **Hover Micro-Animations**:
  - Upward tile lift (`hover:-translate-y-1`).
  - 2px teal green border highlight (`hover:border-2 hover:border-[#006A65]`).
  - Soft green glow shadow (`hover:shadow-[0_12px_28px_-2px_rgba(0,106,101,0.05)]`).
  - Icon badge transforms to solid teal green with white icon (`group-hover:bg-[#006A65] group-hover:text-white group-hover:scale-105`).
  - Icon symbol micro-animation: `savings` tilts `-rotate-12`, `refresh` smoothly rotates `rotate-180`.
  - Category titles transition to teal green (`group-hover:text-[#006A65]`).

---

### D. Matured Deposits Cards
- **Card Container**: `rounded-3xl`, neutral fill background (`bg-[#F2F4F5]`), `#BFC9C4` border at 10% opacity (`border border-[#BFC9C4]/10`).
- **Structure**: Flat design without drop shadow or green hover border. Features checkmark icon badge, final rate, maturity value, matured on date, and an interactive **REINVEST** button.

---

### E. Contextual Popover Menu (`more_vert`)
- **Trigger**: Circular hover background (`w-9 h-9 rounded-full hover:bg-[#F2F4F5]`).
- **Layering**: Elevates active card stacking context to `z-50` when open so the popover menu renders cleanly on top of subsequent card tiles.
- **Menu Items**:
  - Text-only options: **Edit FD / Edit RD** (`text-[#3F4945]`) and **Delete FD / Delete RD** (`text-[#BA1A1A]`).
  - Edge-to-edge horizontal divider line (`border-t border-[#C3C6CE]/20`) with no padding gaps.

---

## 7. Accessibility & Interactivity Rules

- **Interactive Elements**: All clickable buttons and triggers have clear hover states (`transition-colors duration-200` or `transition-all duration-300`).
- **Focus & Selection**: Material Symbols use `select-none` to prevent unwanted text selection during rapid interactions.
- **Labels**: Spelled out labels (e.g., `Account No.:`) ensure screen reader clarity and visual alignment across all screens.
