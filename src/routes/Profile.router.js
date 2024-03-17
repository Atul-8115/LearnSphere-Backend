import { Router } from "express"
import 
{ 
    deleteAccount, 
    getAllUserDetails, 
    updateProfileDetails 
} from "../controllers/ProfileDetails.controllers.js"

import {
    auth
} from "../middleware/auth.js"

const router = Router()
// ********************************************************************************************************
//                                      Profile routes
// ********************************************************************************************************

// Delet User Account
router.delete("/deleteProfile", deleteAccount)
router.put("/updateProfile", auth, updateProfileDetails)
router.get("/getUserDetails", auth, getAllUserDetails)
// Get Enrolled Courses

// router.get("/getEnrolledCourses", auth, getEnrolledCourses)
// router.put("/updateDisplayPicture", auth, updateDisplayPicture)

export default router