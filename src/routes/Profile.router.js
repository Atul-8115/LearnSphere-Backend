import { Router } from "express"
import 
{ 
    deleteAccount, 
    getAllUserDetails, 
    getEnrolledCourses, 
    updateDisplayPicture, 
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
router.delete("/deleteProfile", auth ,deleteAccount)
router.put("/updateProfile", auth, updateProfileDetails)
router.get("/getUserDetails", auth, getAllUserDetails)
// Get Enrolled Courses

router.get("/getEnrolledCourses", auth, getEnrolledCourses)
router.route("/updateDisplayPicture").put(auth, updateDisplayPicture)

export default router