---
name: orelio-design-system-auditor
description: Enforce Orelio Wealth Ledger design tokens, Material Symbols, typography hierarchy, popover z-index layering, and card hover animations when building or updating financial UI components.
---

# Orelio Design System Auditor & UI Component Builder

This skill provides mandatory guidelines, design token mappings, component architecture rules, and verification workflows for creating or updating UI components in the **Orelio Wealth Ledger** codebase.

## 1. When to Apply This Skill
Trigger or read this skill whenever you are asked to:
- Build a new financial view, list card, modal, or popover menu in Orelio.
- Refactor layout, hover interactions, or color palettes across components.
- Audit UI consistency against the master `DESIGN.md` specification.

---

## 2. Mandatory Design Rules

### A. Color Palette Enforcement
Always use Orelio design tokens rather than default Tailwind colors:
- **Canvas BG**: `#FBFCFD`
- **Primary Navy Text**: `#00162A`
- **Body & Section Heading Text**: `#43474D`
- **Teal Accent (Active Hover & Progress)**: `#006A65`
- **Mint Tint (Icon Badges)**: `#E6F4F1`
- **Forest Dark Green (Stats Cards)**: `#004D40`
- **Neutral Card Border**: `#C3C6CE` at 30% opacity (`border-[#C3C6CE]/30`)
- **Matured Card Border**: `#BFC9C4` at 10% opacity (`border-[#BFC9C4]/10`)
- **Matured Card Fill**: `#F2F4F5`
- **Destructive Action Red**: `#BA1A1A` with `#FFF8F7` hover background

### B. Iconography Rules
- Use Google **Material Symbols Outlined** (`material-symbols-outlined`) exclusively.
- Add `select-none` to prevent unwanted text selection during fast clicks.
- Common icons: `savings` (FD), `refresh` (RD), `check` (Matured), `more_vert` (Menu), `add` (Primary Action), `visibility`/`visibility_off` (Privacy Toggle).

### C. Popover Menu (`more_vert`) Blueprint
When implementing a dropdown/popover menu inside list cards:
1. Elevate active card container to `z-50` when open (`isMenuOpen ? 'z-50' : 'z-0'`).
2. Popover trigger must have a circular hover highlight (`w-9 h-9 rounded-full hover:bg-[#F2F4F5]`).
3. Options must be clean text-only without icons (`text-[#3F4945]` for edit, `text-[#BA1A1A]` for delete).
4. Edge-to-edge horizontal divider line (`border-t border-[#C3C6CE]/20`) separating options with no padding gaps (`py-1 overflow-hidden`).

### D. Section Header Blueprint
Inline horizontal stretching divider layout:
```tsx
<div className="flex items-center gap-4 w-full">
  <h2 className="text-xl font-semibold text-[#43474D] tracking-tight whitespace-nowrap">
    Section Title
  </h2>
  <div className="flex-1 h-[1px] bg-[#C3C6CE]/30" />
  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold text-[#74777F] bg-[#F2F4F5] uppercase tracking-wider whitespace-nowrap">
    {items.length} ITEMS
  </span>
</div>
```
- Spacing: 24px vertical gap (`space-y-6`) between section header and cards list below.

---

## 3. Verification & Quality Assurance Workflow
Before declaring any UI task complete:
1. Run `npm run build` to confirm zero TypeScript compilation or bundle errors.
2. Launch a browser agent to visually verify hover states, popover layering, contrast, and layout alignment.
3. Cross-reference `DESIGN.md` to ensure design tokens match.
