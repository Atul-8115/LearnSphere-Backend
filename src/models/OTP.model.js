import mongoose, {Schema} from "mongoose"
import { mailSender } from "../utils/mailSender"
import { ApiErrors } from "../utils/ApiErrors";

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
        expires: 5*60,
    }
})

async function sendVerificationEmail(email, otp) {
    try {
        const mailResponse =  mailSender(email, "Verification Email from LearnSphere", otp)
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