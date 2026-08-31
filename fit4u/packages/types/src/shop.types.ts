export interface ProductDTO {
  id: string;
  name: string;
  slug: string;
  description?: string;
  priceCents: number;
  currency: string;
  imageUrl?: string;
  stockQuantity: number;
}

export interface CartItemDTO {
  id: string;
  product: ProductDTO;
  quantity: number;
}

export interface CartDTO {
  id: string;
  items: CartItemDTO[];
}

export type OrderStatus = "PENDING" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED" | "REFUNDED";

export interface OrderDTO {
  id: string;
  status: OrderStatus;
  subtotalCents: number;
  discountCents: number;
  totalCents: number;
  currency: string;
  createdAt: string;
}
