import { Section } from "../models/Section.model.js";
import { SubSection } from "../models/SubSection.model.js";
import { ApiErrors } from "../utils/ApiErrors.js";
import { ApiResponse } from "../utils/AppResponse.js";
import { asycnHandler } from "../utils/asynHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { Course } from "../models/Course.model.js"


const createSubSection = asycnHandler(async (req,res) => {
    try {
        const {title,description,sectionId} = req.body
        const video = req?.files?.video

        if(!title || !description || !video || !sectionId) {
            throw new ApiErrors(400,"All fields are required.")
        }

        const videoDetails = await uploadOnCloudinary(video)
        const videoSecureUrl = videoDetails.secure_url
        const timeDuration = videoDetails.duration

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

        return res
               .status(200)
               .json(new ApiResponse(200,updatedSection,"Created subsection successfully."))
    } catch (error) {
        console.log("ERROR MESSAGE: ",error.message)
        throw new ApiErrors(500,"Something went wrong while creating sub section. ")
    }
})

// TODO: Create Update Subsection
const updateSubSection = asycnHandler(async (req,res) => {
    try {
        const {title,description,subSectionId,sectionId} = req.body
        const subSection = await SubSection.findById(subSectionId)

        if(!subSection) {
            throw new ApiErrors(404,"SubSection not found")
        }

        if(title !== undefined) {
            subSection.title = title
        }
        if (description !== undefined) {
            subSection.description = description
        }
        if (req.files && req.files.video !== undefined) {
            const video = req.files.video
            const uploadDetails = await uploadImageToCloudinary(
              video,
              process.env.FOLDER_NAME
            )
            subSection.videoUrl = uploadDetails.secure_url
            subSection.timeDuration = `${uploadDetails.duration}`
        }
      
        await subSection.save()
        
        const updatedSection = await Section.findById(sectionId).populate("subSection")
        return res
               .status(200)
               .json(new ApiResponse(200,updatedSection,"Updated subSection successfully."))
    } catch (error) {
        console.log("ERROR MESSAGE: ",error.message)
        throw new ApiErrors(500,"Something went wrong while updating the sub section.")
    }
})
// TODO: Delete Subsection

const deleteSubSection = asycnHandler(async (req,res) => {
    try {
        const {subSectionId, sectionId} = req.body

        await SubSection.findByIdAndUpdate(
            { _id: sectionId},
            {
                $pull: {
                    subSection: subSectionId
                }
            }
        )

        await SubSection.findByIdAndDelete({_id: subSectionId})

        const updatedSection = await Section.findById(sectionId).populate("subSection")

        return res
               .status(200)
               .json(new ApiResponse(200,updatedSection,"Sub Section deleted successfully."))
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