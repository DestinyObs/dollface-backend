import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Mirror the app's image helper so seeded URLs are identical to the mock
// (dollface-mobile/constants/images.ts).
const BASE = "https://images.unsplash.com/photo-";
const img = (id: string, w = 800, h?: number) =>
  `${BASE}${id}?auto=format&fit=crop&w=${w}${h ? `&h=${h}` : ""}&q=80`;

const PHOTO = {
  modelSoft: "1591019479261-1a103585c559",
  modelBold: "1502823403499-6ccfcf4fb453",
  modelClean: "1488426862026-3ee34a7d66df",
  modelNatural: "1522335789203-aabd1fc54bc9",
  paletteEyes: "1487412720507-e7ab37603c6f",
  paletteColor: "1591019479261-1a103585c559",
  lipstick: "1457972729786-0411a3b2b626",
  brushesPink: "1515688594390-b649af70d282",
  productsFlat: "1596462502278-27bfdc403348",
  skincareGrey: "1571781926291-c477ebfd024b",
  skincareCream: "1620916566398-39f1143ab7be",
};

const TUTORIAL_STEPS = [
  { title: "Prep your skin", description: "Start with clean, moisturised skin. Apply a primer suited for your skin type — mattifying for oily, hydrating for dry.", tip: "Wait 2 minutes after primer before applying foundation." },
  { title: "Choose your tool", description: "A damp beauty sponge gives the most natural finish. A brush builds more coverage. Fingers give a sheer, skin-like look.", tip: "Always dampen your sponge so it doesn't absorb the product." },
  { title: "Apply foundation", description: "Start at the centre of your face and blend outward with gentle pressing motions, not dragging.", tip: "Less is more — build up in thin layers." },
  { title: "Blend the edges", description: "Check your jawline, hairline and neck. Blend until there are no visible lines.", tip: "Use a clean sponge edge to soften harsh lines." },
];

const TUTORIALS = [
  { id: "1", title: "Beginner Foundation Routine", cat: "Base", mins: "12 min", level: "Beginner", views: "24k", img: img(PHOTO.productsFlat, 400, 400),
    featured: true, eyebrow: "THIS WEEK'S PICK", featuredTitle: "Shade Matching Masterclass", featuredMeta: "AI-guided · All levels · 20 min", featuredImg: img(PHOTO.modelBold, 900, 1100) },
  { id: "2", title: "Fluffy Natural Brows", cat: "Brows", mins: "8 min", level: "Beginner", views: "18k", img: img(PHOTO.modelClean, 400, 400) },
  { id: "3", title: "Soft Smoky Eye, Deep Tones", cat: "Eyes", mins: "18 min", level: "Intermediate", views: "31k", img: img(PHOTO.paletteEyes, 400, 400) },
  { id: "4", title: "The Glass Skin Method", cat: "Base", mins: "15 min", level: "Intermediate", views: "42k", img: img(PHOTO.skincareCream, 400, 400) },
  { id: "5", title: "Bold Cut-Crease", cat: "Eyes", mins: "22 min", level: "Advanced", views: "12k", img: img(PHOTO.paletteColor, 400, 400) },
];

const PRODUCT_DESCRIPTION =
  "A full-coverage, oil-free liquid foundation with a soft matte finish. Builds to full coverage without looking heavy, in 50 inclusive shades.";
const PRODUCT_HIGHLIGHTS = ["Full coverage", "Soft matte", "Oil-free", "50 shades"];
const PRODUCT_SHADES = [
  { name: "Light Ivory", hex: "#F5DCBB" }, { name: "150W", hex: "#E8C49A" },
  { name: "210W", hex: "#D4A070" }, { name: "220N", hex: "#C4875A" },
  { name: "320W", hex: "#B0703A" }, { name: "420W", hex: "#8C5020" },
  { name: "490W", hex: "#5C2C08" },
];

const PRODUCTS = [
  { id: "1", name: "Pro Filt'r Soft Matte Foundation", brand: "Fenty Beauty", category: "Foundation", price: "£34", rating: "4.8", img: img(PHOTO.productsFlat, 400, 400) },
  { id: "2", name: "Studio Fix Fluid SPF15", brand: "MAC", category: "Foundation", price: "£31", rating: "4.6", img: img(PHOTO.skincareGrey, 400, 400) },
  { id: "3", name: "Fit Me Matte + Poreless", brand: "Maybelline", category: "Foundation", price: "£10", rating: "4.5", img: img(PHOTO.skincareCream, 400, 400) },
  { id: "4", name: "Soft Pinch Liquid Blush", brand: "Rare Beauty", category: "Blush", price: "£22", rating: "4.9", img: img(PHOTO.brushesPink, 400, 400) },
  { id: "5", name: "Hoola Matte Bronzer", brand: "Benefit", category: "Bronzer", price: "£30", rating: "4.7", img: img(PHOTO.productsFlat, 400, 400) },
  { id: "6", name: "Pillow Talk Lipstick", brand: "Charlotte Tilbury", category: "Lips", price: "£30", rating: "4.8", img: img(PHOTO.skincareGrey, 400, 400) },
];

