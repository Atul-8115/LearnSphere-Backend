import { Router } from "express";
import { 
    auth, 
    isAdmin, 
    isInstructor, 
    isStudent 
} from "../middleware/auth.js";

import { 
    createCourse, 
    getAllCourses, 
    getCourseDetails, 
    getFullCourseDetails,
    editCourse,
    getInstructorCourses,
    deleteCourse
} from "../controllers/Course.controllers.js";

import { 
    createSection, 
    deleteSection, 
    updateSection 
} from "../controllers/Section.controllers.js";

import { 
    createSubSection, 
    deleteSubSection, 
    updateSubSection 
} from "../controllers/SubSection.controllers.js";

import { 
    categoryPageDetails, 
    createCategory, 
    getAllCategory 
} from "../controllers/Category.controllers.js";

import { 
    createRatingAndReview, 
    getAllRatingAndReviews, 
    getAverageRating 
} from "../controllers/RatingAndReview.controllers.js";

const router = Router();



// ********************************************************************************************************
//                                      Course routes
// ********************************************************************************************************

// Courses can Only be Created by Instructors
router.post("/createCourse", auth, isInstructor, createCourse)
//Add a Section to a Course
router.post("/addSection", auth, isInstructor, createSection)
// Update a Section
router.post("/updateSection", auth, isInstructor, updateSection)
// Delete a Section
router.post("/deleteSection", auth, isInstructor, deleteSection)
// Edit Sub Section
router.post("/updateSubSection", auth, isInstructor, updateSubSection)
// Delete Sub Section
router.post("/deleteSubSection", auth, isInstructor, deleteSubSection)
// Add a Sub Section to a Section
router.post("/addSubSection", auth, isInstructor, createSubSection)
// Get all Registered Courses
router.get("/getAllCourses", getAllCourses)
// Get Details for a Specific Courses
router.get("/getCourseDetails", getCourseDetails)
// Get Details for a Specific Courses
router.post("/getCourseDetails", getCourseDetails)
// Get Details for a Specific Courses
router.post("/getFullCourseDetails", auth, getFullCourseDetails)
// Edit Course routes
router.post("/editCourse", auth, isInstructor, editCourse)
// Get all Courses Under a Specific Instructor
router.get("/getInstructorCourses", auth, isInstructor, getInstructorCourses)
// Delete a Course
router.delete("/deleteCourse", deleteCourse)

// ********************************************************************************************************
//                                      Category routes (Only by Admin)
// ********************************************************************************************************
// Category can Only be Created by Admin
// TODO: Put IsAdmin Middleware here
router.post("/createCategory", auth, isAdmin, createCategory)
router.get("/showAllCategories", getAllCategory)
router.post("/getCategoryPageDetails", categoryPageDetails)

// ********************************************************************************************************
//                                      Rating and Review
// ********************************************************************************************************
router.post("/createRating", auth, isStudent, createRatingAndReview)
router.get("/getAverageRating", getAverageRating)
router.get("/getReviews", getAllRatingAndReviews)

export default router