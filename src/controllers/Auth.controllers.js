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
import { mailSender } from "../utils/mailSender.js";

const generateAccessAndRefreshTokens = async (userId) => {
    try {
        const user = await User.findById(userId)

        const accessToken = user.generateAccessToken()
 
        const refreshToken = user.generateRefreshToken()
  
        // Saving in the database
        User.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })

        return {accessToken,refreshToken}

    } catch (error) {
        console.log("ERROR MESSAGE: ",error.message)
        throw new ApiErrors(500, "Something went wrong while generating referesh and access token")
    }
}

const sendOTP = asycnHandler(async (req,res) => {
    try {
        const { email } = req.body
    
        if(!email) {
            throw new ApiErrors(400,"Please provide email")
        }
    
        const userExist = await User.findOne({email})

        // console.log("userExists: ",userExist)
        if(userExist) {
            throw new ApiErrors(401,"User already present")
        }
    
        let otp = otpGenerator.generate(6,{
            lowerCaseAlphabets: false,
            upperCaseAlphabets: false,
            specialChars: false
        })

        // console.log("Generated otp -> ",otp);
        const result = await OTP.findOne({otp:otp})

        // console.log("Checking if otp already present or not ",result);
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
        console.log("otpBody: ",otpBody)
    
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
            contactNumber = 0,
            otp,
        }              = req.body
    
        // Validate all the details
        if(!firstName || !lastName || !email || !password || !confirmPassword || !otp) {
            throw new ApiErrors(400,"Please fill all the required fields")
        }
    
        // Match the passwords
        if(password !== confirmPassword) {
            throw new ApiErrors(401,"Password do not matched")
        }
    
        // Check if user already exists or not
        const userExisted = await User.find({email})
        console.log("userExisted: ",userExisted)
        if(userExisted.length > 0) {
            throw new ApiErrors(402,"User already present please login")
        }
    
        // Find most recent otp saved in db
        console.log("Printing otp ",otp);
        const recentOtp = await OTP.find({email}).sort({createdAt:-1}).limit(1)
        console.log("Printing recent OTP: ",recentOtp[0].otp);
        if(recentOtp.length === 0) {
            throw new ApiErrors(401,"OTP not found")
        } else if(otp !== recentOtp[0].otp) {
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
        console.log("ERROR MESSAGE: ",error.message);
        throw new ApiErrors(500,"Something went wrong while Signing Up")
    }

})

const login = asycnHandler(async (req,res) => {
    try {
        const { email, password } = req.body
    
        if(!email || !password) {
            throw new ApiErrors(400,"All fields are required.")
        }
    
        const user = await User.findOne({email})

        // console.log("User -> ",user);
        if(!user) {
            throw new ApiErrors(404,"User is not registered")
        }

        console.log("Password -> ",password);
        console.log("Is Password valid -> ",isPasswordValid);
        if(!isPasswordValid) {
            throw new ApiErrors(401,"Invalid Password")
        }
    
        const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id)
    
        const loggedInUser = await User.findById(user._id).select("-password -refreshToken -confirmPassword")
    
        const options = {
            httpOnly: true,
            secure: false,
        }
    
        return res
               .status(200)
               .cookie("accessToken",accessToken,options)
               .cookie("refreshToken", refreshToken,options)
               .json(
                   new ApiResponse(
                      200,
                      {
                         user: loggedInUser, accessToken, refreshToken
                      },
                      "User logged in successfully"
                   )
               )
    } catch (error) {
        console.log("ERROR MESSAGE: ",error.message)
        throw new ApiErrors(500,"Something went wrong while loging in.")
    }
})

const changePassword = asycnHandler(async (req,res) => {
    try {
        const userId = req.user.id 
        const userDetails = User.findById({userId})
        const {oldPassword,newPassword,confirmPassword} = req.body

        if(!oldPassword || !newPassword || !confirmPassword) {
            throw new ApiErrors(400,"All fields are required, please fill all the required field.")
        }

        const matchedPassord = await bcrypt.compare(oldPassword,userDetails.password)
        if(!matchedPassord) {
            throw new ApiErrors(400,"Old password is incorrect.")
        }

        if(oldPassword === newPassword) {
            throw new ApiErrors(400,"New password should not be same as old password.")
        }

        if(newPassword !== confirmPassword) {
            throw new ApiErrors(400,"Password not matched.")
        }

        const hashedPassword = await bcrypt.hash(newPassword,10);
        const updatedUserDetails = await User.findByIdAndUpdate({userId}, {
                                                                password:hashedPassword
                                                            },{new:true})

        // Send verification mail
        // Isko Samjhna hai sahi se
        try {
            const emailResponse =  mailSender(
                updatedUserDetails.email,
                passwordUpdated(
                    updatedUserDetails.email,
                    `Password updated successfully for ${updatedUserDetails.firstName} ${updatedUserDetails.lastName}`
                )
            );
            console.log("Email sent successfully: ",emailResponse);
        } catch (error) {
            console.log("ERROR: ",error)
            throw new ApiErrors(500,"Something went wrong while sending email")
        }

        return res
               .status(200)
               .json(new ApiResponse(200,"Password changed successfully."))
    } catch (error) {
        console.log("ERROR: ",error)
        throw new ApiErrors(500,error.message,"Something went wrong while changing the password please try later.")
    }
})

export {
    sendOTP,
    signUp,
    login,
    changePassword
}