# 💎 Orelio Design System & Architecture Guide

Welcome to the **Orelio Wealth Ledger** master design system documentation. This guide outlines the core design philosophy, color tokens, typography scale, component blueprints, micro-animations, and UI layout patterns used across the entire application.

---

## 1. Design Philosophy

Orelio is crafted as a premium, state-of-the-art personal wealth ledger. The design balances visual elegance with functional clarity through:

- **Tactile Feedback & Depth**: Polished card surfaces, subtle elevation lifts on hover (`hover:-translate-y-1`), soft green glow shadows (`#006A65`), and smooth state transitions.
- **Typographic Hierarchy**: Strong typographic contrast powered by *Hanken Grotesk*, distinct font weights (SemiBold, Bold, ExtraBold), and uppercase letter-spacing for category tags.
- **Privacy-First Experience**: Built-in privacy masking toggle (`isPrivate`) to obscure sensitive net worth figures and account balances with `••••••`.
- **Consistent Component Blueprints**: Strict standardization across button suites (`PrimaryButton`, `SaveButton`, `CancelButton`), modal dialogs, and section dividers.
- **Material Symbol Standardization**: Crisp, recognizable iconography powered by Google Material Symbols Outlined (`material-symbols-outlined select-none`).

---

## 2. Color System & Design Tokens

### Core Brand Palette
| Token | Hex / Value | Description | Primary Usage |
| :--- | :--- | :--- | :--- |
| **Canvas Background** | `#FBFCFD` / `#F8F9FA` | Light Clean Neutral | Main application background and subtle container fills |
| **Primary Navy** | `#00162A` | Deep Charcoal Navy | Main headings, primary monetary numbers, active navigation text |
| **Teal Green (Brand)** | `#006A65` | Primary Accent | Active states, primary action buttons, progress bars, hover borders |
| **Deep Forest Green** | `#004D40` | Secondary Brand Green | Button hover states (`hover:bg-[#00524E]`), active stat cards |
| **Abyssal Forest** | `#00342B` | Dark Gradient Start | Dark theme card gradient headers |
| **Mint Tint** | `#E6F4F1` | Soft Green Accent Fill | Active icon badges, status pills, selected tab highlights |
| **Body Text** | `#43474D` | Dark Neutral | Standard body copy, section titles, card labels |
| **Muted Gray** | `#74777F` / `#707975` | Mid Neutral | Subtitles, account numbers, secondary metadata, inactive icons |
| **Light Neutral Fill** | `#F2F4F5` | Neutral Surface Fill | Matured card backgrounds, hover fills, badge containers |
| **Card Border** | `rgba(195, 198, 206, 0.3)` | `#C3C6CE` at 30% | Default card and container borders |
| **Matured Card Border** | `rgba(191, 201, 196, 0.1)` | `#BFC9C4` at 10% | Matured deposit and archived item card borders |
| **Destructive Red** | `#BA1A1A` | Alert / Danger Red | Delete buttons, destructive actions, negative P&L text |
| **Destructive Light Fill** | `#FFF8F7` / `#FFEDEA` | Warning Surface | Delete hover fill, "Not Set" alert pills, error banners |

---

## 3. Typography & Hierarchy

**Primary Font Family**: `'Hanken Grotesk', system-ui, -apple-system, sans-serif`

| Hierarchy Role | Tailwind Classes | Size / Weight | Tracking | Usage |
| :--- | :--- | :--- | :--- | :--- |
| **Display Heading** | `text-3xl font-extrabold` | 30px / 800 | `tracking-tight` | Welcome page hero titles |
| **Page Title** | `text-2xl font-extrabold` | 24px / 800 | `tracking-tight` | Main page view heading (Overview, Deposits, Stocks) |
| **Section Heading** | `text-xl font-bold` | 20px / 700 | `tracking-tight` | Section headers ("Active Deposits", "All Accounts") |
| **Card Primary Title** | `text-base font-bold` | 16px / 700 | Normal | Bank account name, stock symbol, policy title |
| **Monetary Value (KPI)**| `text-2xl sm:text-3xl font-extrabold` | 24–30px / 800 | `tracking-tight` | Net worth numbers, total liquidity, total assets |
| **Card Value / Rate** | `text-base font-extrabold` | 16px / 800 | Normal | Interest rates, deposit amounts, sum assured |
| **Category Header** | `text-[10px] font-extrabold` | 10px / 800 | `tracking-widest` | Uppercase field headers (`FD NICKNAME`, `INTEREST RATE`) |
| **Pill Badge Label** | `text-[11px] font-bold` | 11px / 700 | `tracking-wider` | Status badges (`ACCOUNT SUCCESSFULLY CREATED`, `5 ITEMS`) |
| **Micro Badge Label**| `text-[10px] font-extrabold` | 10px / 800 | `tracking-wider` | Active pill (`ACTIVE`), role pills (`SELF`, `SPOUSE`) |
| **Subtext / Helper** | `text-xs font-medium` | 12px / 500 | Normal | Account numbers (`Account No.: **** 8829`), date labels |

---

## 4. Corner Radius & Elevation System

