import { Router } from "express";

import { metricsHandler } from "../controllers/metrics.controller";
import { asyncHandler } from "../utils/asyncHandler";

export const metricsRouter: Router = Router();

metricsRouter.get("/", asyncHandler(metricsHandler));
