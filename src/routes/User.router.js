import { Router } from "express";
import { changePassword, login, sendOTP, signUp } from "../controllers/Auth.controllers.js";
import { resetPassword, resetPasswordToken } from "../controllers/ResetPassword.controllers.js";
import { auth } from "../middleware/auth.js";
const router = Router();

// Routes for Login, Signup, and Authentication

// ********************************************************************************************************
//                                      Authentication routes
// ********************************************************************************************************
router.post("/sendotp",sendOTP)

router.post("/login",login)

router.post("/signup",signUp)

router.post("/changepassword",auth,changePassword)

// ********************************************************************************************************
//                                      Reset Password
// ********************************************************************************************************

router.post("/reset-password-token", resetPasswordToken)

router.post("/reset-password",resetPassword)

export default router