import { CourseProgress } from "../models/CourseProgress.model.js";
import { SubSection } from "../models/SubSection.model.js";
import { ApiErrors } from "../utils/ApiErrors.js";
import { ApiResponse } from "../utils/AppResponse.js";
import { asycnHandler } from "../utils/asynHandler.js";


const updateCourseProgress = asycnHandler(async (req,res) => {
    const { courseId, subsectionId } = req.body
    const userId = req.user.id

    console.log("Printing subsection Id and courseId -> ",courseId,subsectionId)
    
    try {
        const subsection = await SubSection.findById(subsectionId)
        if(!subsection) {
            throw new ApiErrors(400,"Invalid subsection.")
        }

        let courseProgress = await CourseProgress.findOne({
            courseID: courseId,
            userId: userId,
        })
        let completedVideos = [];
        console.log("Printing course progress -> ",courseProgress)
        if(!courseProgress) {
            courseProgress = await CourseProgress.create({
                userId: userId,
                courseID: courseId,
                completedVideos
            })
        } else {
            if(courseProgress.completedVideos.includes(subsectionId)) {
                throw new ApiErrors(400,"Subsection already completed.")
            }
        }

        courseProgress.completedVideos.push(subsectionId)

        await courseProgress.save();

        return res
               .status(200)
               .json(new ApiResponse(200,"Course Progress Updated."))
    } catch (error) {
        console.log("ERROR MESSAGE: ",error.message)
        throw new ApiErrors(500,"Something went wrong while updating course progress.")
    }
})

const getProgressPercentage = asycnHandler(async (req, res) => {
    const  courseId  = req.body?._id
    // console.log("Printing courseId -> ",req.body?._id)
    const userId = req.user.id
  
    if (!courseId) {
      throw new ApiErrors(401,"Course is not present.")
    }
  
    try {
      // Find the course progress document for the user and course
      let courseProgress = await CourseProgress.findOne({
        courseID: courseId,
        userId: userId,
      })
        .populate({
          path: "courseID",
          populate: {
            path: "courseContent",
          },
        })
        .exec()
  
      if (!courseProgress) {
        throw new ApiErrors(401,"Could't find courseProgress by ids: ")
      }
      console.log("Printing courseProgress and courseId -> ",courseProgress, userId)
      let lectures = 0
      courseProgress.courseID.courseContent?.forEach((sec) => {
        lectures += sec.subSection.length || 0
      })
  
      let progressPercentage =
        (courseProgress.completedVideos.length / lectures) * 100
  
      // To make it up to 2 decimal point
      const multiplier = Math.pow(10, 2)
      progressPercentage =
        Math.round(progressPercentage * multiplier) / multiplier
  
      return res
             .status(200)
             .json(new ApiResponse(200,progressPercentage,"Progress percentage fetched successfully."))
    } catch (error) {
      console.log("ERROR MESSAGE: ",error.message)
      throw new ApiErrors(500,"Something went wrong while fetching course progress percentage.")
    }
})

export {
    updateCourseProgress,
    getProgressPercentage
}