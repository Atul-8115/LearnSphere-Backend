import { Course } from "../models/Course.model.js";
import { Section } from "../models/Section.model.js";
import { ApiErrors } from "../utils/ApiErrors.js";
import { ApiResponse } from "../utils/AppResponse.js";
import { asycnHandler } from "../utils/asynHandler.js";
import { SubSection } from "../models/SubSection.model.js"

const createSection = asycnHandler(async (req,res) => {
    try {
        const {sectionName,courseId} = req.body
        console.log("Printing sectionName -> ",sectionName," ",courseId)
        if(!sectionName || !courseId) {
            throw new ApiErrors(400,"All fields are required. ")
        }

        const newSection = await Section.create({
            sectionName:sectionName
        })

        console.log("Printing section -> ",newSection)
        const updatedCourseDetails = await Course.findByIdAndUpdate(
            courseId,
            {
                $push: {
                    courseContent: newSection._id
                }
            },
            { new : true }
        )
            .populate(
                {
                    path:'courseContent',
                    populate: {
                        path:'subSection'
                    }
                }
            )
            .exec()
        
        console.log("Printing course section -> ",updatedCourseDetails)
        return res
               .status(200)
               .json(new ApiResponse(200,updatedCourseDetails,"Section created successfully."))
    } catch (error) {
        console.log("ERROR MESSAGE: ",error.message)
        throw new ApiErrors(500,"Something went wrong while creating new section please try again. ")
    }
})

const updateSection = asycnHandler(async (req,res) => {
    try {
        const {sectionName, sectionId, courseId} = req.body
        console.log("Printing sectionId and courseId",sectionId, courseId, sectionName)
        if(!sectionName || !sectionId || !courseId) {
            throw new ApiErrors(400,"All feilds are required.")
        }

        const updatedSection = await Section.findByIdAndUpdate(sectionId,{sectionName},{new:true})

        const course = await Course.findById(courseId)
                                    .populate({
                                        path:"courseContent",
                                        populate: {
                                            path:"subSection"
                                        }
                                    })
                                     .exec()
        return res
               .status(200)
               .json(new ApiResponse(200,course,"Section updated successfully."))
    } catch (error) {
        console.log("ERROR MESSAGE: ",error.message)
        throw new ApiErrors(500,"Something went wrong while updating the section please try again. ")
    }
})

const deleteSection = asycnHandler(async (req,res) => {
    try {
        const { sectionId, courseId } = req.body;
        console.log("Printing sectionId and courseId",sectionId, courseId)
        if(!sectionId || !courseId) {
            throw new ApiErrors(400,"All fields are required.")
        }

        await Course.findByIdAndUpdate(courseId, {
            $pull: {
                courseContent: sectionId
            }
        })

        const section = await Section.findById(sectionId)

        if(!section) {
            throw new ApiErrors(403, "Section not found")
        }

        // Delete Sub Section
        await SubSection.deleteMany({_id: {$in: section.subSection}})

        await Section.findByIdAndDelete(sectionId)

        const course = await Course.findById(courseId).populate({
            path: "courseContent",
            populate: {
                path: "subSection"
            }
        }).exec()

        console.log("Printing course -> ",course)
        return res
               .status(200)
               .json(new ApiResponse(200,course,"Section deleted successfully. "))        
    } catch (error) {
        console.log("ERROR MESSAGE: ",error.message)
        throw new ApiErrors(500,"Something went wrong while deleting the section please try again. ")
    }
})

export {
    createSection,
    updateSection,
    deleteSection
}