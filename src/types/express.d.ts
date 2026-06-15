import "express";

declare global {
  namespace Express {
    interface Request {
      /** Set by requireAuth from the verified access token. */
      userId?: string;
      userRole?: string;
      /** Raw request body buffer (for webhook signature verification). */
      rawBody?: Buffer;
    }
  }
}

export {};
