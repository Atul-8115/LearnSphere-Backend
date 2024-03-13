import { Course } from "../models/Course.model.js";
import { Section } from "../models/Section.model.js";
import { ApiErrors } from "../utils/ApiErrors.js";
import { ApiResponse } from "../utils/AppResponse.js";
import { asycnHandler } from "../utils/asynHandler.js";


const createSection = asycnHandler(async (req,res) => {
    try {
        const {sectionName,courseId} = req.body
        if(!sectionName || !courseId) {
            throw new ApiErrors(400,"All fields are required. ")
        }

        const newSection = await Section.create({
            sectionName:sectionName
        },
        {
            new: true,
        })
        const updatedCourseDetails = await Course.findByIdAndDelete({courseId},
            {
                $push: {
                    courseContent: newSection._id
                }
            })
            .populate(
                {
                    path:'courseContent',
                    populate: {
                        path:'subSection'
                    }
                }
            )
            .exec()
        
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
        const {sectionName, sectionId} = req.body
        if(!sectionName || sectionId) {
            throw new ApiErrors(400,"All feilds are required.")
        }

        const updatedSection = await Section.findByIdAndUpdate({sectionId},{sectionName},{new:true})

        return res
               .status(200)
               .json(new ApiResponse(200,updatedSection,"Section updated successfully."))
    } catch (error) {
        console.log("ERROR MESSAGE: ",error.message)
        throw new ApiErrors(500,"Something went wrong while updating the section please try again. ")
    }
})

const deleteSection = asycnHandler(async (req,res) => {
    try {
        const {sectionId} = req.params;
        if(!sectionId) {
            throw new ApiErrors(400,"Please provide section id")
        }
        await Section.findByIdAndDelete({sectionId})

        return res
               .status(200)
               .json(new ApiErrors(200,"Section deleted successfully. "))        
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