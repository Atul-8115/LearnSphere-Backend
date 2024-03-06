// Utilities
import { ApiErrors } from "../utils/ApiErrors.js";
import { asycnHandler } from "../utils/asynHandler.js"
import { ApiResponse } from "../utils/AppResponse.js";
// Models
import { User } from "../models/User.model.js"
import { OTP } from "../models/OTP.model.js";
import { Profile } from "../models/Profile.model.js"
// Libraries
import otpGenerator from "otp-generator"
import bcrypt from "bcrypt"


const sendOTP = asycnHandler(async (req,res) => {
    try {
        const { email } = req.body
    
        if(!email) {
            throw new ApiErrors(400,"Please provide email")
        }
    
        const userExist = await User.findOne(email)
    
        if(!userExist) {
            throw new ApiErrors(401,"User already present")
        }
    
        let otp = otpGenerator.generate(6,{
            lowerCaseAlphabets: false,
            upperCaseAlphabets: false,
            specialChars: false
        })
    
        var result = await OTP.findOne({otp:otp})
    
        while(result) {
            otp = otpGenerator.generate(6,{
                lowerCaseAlphabets: false,
                upperCaseAlphabets: false,
                specialChars: false
            })
          result = await OTP.findOne({otp:otp})
        }
    
        const otpPayload = {email,otp}
    
        const otpBody = await OTP.create(otpPayload)
        console.log(otpBody)
    
        if(!otpBody) {
            throw new ApiErrors(500,"Failed to generate otp")
        }
    
        return res
               .status(200)
               .json(new ApiResponse(200,otpBody,"Otp generated successfully"))
    } catch (error) {
        console.log("ERROR While Generating OTP: ",error.message);
        throw new ApiErrors(501,"Something went wrong")
    }
})

const signUp = asycnHandler(async (req,res) => {

    try {
        //Fetch all the details
        const {
            firstName,
            lastName,
            email,
            password,
            confirmPassword,
            accountType,
            contactNumber,
            otp,
        }              = req.body
    
        // Validate all the details
        if(!firstName || !lastName || !email || !password || !confirmPassword || !contactNumber || !otp) {
            throw new ApiErrors(400,"Please fill all the required fields")
        }
    
        // Match the passwords
        if(password !== confirmPassword) {
            throw new ApiErrors(401,"Password do not matched")
        }
    
        // Check if user already exists or not
        const userExisted = await User.find({email})
        if(userExisted) {
            throw new ApiErrors(402,"User already present please login")
        }
    
        // Find most recent otp saved in db
        const recentOtp = await OTP.find({email}).sort({createdAt:-1}).limit(1)
        console.log("Printing recent OTP: ",recentOtp);
        if(recentOtp.length === 0) {
            throw new ApiErrors(401,"OTP not found")
        } else if(otp !== recentOtp.otp) {
            throw new ApiErrors(401,"OTP not matched")
        }
    
        // Hash the password
        const hashedPassword = await bcrypt.hash(password,10)
    
        // Create entry in db
        const additionalDetails = await Profile.create({
            gender: null,
            dateOfBirth: null,
            about: null,
            contactNumber
        })
        const user = await User.create({
            firstName,
            lastName,
            email,
            password: hashedPassword,
            confirmPassword: hashedPassword,
            accountType,
            contactNumber,
            additionalDetails: additionalDetails._id,
            image: `https://api.dicebear.com/5.x/initials/svg?seed=${firstName} ${lastName}`
        })
    
        if(!user) {
            throw new ApiErrors(500,"Error Occurred while registering")
        }
    
        return res
               .status(200)
               .json(new ApiResponse(200,user,"User registered successfully"))
    } catch (error) {
        console.log("ERROR While Signing Up: ",error.message);
        throw new ApiErrors(500,"Something went wrong while Signing Up")
    }

})

export {
    sendOTP,
    signUp
}