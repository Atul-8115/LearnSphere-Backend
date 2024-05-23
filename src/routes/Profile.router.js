import { Router } from "express"
import 
{ 
    deleteAccount, 
    getAllUserDetails, 
    getEnrolledCourses, 
    instructorDashboard, 
    updateDisplayPicture, 
    updateProfileDetails 
} from "../controllers/ProfileDetails.controllers.js"

import {
    auth,
    isInstructor
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
router.get("/instructorDashboard",auth,isInstructor,instructorDashboard)
export default router