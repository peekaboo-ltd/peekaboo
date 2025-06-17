import { Router } from "express";
import { RoleController } from "../controllers/role.controller";

const router = Router();

router.post("/", RoleController.createRole);

export default router;
