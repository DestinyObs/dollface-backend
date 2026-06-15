/**
 * Representative shade-match & recreation analysis content. Phase 1 returns this
 * deterministically; a later phase swaps in a real model service (API_SPEC §5)
 * behind the same endpoints, so nothing downstream changes.
 */

export const SAMPLE_TONE = {
  label: "Medium Tan · Warm Golden",
  hex: "#C4875A",
  confidence: "High confidence match",
};

export const SAMPLE_MATCH_ITEMS = [
  {
    category: "Foundation", confidence: "High", matchedShade: "220 Natural Beige", brand: "Fenty Beauty",
    product: "Pro Filt'r Soft Matte", hex: "#C4875A",
    reason: "Matched to your medium-tan tone with warm golden undertones across Fenty's inclusive range.",
    alternatives: [
      { brand: "MAC", product: "Studio Fix Fluid", shade: "NC40", hex: "#C48558", price: "£29" },
      { brand: "NYX", product: "Can't Stop Won't Stop", shade: "Warm Caramel", hex: "#C28050", price: "£13" },
    ],
  },
  {
    category: "Concealer", confidence: "High", matchedShade: "320W", brand: "Fenty Beauty",
    product: "Pro Filt'r Instant Retouch", hex: "#CAA070",
    reason: "One shade lighter than your foundation to brighten under-eye coverage.",
    alternatives: [
      { brand: "Charlotte Tilbury", product: "Magic Away", shade: "8 Medium", hex: "#C89A60", price: "£28" },
    ],
  },
];

export const SAMPLE_MATCH_HEADLINE = { name: "220 Natural Beige", brand: "Fenty Beauty", pct: "92%", color: "#C4875A" };

export const SAMPLE_RECREATION = {
  versions: ["Your Version", "Beginner", "Budget"],
  aiNote: "This version adapts the look for your medium-tan skin tone and warm undertone. All shades re-matched to your profile.",
  sections: [
    { area: "BASE", icon: "sparkles-outline", label: "Base Makeup", description: "Full-coverage foundation blended seamlessly for a glass-skin effect.", technique: "Apply with a damp beauty sponge using pressing motions for seamless coverage.", products: [{ name: "Pro Filt'r Soft Matte", brand: "Fenty Beauty", shade: "220N", price: "£34" }, { name: "Instant Retouch Concealer", brand: "Fenty Beauty", shade: "320W", price: "£27" }] },
    { area: "BROWS", icon: "pencil-outline", label: "Brows", description: "Full, defined brows with a slightly arched shape. Focus definition at the tail.", technique: "Use feathery strokes to mimic natural hairs. Brush up and set with clear gel.", products: [{ name: "Gimme Brow+", brand: "Benefit", shade: "4", price: "£26" }] },
    { area: "EYES", icon: "eye-outline", label: "Eye Look", description: "Soft brown smoky eye with warm copper in the crease and black liner.", technique: "Blend matte brown in the crease first, build depth with copper on the lid.", products: [{ name: "Naked3 Palette", brand: "Urban Decay", shade: "Various", price: "£41" }] },
    { area: "CHEEKS", icon: "flower-outline", label: "Cheeks", description: "Warm bronzer sculpted along the cheekbones. Peachy-pink blush on the apples.", technique: "Bronzer in a 3-shape from temples to jaw. Blush on apples blended upward.", products: [{ name: "Hoola Bronzer", brand: "Benefit", shade: "Medium", price: "£30" }] },
    { area: "LIPS", icon: "heart-outline", label: "Lips", description: "Nude-mauve liner with a satin lipstick slightly overlined for fullness.", technique: "Slightly overline the cupid's bow. Fill with liner before applying lipstick.", products: [{ name: "Lip Cheat Liner", brand: "Charlotte Tilbury", shade: "Pillowtalk", price: "£19" }] },
  ],
};
