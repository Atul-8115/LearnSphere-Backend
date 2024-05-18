import mongoose, {Schema} from "mongoose"
import { mailSender } from "../utils/mailSender.js"
import { ApiErrors } from "../utils/ApiErrors.js";
import {otpTemplate} from "../mail/templates/emailVerification.js"

const OTPSchema = new Schema({
    email: {
        type: String,
        required: true,
    },
    otp: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now(),
        expires: 5*60*60*60*1000,
    }
})

async function sendVerificationEmail(email, otp) {
    try {
        const mailResponse = await mailSender(email, "Verification Email from LearnSphere", otpTemplate(otp))
        // const some = otpTemplate(otp)
        console.log("Email sent Successfully: ", mailResponse);
    } catch (error) {
        throw new ApiErrors(500,error, "Error occurred while sending mail")
    }
}

OTPSchema.pre("save", async function(next) {
    await sendVerificationEmail(this.email, this.otp)
    next();
})

export const OTP = mongoose.model("OTP", OTPSchema)