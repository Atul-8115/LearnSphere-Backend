import { User } from "../models/User.model.js";
import { ApiErrors } from "../utils/ApiErrors.js";
import { asycnHandler } from "../utils/asynHandler.js";
import { Category } from "../models/Category.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { Course } from "../models/Course.model.js"
import { ApiResponse } from "../utils/AppResponse.js";

const createCourse = asycnHandler(async (req,res) => {
    try {
        let {courseName, courseDescription, whatYouWillLearn, price,category, tags,status,
			instructions,} = req.body
        const thumbnail = req.files?.thumbnail
        if(!status || status === undefined) {
            status = "Draft"
        }
        console.log("thumbnail-> ",thumbnail);
        if(!courseName || !courseDescription || !whatYouWillLearn || !price || !category || !thumbnail ||!tags) {
            throw new ApiErrors(400,"All fiels are required. ")
        }

        const instructorId = req.user._id
        const instructorDetails = await User.findById(instructorId, {
			accountType: "Instructor",
		});
        console.log(instructorDetails)

        if(!instructorDetails) {
            throw new ApiErrors(404,"Instructor Details not found")
        }

        const categoryDetails = await Category.findById(category)
        console.log("CategoryDetails -> ",categoryDetails)
        if(!categoryDetails) {
            throw new ApiErrors(400,"Category details not found")
        }

        const thumbnailImage = await uploadOnCloudinary(thumbnail)
        console.log("thumbnailImage: ",thumbnailImage);
        if(!thumbnailImage) {
            throw new ApiErrors(500,"Unable to upload thumbnail")
        }
        console.log("Id of instructor ",instructorDetails.id);
        const newCourseDetails = await Course.create({
                    courseName,
                    courseDescription,
                    instructor: instructorDetails.id,
                    whatYouWillLearn: whatYouWillLearn,
                    price,
                    thumbnail: thumbnailImage.secure_url,
                    category: categoryDetails._id,
                    tag:tags, // Yaha pe galti ho sakti hai
                    instructions,
                    status
                },
            )
        // Add new course to user schema
        // console.log("New Course Details -> ",newCourseDetails);
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

        console.log("Updated Instructor Details -> ",updatedInstructor)
        await Category.findByIdAndUpdate(
            {_id:categoryDetails._id},
            {
                $push: {
                    courses: newCourseDetails._id
                }
            },
            {new: true}
        )
        // console.log("Updated Category -> ",updatedCategory);
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

// TODO: Write a handler function for accessing course detail on the basis of courseId

const getCourseDetails = asycnHandler(async (req,res) => {
    try {
        const {courseId} = req.body;

        const courseDetails = await Course.find({_id:courseId})
                                           .populate({
                                            path: "instructor",
                                                populate:{
                                                    path:"additionalDetails",
                                                }
                                              }
                                           )
                                           .populate("category")
                                           .populate("ratingAndReviews")
                                           .populate({
                                            path: "courseContent",
                                            populate: {
                                                path: "subSection",
                                            }
                                           })
                                           .exec()
        
        if(!courseDetails) {
            throw new ApiErrors(404,`Could not find course with ${courseId}`)
        }

        return res
               .status(200)
               .json(new ApiResponse(
                     200,
                     courseDetails,
                     "Course content fetched successfully."
               ))
    } catch (error) {
        console.log("ERROR MESSAGE: ",error.message)
        throw new ApiErrors(500,"Something went wrong while fetching course details, please try again later.")
    }
})

export {
    createCourse,
    getAllCourses,
    getCourseDetails
}