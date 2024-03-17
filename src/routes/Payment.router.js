import { Router } from "express"

import { 
    auth, 
    isStudent 
} from "../middleware/auth.js"

import { 
    capturePayment, 
    verifySignature 
} from "../controllers/Payment.controllers.js"

const router = Router()

router.post("/capturePayment", auth, isStudent, capturePayment)
router.post("/verifySignature", verifySignature)

export default router