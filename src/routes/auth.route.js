import { Router } from "express";
import authController from "../controllers/auth.controller.js";
import { schema } from "../validators/user.validate.js";
import validate from "../validators/validate.js";

const router = Router();

router.post('/', validate(schema), authController.login);

export default router;
