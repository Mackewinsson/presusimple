# Theme and colors

Colors in the app are driven by a single theme system so they stay consistent across pages and components.

## Overview

- **CSS variables** in [app/globals.css](../app/globals.css) define the actual values for light and dark mode (`:root`, `.dark`, `.light`).
- **Tailwind** exposes those variables as semantic tokens (e.g. `bg-primary`, `text-destructive`) in [tailwind.config.ts](../tailwind.config.ts).
- **JavaScript** uses [lib/theme.ts](../lib/theme.ts) when a runtime color string is needed (e.g. Chart.js, inline styles, `getChartColor`, `getBudgetProgressColor`).

## Semantic tokens

| Token | Use for |
|-------|--------|
| **background** / **foreground** | Page background and default text |
| **card** / **card-foreground** | Cards and panels |
| **primary** / **primary-foreground** | Main actions, key UI, links |
| **secondary** / **secondary-foreground** | Secondary actions, subtle backgrounds |
| **muted** / **muted-foreground** | De-emphasized text and backgrounds |
| **accent** / **accent-foreground** | Highlights |
| **destructive** / **destructive-foreground** | Errors, remove actions, danger |
| **success** / **success-foreground** | Success state, positive feedback |
| **warning** / **warning-foreground** | Warnings, caution |
| **info** / **info-foreground** | Informational state (e.g. trial badge) |
| **chart-1** … **chart-5** | Charts and repeated series; in JS use `getChartColor(i)` from `lib/theme` |
| **border** / **input** / **ring** | Borders and form controls |

## Usage

- **In components (Tailwind):** Prefer semantic classes such as `bg-primary`, `text-destructive`, `border-warning`, `bg-success/20`. Avoid new hardcoded palette classes (e.g. `slate-500`, `blue-400`) in shared UI.
- **In JavaScript** (e.g. Chart.js, inline `style`, canvas): Use helpers from [lib/theme.ts](../lib/theme.ts):
  - `getChartColor(index)` for chart series colors (returns `{ hsl, rgb, hex }`).
  - `getBudgetProgressColor(percentage)` for progress bar colors.
  - `theme.dark.foreground.hex` / `theme.light.foreground.hex` (and similar) when you need a hex string for the current theme.

## Light / dark

Theme switching is class-based: the document gets `.light` or `.dark`. All semantic variables are defined for both in [app/globals.css](../app/globals.css), so components that use tokens automatically follow the active theme.

## Keeping theme in sync

When changing semantic colors, update both:

1. The corresponding variables in [app/globals.css](../app/globals.css) (for Tailwind and CSS).
2. The matching values in [lib/theme.ts](../lib/theme.ts) (for JS and charts).

A short sync note is documented at the top of [lib/theme.ts](../lib/theme.ts).
