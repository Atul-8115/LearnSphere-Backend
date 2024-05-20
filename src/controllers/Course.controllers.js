import { User } from "../models/User.model.js";
import { ApiErrors } from "../utils/ApiErrors.js";
import { asycnHandler } from "../utils/asynHandler.js";
import { Category } from "../models/Category.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { Course } from "../models/Course.model.js"
import { ApiResponse } from "../utils/AppResponse.js";
import { convertSecondsToDuration } from "../utils/secToDuration.js"
import { CourseProgress } from "../models/CourseProgress.model.js";
import { Section } from "../models/Section.model.js"
import { SubSection } from "../models/SubSection.model.js"

const createCourse = asycnHandler(async (req,res) => {
    try {
        let {
            courseName, 
            courseDescription, 
            whatYouWillLearn, 
            price,
            category, 
            tag: _tag,
            status,
			instructions: _instructions
        } = req.body

        const thumbnail = req.files?.thumbnailImage
        // const userId = req.user._id

        // Convert the tag and instructions from stringified Array to Array

        const tag = JSON.parse(_tag)
        const instructions = JSON.parse(_instructions)

        console.log("tag", tag)
        console.log("instructions -> ",instructions)

        // console.log(courseName, courseDescription, whatYouWillLearn, price, category, thumbnail)
        
        if(!courseName || !courseDescription || !whatYouWillLearn || !price || !category || !tag.length || !instructions.length || !thumbnail) {
            throw new ApiErrors(400,"All fiels are required. ")
        }

        if(!status || status === undefined) {
            status = "Draft"
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
        console.log("thumbnailImage : ",thumbnailImage);
        if(!thumbnailImage) {
            throw new ApiErrors(500,"Unable to upload thumbnail")
        }
        // console.log("Id of instructor ",instructorDetails.id);

        const newCourseDetails = await Course.create({
                    courseName,
                    courseDescription,
                    instructor: instructorDetails._id,
                    whatYouWillLearn: whatYouWillLearn,
                    price,
                    thumbnail: thumbnailImage.secure_url,
                    category: categoryDetails._id,
                    tag:tag, 
                    instructions,
                    status
                },
            )


        // Add new course to user schema
        console.log("New Course Details -> ",newCourseDetails);
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

        // console.log("Updated Instructor Details -> ",updatedInstructor)
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

const editCourse = asycnHandler(async (req,res) => {
    try {
        const { courseId } = req.body
        const updates = req.body
        const course = await Course.findById(courseId)

        if(!course) {
            throw new ApiErrors(400, "Course is not found")
        }

        if(req.files) {
            console.log("thumbnail update")
            const thumbnail = req.files?.thumbnailImage
            const thumbnailImage = await uploadOnCloudinary(thumbnail)
            course.thumbnail = thumbnailImage.secure_url
        }

        //Update only the fields that are present in the request body
        for (const key in updates) {
            if (updates.hasOwnProperty(key)) {
              if (key === "tag" || key === "instructions") {
                course[key] = JSON.parse(updates[key])
              } else {
                course[key] = updates[key]
              }
            }
        }

        await course.save()

        const updatedCourse = await Course.findOne({
            _id: courseId
        })
          .populate({
            path: "instructor",
            populate: {
                path: "additionalDetails",
            }
          })
          .populate("category")
          .populate("ratingAndReviews")
          .populate({
            path: "courseContent",
            populate: {
                path: "subSection",
            }
          })
            .exec();

        return res
               .status(200)
               .json(new ApiResponse(201, updatedCourse, "Course updated successfully"))
    } catch (error) {
        console.log("ERROR MESSAGE: ",error.message)
        throw new ApiErrors(500, "Something went wrong while updating course")
    }
})

const getAllCourses = asycnHandler(async (req,res) => {
    try {
        const allCourses = await Course.find({ status: "Published"},{
                                                  courseName: true,
                                                  ratingAndReviews: true,
                                                  instructor:true,
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
        // console.log("Printing courseId -> ",courseId)
        const courseDetails = await Course.find({_id:courseId})
                                           .populate({
                                            path: "instructor",
                                                populate:{
                                                    path:"additionalDetails",
                                                }
                                              })
                                           .populate("category")
                                           .populate("ratingAndReviews")
                                           .populate({
                                              path: "courseContent",
                                              populate: {
                                                 path: "subSection",
                                              }
                                           })
                                           .exec();
        
        if(!courseDetails) {
            throw new ApiErrors(404,`Could not find course with ${courseId}`)
        }

        // console.log("Printing course Details courseContent -> ",courseDetails[0])

        let totalDurationInSeconds = 0
        courseDetails[0].courseContent.forEach((content) => {
            content.subSection.forEach((subSect) => {
                const timeDurationInSeconds = parseInt(subSect.timeDuration)
                totalDurationInSeconds += timeDurationInSeconds
            })
        })

        const totalDuration = convertSecondsToDuration(totalDurationInSeconds)
        console.log("Printing time duration -> ",totalDuration)
        return res
               .status(200)
               .json(new ApiResponse(
                     200,
                     {courseDetails,totalDuration},
                     "Course content fetched successfully."
               ))
    } catch (error) {
        console.log("ERROR MESSAGE: ",error.message)
        throw new ApiErrors(500,"Something went wrong while fetching course details, please try again later.")
    }
})

const getFullCourseDetails = asycnHandler(async (req,res) => {
    try {
        const { courseId } = req.body
        const userId = req.user.id
        const courseDetails = await Course.findOne({
            _id: courseId,
        })
        .populate({
            path: "instructor",
            populate: {
            path: "additionalDetails",
            },
        })
        .populate("category")
        .populate("ratingAndReviews")
        .populate({
            path: "courseContent",
            populate: {
            path: "subSection",
            },
        })
        .exec()

        let courseProgressCount = await CourseProgress.findOne({
            courseID: courseId,
            userId: userId,
        })

        console.log("courseProgressCount : ", courseProgressCount)

        if(!courseDetails) {
            throw new ApiErrors(400, `Could not find course with id: ${courseId}`)
        }

        let totalDurationInSeconds = 0
        courseDetails.courseContent.forEach((content) => {
            content.subSection.forEach((subSection) => {
               const timeDurationInSeconds = parseInt(subSection.timeDuration)
               totalDurationInSeconds += timeDurationInSeconds
           })
        })

        const totalDuration = convertSecondsToDuration(totalDurationInSeconds)

        return res
               .status(200)
               .json(new ApiResponse(200,{
                   courseDetails,
                   totalDuration,
                   completedVideos: courseProgressCount?.completedVideos
                      ? courseProgressCount?.completedVideos
                      : []
               },
            "Fetched all course details successfully"))
    } catch (error) {
        console.log("ERROR MESSAGE: ",error.message)
        throw new ApiErrors(500,"Something went wrong while fetching all course details")
    }
})

const getInstructorCourses = asycnHandler( async (req,res) => {
    try {
        // Get the instructor ID from the authenticated user or request body
        const instructorId = req.user.id

        // Find all courses belonging to the instructor
        const instructorCourses = await Course.find({
        instructor: instructorId,
        }).sort({ createdAt: -1 })

        // Return the instructor's courses
        return res
               .status(200)
               .json(new ApiResponse(200,instructorCourses,"Instructor courses fetched successfully."))
    } catch (error) {
        console.log("ERROR MESSAGE: ",error.message)
        throw new ApiErrors(500,"Something went wrong while fetching instructor courses")
    }
})

// Delete the course
const deleteCourse = asycnHandler(async (req,res) => {
    try {
        const { courseId } = req.body

    // Find the course
        const course = await Course.findById(courseId)
        if (!course) {
            throw new ApiErrors(400,"Course not found")
        }

        // Unenroll students from the course
        const studentsEnrolled = course.studentsEnrolled
        for (const studentId of studentsEnrolled) {
            await User.findByIdAndUpdate(studentId, {
                $pull: { courses: courseId },
            })
        }

        // Delete sections and sub-sections
        const courseSections = course.courseContent
        for (const sectionId of courseSections) {
             // Delete sub-sections of the section
            const section = await Section.findById(sectionId)
            if (section) {
                const subSections = section.subSection
                for (const subSectionId of subSections) {
                     await SubSection.findByIdAndDelete(subSectionId)
                }
            }

            // Delete the section
            await Section.findByIdAndDelete(sectionId)
        }

        // Delete the course
        await Course.findByIdAndDelete(courseId)

        return res
                .status(200)
                .json(new ApiResponse(200,"Course deleted successfully"))
    } catch (error) {
        console.log("ERROR MESSAGE: ",error.message)
        throw new ApiErrors(500,"Something went wrong while deleting course.")
    }
})
export {
    createCourse,
    getAllCourses,
    getCourseDetails,
    editCourse,
    getFullCourseDetails,
    getInstructorCourses,
    deleteCourse
}