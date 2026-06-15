import type { Request, Response, NextFunction } from "express";

/** Standard success envelope — matches the app's `{ success, data }` contract. */
export function ok<T>(res: Response, data: T, status = 200): Response {
  return res.status(status).json({ success: true, data });
}

/** Wrap async route handlers so thrown/rejected errors reach the error middleware. */
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>,
) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

/**
 * Optional pagination. Returns the plain array (back-compatible with the app's
 * mock contract) unless `?page=` or `?limit=` is supplied, in which case it
 * returns `{ items, page, limit, total, hasMore }`.
 */
export function paginate<T>(items: T[], query: Record<string, unknown>): T[] | { items: T[]; page: number; limit: number; total: number; hasMore: boolean } {
  const hasPage = query.page !== undefined;
  const hasLimit = query.limit !== undefined;
  if (!hasPage && !hasLimit) return items;
  const page = Math.max(1, parseInt(String(query.page ?? "1"), 10) || 1);
  const limit = Math.max(1, Math.min(100, parseInt(String(query.limit ?? "20"), 10) || 20));
  const start = (page - 1) * limit;
  return { items: items.slice(start, start + limit), page, limit, total: items.length, hasMore: start + limit < items.length };
}

/** Relative time label e.g. "2h", "3 days ago", "Today" — for notifications/history. */
export function relativeTime(date: Date): string {
  const ms = Date.now() - date.getTime();
  const mins = Math.floor(ms / 60000);
  if (mins < 1) return "now";
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d`;
  const weeks = Math.floor(days / 7);
  return `${weeks}w`;
}

/** Friendly calendar-ish label for history rows. */
export function relativeDay(date: Date): string {
  const days = Math.floor((Date.now() - date.getTime()) / 86400000);
  if (days <= 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  if (days < 14) return "Last week";
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}
