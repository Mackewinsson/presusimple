/**
 * Shared route helpers for budget-related paths.
 * Single source of truth for locale-aware budget routes (used by MobileBottomTab, MobileHeader, add page).
 */

const BUDGET_BASE = "/budget";
const BUDGET_ADD = "/budget/add";
const ES_BUDGET_BASE = "/es/budget";
const ES_BUDGET_ADD = "/es/budget/add";

/**
 * Returns the budget base path for the current locale from pathname.
 * Use for building links and redirect targets.
 */
export function getBudgetBasePath(pathname: string): string {
  return pathname.startsWith("/es") ? ES_BUDGET_BASE : BUDGET_BASE;
}

/**
 * Returns whether the pathname is the budget add (transaction) route.
 */
export function isBudgetAddPath(pathname: string): boolean {
  return pathname === BUDGET_ADD || pathname === ES_BUDGET_ADD;
}

const HISTORY_BASE = "/history";
const ES_HISTORY_BASE = "/es/history";

/**
 * Returns the history list path for the current locale from pathname.
 */
export function getHistoryBasePath(pathname: string): string {
  return pathname.startsWith("/es") ? ES_HISTORY_BASE : HISTORY_BASE;
}

/**
 * True when pathname is the history list page (not detail or insights).
 */
export function isHistoryListPath(pathname: string): boolean {
  return pathname === HISTORY_BASE || pathname === ES_HISTORY_BASE;
}

/**
 * True when pathname is a history sub-route (detail or insights).
 */
export function isHistorySubPath(pathname: string): boolean {
  return (
    /^\/history\/[^/]+/.test(pathname) ||
    /^\/es\/history\/[^/]+/.test(pathname)
  );
}
