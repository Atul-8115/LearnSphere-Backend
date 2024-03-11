import { User } from "../models/User.model.js";
import { ApiErrors } from "../utils/ApiErrors.js";
import { asycnHandler } from "../utils/asynHandler.js";
import { Tag } from "../models/Tags.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { Course } from "../models/Course.model.js"
import { ApiResponse } from "../utils/AppResponse.js";

const createCourse = asycnHandler(async (req,res) => {
    try {
        const {courseName, courseDescription, whatYouWillLearn, price,tag} = req.body
        const thumbnail = req.files?.thumbnailImage

        if(!courseName || !courseDescription || !whatYouWillLearn || !price || !tag || !thumbnail) {
            throw new ApiErrors(400,"All fiels are required. ")
        }

        const instructorId = req.user._id
        const instructorDetails = await User.findById(instructorId)
        console.log(instructorDetails)

        if(!instructorDetails) {
            throw new ApiErrors(404,"Instructor Details not found")
        }

        const tagDetails = await Tag.findById(tag)
        if(!tagDetails) {
            throw new ApiErrors(400,"Tag details not found")
        }

        const thumbnailImage = await uploadOnCloudinary(thumbnail)
        if(!thumbnailImage) {
            throw new ApiErrors(500,"Unable to upload thumbnail")
        }

        const newCourseDetails = await Course.create({
                    courseName,
                    courseDescription,
                    instructor: instructorDetails._id,
                    whatYouWillLearn,
                    price,
                    thumbnail: thumbnailImage.secure_url,
                    tag: tagDetails._id
                },
                {
                    new: true,
                }
            )
        // Add new course to user schema
        await User.findByIdAndUpdate(
            {_id: instructorDetails._id},
            {
                $push: {
                    courses: newCourseDetails._id
                }
            },
            {
                new:true
            }
        )

        await Tag.findByIdAndUpdate(
            {_id:tagDetails._id},
            {
                $push: {
                    courses: newCourseDetails._id
                }
            },
            {new: true}
        )

        return res
               .status(200)
               .json(new ApiResponse(200,newCourseDetails,"Course created successfully. "))
    } catch (error) {
        console.log("ERROR MESSAGE: ",error.message)
        throw new ApiErrors(500,"Something went wrong while creating new course")
    }
})

const getAllCourses = asycnHandler(async (req,res) => {
    try {
        const allCourses = await Course.find({},{
                                                  courseName: true,
                                                  courseDescription:true,
                                                  instructor:true,
                                                  whatYouWillLearn:true,
                                                  price:true,
                                                  studentsEnrolled:true,
                                                  thumbnail:true,
                                               })
                                               .populate("instructor")
                                               .exec()
        return res
               .status(200)
               .json(new ApiResponse(200,allCourses,"All courses fetched successfully. "))
    } catch (error) {
        console.log("ERROR MESSAGE: ",error.message)
        throw new ApiErrors(500,"Something went wrong while fetching courses")
    }
})

export {
    createCourse,
    getAllCourses
}