import type {
  User, Tutorial, Product, Look, ShadeMatch, Scan, Recreation,
  Notification, NotificationType, Routine,
} from "@prisma/client";
import { relativeTime, relativeDay } from "./http.js";

/* ── Account ─────────────────────────────────────────────── */
export const presentUser = (u: User) => ({
  id: u.id,
  name: u.name,
  email: u.email,
  avatarUrl: u.avatarUrl ?? undefined,
  bio: u.bio ?? undefined,
  role: u.role,
  createdAt: u.createdAt.toISOString(),
});

/* ── Tutorials ───────────────────────────────────────────── */
export const presentTutorialSummary = (t: Tutorial) => ({
  id: t.id,
  title: t.title,
  cat: t.cat,
  mins: t.mins,
  level: t.level,
  views: t.views,
  img: t.img,
});

export const presentFeaturedTutorial = (t: Tutorial) => ({
  id: t.id,
  eyebrow: t.eyebrow ?? "THIS WEEK'S PICK",
  title: t.featuredTitle ?? t.title,
  meta: t.featuredMeta ?? `${t.level} · ${t.mins}`,
  img: t.featuredImg ?? t.img,
});

export const presentTutorialDetail = (t: Tutorial) => ({
  id: t.id,
  title: t.title,
  level: t.level,
  duration: t.mins,
  views: t.views,
  description: t.description,
  img: t.img,
  steps: t.steps,
});

/* ── Products ────────────────────────────────────────────── */
export const presentProductSummary = (p: Product) => ({
  id: p.id,
  name: p.name,
  brand: p.brand,
  category: p.category,
  price: p.priceLabel,
  rating: p.rating,
  img: p.img,
});

export const presentProductDetail = (p: Product) => ({
  id: p.id,
  name: p.name,
  brand: p.brand,
  price: p.priceAmount,
  img: p.img,
  rating: p.rating,
  reviewCount: p.reviewCount,
  highlights: p.highlights,
  description: p.description,
  shades: p.shades,
});

/* ── Looks (home feed trending) ──────────────────────────── */
export const presentLook = (l: Look) => ({
  id: l.id,
  label: l.label,
  meta: l.meta,
  level: l.level,
  img: l.img,
});

/* ── Shade match ─────────────────────────────────────────── */
export const presentMatchResult = (m: ShadeMatch) => ({
  id: m.id,
  tone: { label: m.toneLabel, sub: m.toneSub, hex: m.toneHex, confidence: m.toneConfidence },
  items: m.items,
});

export const presentRecentMatch = (m: ShadeMatch) => ({
  id: m.id,
  name: m.name,
  brand: m.brand,
  pct: m.pct,
  color: m.color,
});

export const presentMatchHistoryItem = (m: ShadeMatch) => ({
  id: m.id,
  name: m.name,
  brand: m.brand,
  pct: m.pct,
  color: m.color,
  date: relativeDay(m.createdAt),
});

export const presentScan = (sc: Scan) => ({
  id: sc.id,
  tone: sc.tone,
  date: relativeDay(sc.createdAt),
  confidence: sc.confidence,
});

/* ── Recreate ────────────────────────────────────────────── */
export const presentRecreation = (r: Recreation) => ({
  id: r.id,
  versions: r.versions,
  aiNote: r.aiNote,
  sections: r.sections,
});

/* ── Notifications ───────────────────────────────────────── */
const NOTIF_PRESENTATION: Record<NotificationType, { icon: string; bg: string; color: string }> = {
  MATCH: { icon: "color-palette", bg: "#F5EAEF", color: "#753248" },
  TUTORIAL: { icon: "book", bg: "#EAF7EF", color: "#2F7D52" },
  RECREATION: { icon: "sparkles", bg: "#EAF0FB", color: "#3B5BDB" },
  PROMO: { icon: "diamond", bg: "#FBF1E6", color: "#A06A2C" },
  SYSTEM: { icon: "notifications", bg: "#F5EAEF", color: "#753248" },
  ORDER: { icon: "bag-handle", bg: "#EAF7EF", color: "#2F7D52" },
};

export const presentNotification = (n: Notification) => ({
  id: n.id,
  ...NOTIF_PRESENTATION[n.type],
  title: n.title,
  body: n.body,
  time: relativeTime(n.createdAt),
  read: n.read,
  route: n.route ?? undefined,
});

/* ── Routines ────────────────────────────────────────────── */
export const presentRoutine = (r: Routine) => ({
  id: r.id,
  name: r.name,
  time: r.time,
  steps: r.steps,
});
