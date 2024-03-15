import { Category } from "../models/Category.model.js";
import { ApiErrors } from "../utils/ApiErrors.js";
import { ApiResponse } from "../utils/AppResponse.js";
import { asycnHandler } from "../utils/asynHandler.js";
import { Course } from "../models/Course.model.js"

const createCategory = asycnHandler(async (req,res) => {
    try {
        const {name, description} = req.body

        if(!name || !description) {
            throw new ApiErrors(400,"Tag name and description are required.")
        }

        const categoryDetails = await Category.create({
            name: name,
            description:description
        })

        console.log(categoryDetails)

        return res
               .status(200)
               .json(new ApiResponse(200,categoryDetails,"Tag created successfully."))
    } catch (error) {
        console.log("ERROR MESSAGE: ",error.message)
        throw new ApiResponse(500,"Something went wrong while creating tag. ")
    }
})

const getAllCategory = asycnHandler(async (req,res) => {
    try {
        const allCategory = await Category.find({},{name: true, description: true})
        return res
               .status(200)
               .json(new ApiResponse(200,allCategory,"Fetched all the tags successfully."))
    } catch (error) {
        console.log("ERROR MESSAGE: ",error.message)
        throw new ApiErrors(500,"Something went wrong while fetching the tags")
    }
})

const getCourseByCategory = asycnHandler(async (req,res) => {
    try {
          const {courseId} = req.body

          const getAllCourses = await Course.findById({courseId})
                                                                .populate("courses")
                                                                .exec();
          if(!getAllCourses) {
              throw new ApiErrors(404,"Courses not found with the given category.")
          }

         const getDifferentCategories = await Course.find({_id:courseId},{$ne:{courseId}});


         return res
                .status(200)
                .json(new ApiResponse(200,getAllCourses,getDifferentCategories,"Desired data fetched successfully."))
    } catch (error) {
        console.log("ERROR MESSAGE: ",error.message)
        throw new ApiErrors(500,"Something went wrong while fetching data.")
    }
})

export {
    createCategory,
    getAllCategory,
    getCourseByCategory
}