### Corner Radius Tokens
| Scale Token | Class | Radius | Component Target |
| :--- | :--- | :--- | :--- |
| **Extra Large** | `rounded-3xl` | 24px | Main list cards, modals, KPI summary containers, onboarding cards |
| **Large** | `rounded-2xl` | 16px | Popover menus, icon badges (`w-12 h-12` or `w-14 h-14`), modal inner blocks |
| **Medium** | `rounded-xl` | 12px | Action buttons (`PrimaryButton`, `SaveButton`), form inputs, chips |
| **Small** | `rounded-lg` | 8px | Action icon buttons, table row actions, quick toggles |
| **Full / Pill** | `rounded-full` | 9999px | Category badges, growth pills, user profile avatars, progress bars |

### Elevation & Shadow Tokens
- **Base Card**: `shadow-[0_12px_40px_rgba(0,0,0,0.06)]` or `border border-[#C3C6CE]/30`.
- **Card Hover Elevation**: `hover:-translate-y-1 hover:shadow-[0_12px_28px_-2px_rgba(0,106,101,0.05)] hover:border-2 hover:border-[#006A65]`.
- **Brand Action Shadow**: `shadow-md shadow-[#006A65]/20 hover:shadow-lg hover:shadow-[#006A65]/25`.
- **Modal Overlay**: `shadow-2xl` with backdrop `bg-black/40 backdrop-blur-xs`.

---

## 5. Z-Index Layering Scale

Strict z-index stacking prevents popover and modal overlay conflicts:

| Layer | Z-Index | Elements |
| :--- | :--- | :--- |
| **Canvas** | `z-0` | Default page background, subtle decorative blurs |
| **Content** | `z-10` | Main list cards, table rows, section headers |
| **Sticky Navigation**| `z-30` | Top header bar (`Topbar`), mobile sticky navigation |
| **Sidebar Drawer** | `z-40` | Desktop sidebar drawer, mobile drawer overlay |
| **Context Popover** | `z-50` | Card context menu (`more_vert`), elevated card tile when menu is open |
| **Modal / Dialog** | `z-[9999]` | Dialog backdrops (`createPortal`), Edit/Add modals, confirmation dialogs |

---

## 6. Iconography Standards

All icons strictly use **Google Material Symbols Outlined** (`material-symbols-outlined select-none`):

### Module Icons
- **Overview**: `dashboard`
- **Bank Accounts**: `account_balance`
- **Deposits (FD / RD)**: `savings` (Fixed Deposit), `refresh` (Recurring Deposit)
- **Stocks & Mutual Funds**: `trending_up` / `show_chart`
- **Insurance**: `verified_user` / `shield`
- **Loans & Credit**: `credit_card` / `request_quote`
- **Secure Locker**: `lock` / `description`
- **Manage Family**: `group` / `diversity_3`
- **Settings**: `settings`

### Interactive Action Icons
- **Add / Create**: `add`
- **Save / Confirm**: `check` / `check_circle`
- **Delete / Remove**: `delete` / `close`
- **Privacy Mask**: `visibility` / `visibility_off`
- **More Context Menu**: `more_vert`
- **Forward Arrow**: `arrow_forward`
- **Back Arrow**: `arrow_back`
- **Logout**: `logout`

---

## 7. Standard Component Blueprints

### A. Common Button Suite (`src/components/common/`)

#### 1. `PrimaryButton`
- **Role**: Main header action triggers (e.g., "New Bank Account", "Add New Policy", "New Deposit").
- **Styling**: Pre-styled `#006A65` brand teal, hover scale elevation (`hover:scale-103`), optically balanced left/right padding (`pl-3.5 pr-5`), Material Symbol icon support.
```tsx
import { PrimaryButton } from '../common/PrimaryButton';

<PrimaryButton icon="add" onClick={handleOpenAdd}>
  New Deposit
</PrimaryButton>
```

#### 2. `SaveButton`
- **Role**: Primary form submission inside modals.
- **Styling**: `rounded-xl`, `#006A65` with dark hover `#00524E`, built-in loading spinner state (`isSaving`), checkmark icon.
```tsx
import { SaveButton } from '../common/SaveButton';

<SaveButton type="submit" isSaving={isSaving}>
  Save Policy
</SaveButton>
```

#### 3. `CancelButton`
- **Role**: Secondary dismissal button next to primary actions.
- **Styling**: `rounded-xl`, neutral `#43474D` text, hover fill `#F2F4F5`, active micro-press (`active:scale-98`).
```tsx
import { CancelButton } from '../common/CancelButton';

<CancelButton onClick={onClose} />
```

---

### B. Confirmation & Destructive Modals

#### `DeleteConfirmationModal`
- **Role**: Universal modal for deleting accounts, deposits, policies, or loans.
- **Pattern**: Red warning icon badge (`#FFF8F7` bg, `#BA1A1A` icon), clear title and descriptive consequences, paired `CancelButton` and destructive confirm button (`bg-[#BA1A1A] hover:bg-[#931515]`).
```tsx
import { DeleteConfirmationModal } from '../common/DeleteConfirmationModal';

<DeleteConfirmationModal
  isOpen={isOpen}
  onClose={onClose}
  onConfirm={handleDelete}
  title="Delete Bank Account?"
  subtitle="Are you sure you want to remove this account? This action cannot be undone."
  confirmText="Delete Account"
/>
```

