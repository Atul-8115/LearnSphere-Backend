import { Category } from "../models/Category.model.js";
import { ApiErrors } from "../utils/ApiErrors.js";
import { ApiResponse } from "../utils/AppResponse.js";
import { asycnHandler } from "../utils/asynHandler.js";
import { Course } from "../models/Course.model.js"
function getRandomInt(max) {
    return Math.floor(Math.random()*max)
}

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
        const allCategory = await Category.find({})
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

          const selectedCategory = await Category.findById(categoryId)
                                                                .populate({
                                                                    path: "courses",
                                                                    match: {status: "Published"},
                                                                    populate: "ratingAndReviews"
                                                                })
                                                                .exec();
          if(!selectedCategory) {
              throw new ApiErrors(404,"Courses not found with the given category.")
          }

          if(selectedCategory.courses.length === 0) {
            throw new ApiErrors(404,"No courses found for the selected category.")
          }

        //   const selectedCourses = selectedCategory.courses

         const categoriesExceptSelected = await Category.find({_id: {$ne: categoryId}})

         let differentCategory = await Category.findOne(
            categoriesExceptSelected[getRandomInt(categoriesExceptSelected.length)]
              ._id
          )
            .populate({
              path: "courses",
              match: { status: "Published" },
            })
            .exec()
            //console.log("Different COURSE", differentCategory)
          // Get top-selling courses across all categories
          const allCategories = await Category.find()
            .populate({
              path: "courses",
              match: { status: "Published" },
              populate: {
                path: "instructor",
            },
            })
            .exec();
          const allCourses = allCategories.flatMap((category) => category.courses)
          const mostSellingCourses = allCourses
            .sort((a, b) => b.sold - a.sold)
            .slice(0, 10)

         return res
                .status(200)
                .json(new ApiResponse(200,{selectedCategory,differentCategory,mostSellingCourses},"Desired data fetched successfully."))
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