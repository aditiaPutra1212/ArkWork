import { Router } from "express";
import { getDashboardStats } from "../controllers/employerDashboard.controller";
import { attachEmployerId } from "./employer";

const router = Router();

// Gunakan attachEmployerId agar session employer (emp_session) terbaca dengan benar
router.get("/", attachEmployerId, getDashboardStats);

export default router;