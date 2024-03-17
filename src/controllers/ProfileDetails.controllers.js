import { ApiErrors } from "../utils/ApiErrors.js";
import { asycnHandler } from "../utils/asynHandler.js";
import { User } from "../models/User.model.js"
import { Profile } from "../models/Profile.model.js";
import { ApiResponse } from "../utils/AppResponse.js";


const updateProfileDetails = asycnHandler(async (req,res) => {
    try {
        const {gender,dateOfBirth="",about="",contactNumber} = req.body
        const userId = req.user.id
        if(!gender || !contactNumber || !userId) {
            throw new ApiErrors(400,"Please fill all the required details.")
        }
        const userDetails = await User.findById(userId)
        const profileId = userDetails.additionalDetails
        const profileDetails = await Profile.findById(profileId)

        profileDetails.gender = gender
        profileDetails.dateOfBirth = dateOfBirth
        profileDetails.about = about
        profileDetails.contactNumber = contactNumber

        await profileDetails.save()

        return req
               .status(200)
               .json(new ApiResponse(200,profileDetails,"Profile updated successfully."))
    } catch (error) {
        console.log("ERROR MESSAGE: ", error.message)
        throw new ApiErrors(500,"Something went wrong while updating profile details")
    }
})

// deletion
// Explore -> How we can schedule deletion process (Crone Job)

const deleteAccount = asycnHandler(async (req,res) => {
    try {

        // TODO: Find More on Job Schedule
		// const job = schedule.scheduleJob("10 * * * * *", function () {
		// 	console.log("The answer to life, the universe, and everything!");
		// });
		// console.log(job);
        const userId = req.user.id

        const userDetails = await User.findById(userId)

        await Profile.findByIdAndDelete({_id:userDetails.additionalDetails._id})
        // TODO: Unenroll User From All the Enrolled Courses
		// Now Delete User
        await User.findByIdAndDelete({_id:userId})

        return res
               .status(200)
               .json(new ApiResponse(200,"User's account deleted successfully."))
    } catch (error) {
        console.log("ERROR MESSAGE: ", error.message)
        throw new ApiErrors(500,"Something went wrong while deleting user's account details, please try again")
    }
})

const getAllUserDetails = asycnHandler(async(req,res) => {
    try {
        const userId = req.user._id
        const userDetails = await User.findById(userId)
                                                       .populate("additionalDetails")
                                                       .exec();

        return res
               .status(200)
               .json(new ApiResponse(200,userDetails,"User details fetched successfully."))
    } catch (error) {
        console.log("ERROR MESSAGE: ",error.message)
        throw new ApiErrors(500,"Something went wrong while fetching user details.")
    }
})

//TODO: updateDisplayPicture

export {
    updateProfileDetails,
    deleteAccount,
    getAllUserDetails
}