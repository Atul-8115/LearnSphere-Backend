import { Category } from "../models/Category.model.js";
import { ApiErrors } from "../utils/ApiErrors.js";
import { ApiResponse } from "../utils/AppResponse.js";
import { asycnHandler } from "../utils/asynHandler.js";
import { Course } from "../models/Course.model.js"

const createCategory = asycnHandler(async (req,res) => {
    try {
        const {name, description} = req.body

        if(!name) {
            throw new ApiErrors(400,"Tag name is required.")
        }

        const categoryDetails = await Category.create({
            name: name,
            description:description
        })

        console.log(categoryDetails)

        return res
               .status(200)
               .json(new ApiResponse(200,categoryDetails,"Category created successfully."))
    } catch (error) {
        console.log("ERROR MESSAGE: ",error.message)
        throw new ApiResponse(500,"Something went wrong while creating category. ")
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

const categoryPageDetails = asycnHandler(async (req,res) => {
    try {
          const {categoryId} = req.body

          const selectedCategory = await Category.findById({categoryId})
                                                                .populate("courses")
                                                                .exec();
          if(!selectedCategory) {
              throw new ApiErrors(404,"Courses not found with the given category.")
          }

          if(selectedCategory.courses.length === 0) {
            throw new ApiErrors(404,"No courses found for the selected category.")
          }

          const selectedCourses = selectedCategory.courses

         const categoriesExceptSelected = await Category.find({_id: {$ne: categoryId}}).populate("courses");

         let differentCourses = []
         for(const category of categoriesExceptSelected) {
            differentCourses.push(...category.courses)
         }

        //  Fetch top 10 most selling courses
        const allCategory = await Category.find().populate('courses').exec();
        const allCourses = allCategory.flatMap((category) => category.courses)
        const mostSellingCourses = allCourses.sort((a,b) => b.sold - a.sold).slice(0,10)

         return res
                .status(200)
                .json(new ApiResponse(200,selectedCourses,differentCourses,mostSellingCourses,"Desired data fetched successfully."))
    } catch (error) {
        console.log("ERROR MESSAGE: ",error.message)
        throw new ApiErrors(500,"Something went wrong while fetching data.")
    }
})

export {
    createCategory,
    getAllCategory,
    categoryPageDetails
}