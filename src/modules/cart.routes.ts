import { Router } from "express";
import { z } from "zod";
import type { Cart, CartItem } from "@prisma/client";
import { prisma } from "../db.js";
import { ok, asyncHandler } from "../lib/http.js";
import { AppError } from "../lib/errors.js";
import { requireAuth, authUserId } from "../middleware/auth.js";

export const cartRouter = Router();
cartRouter.use(requireAuth);

const getCart = (userId: string) =>
  prisma.cart.upsert({ where: { userId }, create: { userId }, update: {}, include: { items: true } });

function presentCart(cart: Cart & { items: CartItem[] }) {
  const items = cart.items.map((i) => ({
    id: i.id, productId: i.productId ?? undefined, name: i.name, brand: i.brand,
    price: i.price, shade: i.shade ?? undefined, img: i.img ?? undefined, qty: i.qty,
  }));
  return {
    items,
    count: items.reduce((n, i) => n + i.qty, 0),
    subtotal: items.reduce((n, i) => n + i.price * i.qty, 0),
  };
}

cartRouter.get("/", asyncHandler(async (req, res) => {
  ok(res, presentCart(await getCart(authUserId(req))));
}));

const addSchema = z.object({
  productId: z.string().optional(),
  name: z.string().min(1),
  brand: z.string().min(1),
  price: z.number().nonnegative(),
  shade: z.string().optional(),
  img: z.string().optional(),
  qty: z.number().int().positive().default(1),
});

cartRouter.post("/items", asyncHandler(async (req, res) => {
  const userId = authUserId(req);
  const body = addSchema.parse(req.body);
  const cart = await getCart(userId);

  const existing = body.productId
    ? cart.items.find((i) => i.productId === body.productId && i.shade === (body.shade ?? null))
    : undefined;

  if (existing) {
    await prisma.cartItem.update({ where: { id: existing.id }, data: { qty: existing.qty + body.qty } });
  } else {
    await prisma.cartItem.create({
      data: {
        cartId: cart.id, productId: body.productId ?? null, name: body.name, brand: body.brand,
        price: body.price, shade: body.shade ?? null, img: body.img ?? null, qty: body.qty,
      },
    });
  }
  ok(res, presentCart(await getCart(userId)), 201);
}));

const qtySchema = z.object({ qty: z.number().int() });

cartRouter.patch("/items/:id", asyncHandler(async (req, res) => {
  const userId = authUserId(req);
  const { qty } = qtySchema.parse(req.body);
  const cart = await getCart(userId);
  const item = cart.items.find((i) => i.id === req.params.id);
  if (!item) throw new AppError(404, "Cart item not found", "NOT_FOUND");

  if (qty <= 0) await prisma.cartItem.delete({ where: { id: item.id } });
  else await prisma.cartItem.update({ where: { id: item.id }, data: { qty } });
  ok(res, presentCart(await getCart(userId)));
}));

cartRouter.delete("/items/:id", asyncHandler(async (req, res) => {
  const userId = authUserId(req);
  const cart = await getCart(userId);
  if (!cart.items.some((i) => i.id === req.params.id)) throw new AppError(404, "Cart item not found", "NOT_FOUND");
  await prisma.cartItem.delete({ where: { id: req.params.id } });
  ok(res, presentCart(await getCart(userId)));
}));

cartRouter.delete("/", asyncHandler(async (req, res) => {
  const cart = await getCart(authUserId(req));
  await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
  ok(res, presentCart(await getCart(authUserId(req))));
}));
