import { Tag } from "../models/Tags.model.js";
import { ApiErrors } from "../utils/ApiErrors.js";
import { ApiResponse } from "../utils/AppResponse.js";
import { asycnHandler } from "../utils/asynHandler.js";

const createTag = asycnHandler(async (req,res) => {
    try {
        const {name, description} = req.body

        if(!name || !description) {
            throw new ApiErrors(400,"Tag name and description are required.")
        }

        const tagDetails = await Tag.create({
            name: name,
            description:description
        })

        console.log(tagDetails)

        return res
               .status(200)
               .json(new ApiResponse(200,tagDetails,"Tag created successfully."))
    } catch (error) {
        console.log("ERROR MESSAGE: ",error.message)
        throw new ApiResponse(500,"Something went wrong while creating tag. ")
    }
})

const getAllTags = asycnHandler(async (req,res) => {
    try {
        const allTags = await Tag.find({},{name: true, description: true})
        return res
               .status(200)
               .json(new ApiResponse(200,allTags,"Fetched all the tags successfully."))
    } catch (error) {
        console.log("ERROR MESSAGE: ",error.message)
        throw new ApiErrors(500,"Something went wrong while fetching the tags")
    }
})

export {
    createTag,
    getAllTags
}