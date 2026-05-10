# Frontend Design Standards

This document outlines the standard design patterns established across the application's frontend. All new pages and components must adhere to these guidelines to ensure UI consistency and maintainability.

## 1. Page Layout & Headers
- **Main Container**: Pages should be wrapped in a `<div className="space-y-6">`. Avoid hardcoding specific max-widths like `max-w-6xl` unless it's a specialized standalone page; standard layouts handle max-width globally. Avoid `py-8` if it conflicts with standard routing padding.
- **Page Titles**: Use an `<h2>` tag with the classes `text-2xl md:text-3xl font-bold tracking-tight`. 
  - *Do not* use `text-3xl font-black` or inject large icons directly next to page titles unless specifically required by the design system.
- **Page Subtitles**: Use a `<p>` tag with the classes `text-muted-foreground text-xs md:text-sm`.

## 2. Cards
- **Base Style**: Use the default `<Card>` component from `shadcn/ui`.
- **Overrides**: Do not add custom border radii (e.g., `rounded-2xl`) or heavy box shadows (e.g., `shadow-xl shadow-primary/5`). The default design system manages depth and borders.
- **Spacing**: Card contents usually use `pt-6` or default padding. Avoid creating custom header backgrounds like `bg-muted/20`.

## 3. Buttons & Form Controls
- **Buttons**: Rely on the default variants (`default`, `outline`, `destructive`, `ghost`).
  - *Do not* add custom shadows (`shadow-lg shadow-primary/20`), custom padding (`px-8`), or custom border radii (`rounded-xl`).
- **Selects & Inputs**: Use the default `SelectTrigger` without adding custom border radii (`rounded-xl`). The global CSS theme controls the border radius for all inputs.

## 4. Tables
- **Component**: Where possible, use the global `DynamicTable1`.
- **Manual Tables**: If building a custom table with `<Table>`:
  - Do not add custom backgrounds to the `TableHeader` (e.g., `bg-muted/30`).
  - Use standard `TableHead` typography. Do not force `text-xs uppercase tracking-wider` unless it is a globally requested pattern for all tables.
  - Avoid adding custom hover overrides like `hover:bg-transparent` to rows unless necessary to fix a specific bug.

## 5. Spacing and Animation
- **Spacing**: Stick to the standard Tailwind spacing scale (`space-y-4`, `space-y-6`, `gap-4`).
- **Animations**: Standard pages don't heavily use inline `animate-in fade-in` unless it's a modal or a specific entrance requirement.

## 6. General UX Patterns
- Primary actions should be situated in a flex container (e.g., `div.mb-4.flex.gap-2`) above the main data table or content area.
- Use Lucide icons consistently at standard sizes (`h-4 w-4` for button icons).
