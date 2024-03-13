import { Section } from "../models/Section.model.js";
import { SubSection } from "../models/SubSection.model.js";
import { ApiErrors } from "../utils/ApiErrors.js";
import { ApiResponse } from "../utils/AppResponse.js";
import { asycnHandler } from "../utils/asynHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";


const createSubSection = asycnHandler(async (req,res) => {
    try {
        const {title,description,sectionId} = req.body
        const video = req.file?.videoFile
        if(!title || !description || !video || !sectionId) {
            throw new ApiErrors(400,"All fields are required.")
        }

        const videoDetails = await uploadOnCloudinary(video)
        const videoSecureUrl = videoDetails.secure_url
        const timeDuration = videoDetails.timeDuration()

        const newSubSection = await SubSection.create({
            title: title,
            description:description,
            timeDuration:timeDuration,
            videoUrl:videoSecureUrl
        })

        const updatedSection = await Section.findByIdAndUpdate({sectionId},{
            $push: {
                subSection: newSubSection._id
            }
        },
        {new:true})
        .populate('subSection')
        .exec()

        console.log(updatedSection);
        return res
               .status(200)
               .json(new ApiResponse(200,updatedSection,"Created subsection successfully."))
    } catch (error) {
        console.log("ERROR MESSAGE: ",error.message)
        throw new ApiErrors(500,"Something went wrong while creating sub section. ")
    }
})

// TODO: Create Update Subsection
// TODO: Delete Subsection
export {
    createSubSection,
}