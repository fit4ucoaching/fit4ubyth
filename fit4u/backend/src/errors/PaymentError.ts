import { AppError } from "./AppError";

/** Échec d'un flux de paiement (Stripe/PayPal/Apple Pay/Google Pay). */
export class PaymentError extends AppError {
  constructor(message = "Le paiement a échoué", details?: Record<string, unknown>) {
    super({ code: "PAYMENT_ERROR", message, statusCode: 402, details });
  }
}
