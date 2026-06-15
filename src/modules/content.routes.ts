import { Router } from "express";
import { ok, asyncHandler } from "../lib/http.js";

export const contentRouter = Router();

const UPDATED = "2026-06-01";

contentRouter.get("/terms", asyncHandler(async (_req, res) => {
  ok(res, {
    title: "Terms of Service",
    updatedAt: UPDATED,
    sections: [
      { heading: "Using DollFace", body: "DollFace provides personalised beauty recommendations, tutorials and shopping. You're responsible for keeping your account secure and for the activity under it." },
      { heading: "Your content", body: "Photos you upload for shade matching and look recreation are processed to generate recommendations. You own your content; you grant us a licence to process it to provide the service." },
      { heading: "Purchases & subscriptions", body: "Paid plans renew automatically until cancelled. Prices are shown before purchase and may vary by region." },
      { heading: "Acceptable use", body: "Don't misuse the service, attempt to disrupt it, or upload content you don't have the rights to." },
    ],
  });
}));

contentRouter.get("/privacy", asyncHandler(async (_req, res) => {
  ok(res, {
    title: "Privacy Policy",
    updatedAt: UPDATED,
    sections: [
      { heading: "What we collect", body: "Account details, your beauty profile, and the photos you submit for analysis. We collect usage data to improve recommendations." },
      { heading: "How we use it", body: "To personalise shade matches, tutorials and product picks, and to operate and improve DollFace." },
      { heading: "Your photos", body: "Selfies and inspiration images are used to generate your results. You can disable scan storage in Settings and delete your data at any time." },
      { heading: "Your rights", body: "You can access, export or delete your data from Settings, or by contacting hello@dollface.app." },
    ],
  });
}));
