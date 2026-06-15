import argon2 from "argon2";

/** Argon2id password hashing (memory-hard, the modern recommendation). */
export const hashPassword = (plain: string) => argon2.hash(plain);

export const verifyPassword = (hash: string, plain: string) =>
  argon2.verify(hash, plain).catch(() => false);
