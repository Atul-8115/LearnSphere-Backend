import { User } from "../models/User.model.js";
import { ApiErrors } from "../utils/ApiErrors.js";
import { ApiResponse } from "../utils/AppResponse.js";
import { asycnHandler } from "../utils/asynHandler.js";
import { mailSender } from "../utils/mailSender.js";
import bcrypt from "bcrypt"
import crypto from "crypto"


const resetPasswordToken = asycnHandler(async (req,res) => {
    try {
        const {email} = req.body

        const user = await User.findOne({email})
        if(!user) {
            throw new ApiErrors(401,"User is not registered with us, Kindly register.")
        }

        const token = crypto.randomUUID()

        const updatedUser = await User.findOneAndUpdate(
                 {
                    email
                 },
                 {
                    token: token,
                    resetPasswordExpires: Date.now() + 5*60*1000
                 },
                 {
                    new: true
                 }
            )

        const url = `http://localhost:3000/update-password/${token}`
        const mailSent = await mailSender(email,"Password reset link",`Password reset link: ${url}`)

        // console.log("mail Sent ",mailSent);
        return res
               .status(200)
               .json(new ApiResponse(200,"Mail sent successfully, please check mail and change passwrod."))
    } catch (error) {
        console.log("ERROR MESSAGE: ",error.message)
        throw new ApiErrors(500,"Something went wrong while sending mail.")
    }
})

const resetPassword = asycnHandler(async (req,res) => {
    try {
        const {password, confirmPassword, token} = req.body
        if(!password || !confirmPassword || !token) {
            throw new ApiErrors(400,"Please fill all the required fields.")
        }

        if(password !== confirmPassword) {
            throw new ApiErrors(401,"Password not matched.")
        }

        const userDetails = await User.findOne({token: token})
        if(!userDetails) {
            throw new ApiErrors(402,"Provided token is not a valid token.")
        }

        if(token.resetPasswordExpires < Date.now()) {
            throw new ApiErrors(400,"Token has been expired")
        }

        const hashedPassword = await bcrypt.hash(password,10)

        const updatedUser = await User.findOneAndUpdate(
            {
                token:token
            },
            {
                password: hashedPassword,
                confirmPassword: hashedPassword
            },
            {
                new: true
            }
        )

        return res
               .status(200)
               .json(new ApiResponse(200, updatedUser, "Password reset successfully."))

    } catch (error) {
        console.log("ERROR MESSAGE: ",error.message)
        throw new ApiErrors(501,"Something went wrong while reseting the password, please try again later.")
    }
})

export {
    resetPasswordToken,
    resetPassword
}