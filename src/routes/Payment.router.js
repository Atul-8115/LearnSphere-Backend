import { Router } from "express"

import { 
    auth, 
    isStudent 
} from "../middleware/auth.js"

import { 
    capturePayment, 
    verifyPayment,
    sendPaymentSuccessEmail
} from "../controllers/Payment.controllers.js"

const router = Router()

router.post("/capturePayment", auth, isStudent, capturePayment)
router.post("/verifyPayment",auth,isStudent, verifyPayment)
router.post("/sendPaymentSuccessEmail",auth,isStudent,sendPaymentSuccessEmail)

export default router