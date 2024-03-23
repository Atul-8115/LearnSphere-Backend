import { ApiErrors } from "../utils/ApiErrors.js";
import { asycnHandler } from "../utils/asynHandler.js";
import {RatingAndReview} from "../models/RatingAndReview.model.js"
import { Course } from "../models/Course.model.js";
import { ApiResponse } from "../utils/AppResponse.js";
import mongoose from "mongoose";
// TODO: Create Rating and Review controller
const createRatingAndReview = asycnHandler(async (req,res) => {
    try {
        const userId = req.user.id 
        const {rating,review,courseId} = req.body
        const courseDetails = await Course.findById({_id:courseId,
                                                studentsEnrolled: {$elemMatch: {$eq:userId}}
                                             })
        if(!courseDetails) {
            throw new ApiErrors(404,"Only enrolled students can give rating and review to this course.")
        }

        const alreadyReviewed = await RatingAndReview.findOne({
                                               user:userId,course:courseId
                                            })
        if(alreadyReviewed) {
            throw new ApiErrors(400,"User already gave rating and review.")
        }

        const ratingAndReview = await RatingAndReview.create(
                                                            userId,
                                                            rating,
                                                            review,
                                                            courseId
                                                        )
        await Course.findByIdAndUpdate(
                                {_id:courseId},
                                {
                                    $push: {
                                        ratingAndReviews: ratingAndReview._id,
                                    }
                                }
                            )
        
        return res
               .status(200)
               .json(new ApiResponse(200,ratingAndReview,"Rating and review created successfully."))
    } catch (error) {
        console.log("ERROR MESSAGE: ",error.message)
        throw new ApiErrors(500,"Something went wrong while creating rating and review.")
    }
})
// TODO: Create get average rating controller

const getAverageRating = asycnHandler(async (req,res) => {
    try {
        const courseId = req.body.courseId

        const result = await RatingAndReview.aggregate({
                                                        $match: {
                                                            course: new mongoose.Types.ObjectId({courseId})
                                                        }
                                                    },
                                                    {
                                                        $group: {
                                                            _id: null,
                                                            averageRating: {$avg:"$rating"}
                                                        }
                                                    })
        if(result.length > 0) {
            return res
                   .status(200)
                   .json(new ApiResponse(200,{averageRating:result[0].averageRating},"Average rating fetched successfully."))
        }

        return res
               .status(200)
               .json(new ApiResponse(200,{averageRating:0},"Average rating is 0, no rating given till now."))
    } catch (error) {
        console.log("ERROR MESSAGE: ",error.message)
        throw new ApiErrors(500,"Something went wrong while fetching average rating.")
    }
})
// TODO: Create get all rating and review handler
const getAllRatingAndReviews = asycnHandler(async (req,res) => {
    try {
        const allRatingAndReviews = await RatingAndReview.find({})
                                                                 .sort({rating:"desc"})
                                                                 .populate({
                                                                    path: "user",
                                                                    select: "firstName lastName email image"
                                                                 })
                                                                 .populate({
                                                                    path: "course",
                                                                    select: "courseName"
                                                                 })
                                                                 .exec();
        return res
               .status(200)
               .json(new ApiResponse(200,allRatingAndReviews,"All rating and review fetched successfully."))
    } catch (error) {
        console.log("ERROR MESSAGE: ",error.message)
        throw new ApiErrors(500,"Something went wrong while fetching all rating and reviews.")
    }
})

export {
    createRatingAndReview,
    getAverageRating,
    getAllRatingAndReviews
}