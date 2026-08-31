import { Router } from "express";

import { requirePermission } from "../../middleware/auth.middleware";
import { asyncHandler } from "../../utils/asyncHandler";
import { AdminPaymentsController } from "./adminPayments.controller";
import { AdminPaymentsRepository } from "./adminPayments.repository";
import { AdminPaymentsService } from "./adminPayments.service";

const repository = new AdminPaymentsRepository();
const service = new AdminPaymentsService(repository);
const controller = new AdminPaymentsController(service);

/** Montées sous `/admin/payments` par `modules/admin/admin.routes.ts`. */
export const adminPaymentsRouter = Router();

/** @openapi /admin/payments/overview: get: { summary: MRR/ARR/conversion, tags: [Admin - Payments], responses: { 200: { description: OK } } } */
adminPaymentsRouter.get("/overview", requirePermission("payments.read"), asyncHandler(controller.overview));

/** @openapi /admin/payments: get: { summary: Liste paginée des paiements, tags: [Admin - Payments], responses: { 200: { description: OK } } } */
adminPaymentsRouter.get("/", requirePermission("payments.read"), asyncHandler(controller.list));