const LOOKS = [
  { id: "soft-glam", label: "Soft Glam", meta: "2.4k saves", level: "Easy", img: img(PHOTO.modelSoft, 500, 600) },
  { id: "glass-skin", label: "Glass Skin", meta: "1.9k saves", level: "Medium", img: img(PHOTO.modelClean, 500, 600) },
  { id: "bold-lip", label: "Bold Lip", meta: "3.1k saves", level: "Easy", img: img(PHOTO.lipstick, 500, 600) },
  { id: "bronzed", label: "Bronzed", meta: "1.2k saves", level: "Medium", img: img(PHOTO.modelNatural, 500, 600) },
];

const BRANDS = [
  { id: "fenty-beauty", name: "Fenty Beauty", description: "Inclusive beauty for all skin tones." },
  { id: "mac", name: "MAC", description: "Professional makeup artistry." },
  { id: "maybelline", name: "Maybelline", description: "Accessible everyday glam." },
  { id: "rare-beauty", name: "Rare Beauty", description: "Makeup made to feel good in." },
  { id: "benefit", name: "Benefit", description: "Brows, bronzers and good times." },
  { id: "charlotte-tilbury", name: "Charlotte Tilbury", description: "Red-carpet glamour." },
];
const brandIdByName: Record<string, string> = Object.fromEntries(BRANDS.map((b) => [b.name, b.id]));

const ACHIEVEMENTS = [
  { id: "first-match", title: "First Match", description: "Completed your first shade match.", icon: "color-palette", order: 0 },
  { id: "look-creator", title: "Look Creator", description: "Recreated your first look.", icon: "sparkles", order: 1 },
  { id: "scholar", title: "Beauty Scholar", description: "Completed 5 tutorials.", icon: "school", order: 2 },
  { id: "collector", title: "Collector", description: "Saved 10 products.", icon: "bag-handle", order: 3 },
];

const COUPONS = [
  { code: "WELCOME10", type: "PERCENT" as const, value: 10 },
  { code: "DOLL5", type: "FIXED" as const, value: 5 },
];

async function main() {
  for (const [i, b] of BRANDS.entries()) {
    const data = { ...b, order: i };
    await prisma.brand.upsert({ where: { id: b.id }, create: data, update: data });
  }

  for (const [i, t] of TUTORIALS.entries()) {
    const data = { ...t, description: "A step-by-step guide that looks natural, lasts all day, and works for your skin tone and type.", steps: TUTORIAL_STEPS, order: i };
    await prisma.tutorial.upsert({ where: { id: t.id }, create: data, update: data });
  }

  for (const [i, p] of PRODUCTS.entries()) {
    const data = {
      id: p.id, name: p.name, brand: p.brand, brandId: brandIdByName[p.brand] ?? null, category: p.category,
      priceLabel: p.price, priceAmount: parseFloat(p.price.replace("£", "")),
      rating: p.rating, img: p.img, reviewCount: "2.4k reviews",
      highlights: PRODUCT_HIGHLIGHTS, description: PRODUCT_DESCRIPTION, shades: PRODUCT_SHADES,
      trending: i < 3, isNew: i >= 4, order: i,
    };
    await prisma.product.upsert({ where: { id: p.id }, create: data, update: data });
  }

  for (const [i, l] of LOOKS.entries()) {
    const data = { ...l, order: i };
    await prisma.look.upsert({ where: { id: l.id }, create: data, update: data });
  }

  for (const a of ACHIEVEMENTS) {
    await prisma.achievement.upsert({ where: { id: a.id }, create: a, update: a });
  }

  for (const c of COUPONS) {
    await prisma.coupon.upsert({ where: { code: c.code }, create: c, update: c });
  }

  await prisma.banner.deleteMany();
  await prisma.banner.create({ data: { placement: "home", title: "Find your perfect shade", img: img(PHOTO.modelBold, 900, 500), route: "/(tabs)/match", order: 0 } });

  await prisma.article.upsert({
    where: { slug: "undertones-101" },
    create: { slug: "undertones-101", title: "Undertones 101", excerpt: "Cool, warm or neutral — and why it matters.", body: "Your undertone is the subtle hue beneath your skin...", cover: img(PHOTO.modelSoft, 800, 500) },
    update: {},
  });

  const counts = {
    brands: await prisma.brand.count(),
    tutorials: await prisma.tutorial.count(),
    products: await prisma.product.count(),
    looks: await prisma.look.count(),
    achievements: await prisma.achievement.count(),
    coupons: await prisma.coupon.count(),
  };
  console.log("✓ Seed complete:", counts);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
