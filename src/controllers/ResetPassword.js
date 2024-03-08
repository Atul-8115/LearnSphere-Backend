import { User } from "../models/User.model.js";
import { ApiErrors } from "../utils/ApiErrors";
import { ApiResponse } from "../utils/AppResponse";
import { asycnHandler } from "../utils/asynHandler.js";
import { mailSender } from "../utils/mailSender.js";


const resetPasswordToken = asycnHandler(async (req,res) => {
    try {
        const {email} = req.body

        const user = await User.findOne({email})
        if(!user) {
            throw new ApiErrors(401,"User is not registered with us, Kindly register")
        }

        const token = crypto.randomUUID()

        const updatedUser = await User.findOneAndUpdate(
                 {
                    email
                 },
                 {
                    token: token,
                    resetPasswordExpires: Date.now + 5*60*1000
                 },
                 {
                    new: true
                 }
            )

        const url = `http://localhost:3000/update-password/${token}`
        mailSender(email,"Password reset link",`Password reset link: ${url}`)

        return res
               .status(200)
               .json(new ApiResponse(200,"Mail sent successfully, please check mail and change passwrod "))
    } catch (error) {
        console.log("ERROR MESSAGE: ",error.message)
        throw new ApiErrors(500,"Something went wrong while sending mail")
    }
})

export {
    resetPasswordToken,
}