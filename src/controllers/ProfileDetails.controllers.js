import { ApiErrors } from "../utils/ApiErrors.js";
import { asycnHandler } from "../utils/asynHandler.js";
import { User } from "../models/User.model.js"
import { Profile } from "../models/Profile.model.js";
import { ApiResponse } from "../utils/AppResponse.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";


const updateProfileDetails = asycnHandler(async (req,res) => {
    try {
        const {gender,dateOfBirth="",about="",contactNumber} = req.body
        const userId = req.user._id
        if(!gender || !contactNumber) {
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
        const finalUserDetails = await User.findById(userId).populate("additionalDetails")
        // const finalUserDetails = userDetails.populate("addtionalDetails")
        // console.log("Printing user details -> ",finalUserDetails)
        return res
               .status(200)
               .json(new ApiResponse(200,finalUserDetails,"Profile updated successfully."))
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
                                                       .select('-password -refreshToken -confirmPassword')
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
const updateDisplayPicture = asycnHandler(async (req,res) => {
    try {
        const profilePic = req.files?.displayPicture;
        console.log("req.files -> ",req.files," "," req.file -> ",req.file);
        console.log(`Profile picture is ${profilePic}`,profilePic);
        if(!profilePic) {
            throw new ApiErrors(400,"Please upload profile pic.")
        }

        const userId = req.user._id
        console.log(`Existing user's id is: ${userId} `);
        const uploadedPic = await uploadOnCloudinary(profilePic)
        if(!uploadedPic) {
            throw new ApiErrors(500,"Something went wrong while updating profile pic.")
        }

        const updatedUser = await User.findByIdAndUpdate(
                                         {_id:userId},
                                         {image:uploadedPic.secure_url},
                                         {new:true})

        return res
               .status(200)
               .json(new ApiResponse(200,updatedUser,"User's display picture updated successfully."))                                 
    } catch (error) {
        console.log("ERROR MESSAGE: ",error.message)
        throw new ApiErrors(500,"Something went wrong while updating display picture.")
    }
})

export {
    updateProfileDetails,
    deleteAccount,
    getAllUserDetails,
    updateDisplayPicture
}