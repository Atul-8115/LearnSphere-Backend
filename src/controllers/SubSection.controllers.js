import { Section } from "../models/Section.model.js";
import { SubSection } from "../models/SubSection.model.js";
import { ApiErrors } from "../utils/ApiErrors.js";
import { ApiResponse } from "../utils/AppResponse.js";
import { asycnHandler } from "../utils/asynHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { Course } from "../models/Course.model.js"


const createSubSection = asycnHandler(async (req,res) => {
    try {
        const {title,description,sectionId, courseId} = req.body
        // console.log(title," ",description," ",sectionId," ");
        console.log("Printing req.body -> ",req.body)
        const video = req?.files?.video
        console.log("Printing video file -> ",req?.files?.video)
        if(!title || !description || !video || !sectionId) {
            throw new ApiErrors(400,"All fields are required.")
        }

        const videoDetails = await uploadOnCloudinary(video)
        const videoSecureUrl = videoDetails.secure_url
        const timeDuration = videoDetails.duration
        console.log("Printing video details -> ",videoDetails)
        console.log("Time Duration of video -> ",timeDuration)
        const newSubSection = await SubSection.create({
            title: title,
            description:description,
            timeDuration:timeDuration,
            videoUrl:videoSecureUrl
        })

        const updatedSection = await Section.findByIdAndUpdate(sectionId,{
            $push: {
                subSection: newSubSection._id
            }
        },
        {new:true})
        .populate('subSection')

        const updateCourse = await Course.findById(courseId).populate(
            {
                path:'courseContent',
                    populate: {
                        path:'subSection'
                }
            }
        ).exec();
        console.log(updatedSection);
        return res
               .status(200)
               .json(new ApiResponse(200,updateCourse,"Created subsection successfully."))
    } catch (error) {
        console.log("ERROR MESSAGE: ",error.message)
        throw new ApiErrors(500,"Something went wrong while creating sub section. ")
    }
})

// TODO: Create Update Subsection
const updateSubSection = asycnHandler(async (req,res) => {
    try {
        const {title,description,subSectionId} = req.body

        const updatedSubSection = await SubSection.findByIdAndUpdate(
                                                       {subSectionId},
                                                       {
                                                          title,
                                                          description
                                                       },
                                                       {
                                                          new:true
                                                       }
                                                    )
        return res
               .status(200)
               .json(new ApiResponse(200,updatedSubSection,"Updated subSection successfully."))
    } catch (error) {
        console.log("ERROR MESSAGE: ",error.message)
        throw new ApiErrors(500,"Something went wrong while updating the sub section.")
    }
})
// TODO: Delete Subsection

const deleteSubSection = asycnHandler(async (req,res) => {
    try {
        const {subSectionId} = req.body

        await SubSection.findByIdAndDelete({subSectionId})

        return res
               .status(200)
               .json(new ApiErrors(200,"Sub Section deleted successfully."))
    } catch (error) {
        console.log("ERROR MESSAGE: ",error.message)
        throw new ApiErrors(200,"Something went wrong while deleting sub section")
    }
})
export {
    createSubSection,
    updateSubSection,
    deleteSubSection
}