#### `LogoutConfirmationModal`
- **Role**: Confirms user session logout from the sidebar.
- **Features**: Displays the current user's name dynamically and warns about offline vault locking.

---

### C. Section Headers with Inline Divider

Section headers use a unified 3-part layout across all views:
```tsx
<div className="flex items-center gap-4 w-full">
  <h2 className="text-xl font-bold text-[#00162A] tracking-tight whitespace-nowrap">
    Active Deposits
  </h2>
  <div className="flex-1 h-[1px] bg-[#C3C6CE]/30" />
  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold text-[#74777F] bg-[#F2F4F5] uppercase tracking-wider whitespace-nowrap">
    {items.length} ITEMS
  </span>
</div>
```
- **Vertical Spacing**: Always apply a 24px vertical gap (`space-y-6`) between section headers and the card list below.

---

### D. List Card Patterns

#### 1. Active Financial Cards
- **Container**: `rounded-3xl bg-white border border-[#C3C6CE]/30 p-5 sm:p-6 transition-all duration-300`.
- **Hover Micro-Animations**:
  - Upward tile lift: `hover:-translate-y-1`.
  - 2px Teal green border: `hover:border-2 hover:border-[#006A65]`.
  - Soft green glow shadow: `hover:shadow-[0_12px_28px_-2px_rgba(0,106,101,0.05)]`.
  - Icon badge transformation: `group-hover:bg-[#006A65] group-hover:text-white group-hover:scale-105`.
  - Title highlight: `group-hover:text-[#006A65]`.

#### 2. Matured / Inactive Cards
- **Container**: `rounded-3xl bg-[#F2F4F5] border border-[#BFC9C4]/10 p-5 sm:p-6`.
- **Structure**: Flat design without hover border lift, subdued neutral styling, checkmark completion icon, and explicit action buttons (e.g. `REINVEST`).

---

### E. Contextual Popover Menu (`more_vert`)

When implementing a dropdown menu inside list cards:
1. **Card Stacking**: Elevate the parent card tile to `z-50` when open (`isMenuOpen ? 'z-50' : 'z-0'`).
2. **Trigger**: Circular icon button with subtle hover background (`w-9 h-9 rounded-full hover:bg-[#F2F4F5]`).
3. **Menu Container**: `rounded-2xl bg-white border border-[#C3C6CE]/30 shadow-xl py-1 overflow-hidden min-w-[140px]`.
4. **Options**: Clean, text-only items with edge-to-edge border dividers (`border-t border-[#C3C6CE]/20`), `#3F4945` for edit actions, `#BA1A1A` for delete actions.

---

### F. Form Fields & Modals

- **Modal Backdrop**: `fixed inset-0 z-[9999] bg-black/40 backdrop-blur-xs flex items-center justify-center p-4`.
- **Modal Window**: `w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-[#C3C6CE]/30 space-y-6`.
- **Inputs**:
  ```tsx
  <div className="relative flex items-center">
    <span className="absolute left-3.5 text-[#707975] material-symbols-outlined select-none text-lg pointer-events-none">
      account_balance
    </span>
    <input
      type="text"
      className="w-full h-11 pl-10 pr-4 rounded-xl bg-[#FBFCFD] border border-[#C3C6CE]/35 text-sm text-[#00162A] placeholder:text-[#A0A5AA] focus:bg-white focus:border-[#006A65] focus:ring-3 focus:ring-[#006A65]/10 outline-none transition-all"
    />
  </div>
  ```

---

### G. User Avatars & Profile Badges

- **Initials Token**: Circular avatar with brand teal background:
  ```tsx
  <div className="w-10 h-10 rounded-full bg-[#006A65] text-white flex items-center justify-center font-bold text-base select-none shrink-0 shadow-xs">
    {userName.trim().charAt(0).toUpperCase() || 'U'}
  </div>
  ```
- **Active Status Badge**:
  ```tsx
  <span className="px-2 py-0.5 rounded text-[10px] font-extrabold text-[#006A65] bg-[#E6F4F1] uppercase flex items-center gap-1">
    <span className="w-1.5 h-1.5 rounded-full bg-[#006A65]" />
    Active
  </span>
  ```

---

## 8. Accessibility & Quality Rules

1. **Interactive Feedback**: All buttons, links, and triggers must provide instant visual feedback on hover (`transition-colors duration-200` or `transition-all duration-300`) and active clicks (`active:scale-[0.99]` or `active:scale-98`).
2. **Text Selection**: Material Symbols must include `select-none` to prevent accidental icon highlighting during rapid clicks.
3. **Screen Reader Clarification**: Use explicit labels (e.g. `Account No.:`, `Maturity Date:`) instead of ambiguous abbreviations.
4. **Verification**: Always verify all component modifications with `bun run build` to ensure type correctness and styling integrity before finalizing changes.
