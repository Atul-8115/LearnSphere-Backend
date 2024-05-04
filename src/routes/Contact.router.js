import { Router } from "express";
import { contactUsController } from "../controllers/ContactUs.controllers.js";

const router = Router()

router.post("/", contactUsController)

export default router