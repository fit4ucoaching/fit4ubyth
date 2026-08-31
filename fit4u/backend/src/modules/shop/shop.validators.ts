import { z } from "zod";

export const listProductsQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20),
  categoryId: z.string().uuid().optional(),
});

export const addCartItemSchema = z.object({
  productId: z.string().uuid(),
  quantity: z.coerce.number().int().positive().max(50).default(1),
});

export const checkoutSchema = z.object({
  couponCode: z.string().optional(),
  shippingAddress: z.object({
    line1: z.string().min(1),
    line2: z.string().optional(),
    city: z.string().min(1),
    postalCode: z.string().min(1),
    country: z.string().length(2),
  }),
  paymentMethod: z.enum(["stripe", "paypal", "apple_pay", "google_pay"]),
});

export type AddCartItemInput = z.infer<typeof addCartItemSchema>;
export type CheckoutInput = z.infer<typeof checkoutSchema>;
