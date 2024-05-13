import jwt from "jsonwebtoken"
import { asycnHandler } from "../utils/asynHandler.js"
import { ApiErrors } from "../utils/ApiErrors.js"
import { User } from "../models/User.model.js"


const auth = asycnHandler(async (req,_,next) => {
        try {
            const token = req.cookies?.refreshToken 
                          || req.body?.refreshToken
                          || req.header("Authorisation")?.replace("Bearer ","")
            
            console.log("Here I'm checking token -> ",token)
            if(!token) {
                throw new ApiErrors(401,"Token is missing")
            }
    
            // console.log("Token -> ",token," ",process.env.JWT_SECRET);
    
            const decodedToken = jwt.verify(token,process.env.REFRESH_TOKEN_SECRET)
            // console.log("decode -> id",decode._id," ",decode)
            const user = await User.findById(decodedToken._id);
            console.log("Printing user -> ", user)
            if(!user) {
                    throw new ApiErrors(401,"Invalid Access Token")
            }
            req.user = user
            // console.log("I'm here in auth's controller: ",req.user);
            next() 
        } catch (error) {
            console.log("ERROR MESSAGE: ",error.message)
            throw new ApiErrors(401, error?.message || "Invalid access token")
        }
})

const isStudent = asycnHandler(async (req,_,next) => {
    try {
        if(req.user.accountType !== "Student") {
            throw new ApiErrors(401,"This is a protected route for Student only")
        }
        next();
    } catch (error) {
        console.log("ERROR MESSAGE: ",error.message)
        throw new ApiErrors(500,"Something went wrong while verifying Student")
    }
})
const isInstructor = asycnHandler(async (req,_,next) => {
    try {
        if(req.user.accountType !== "Instructor") {
            throw new ApiErrors(401,"This is a protected route for Instructor only")
        }
        next();
    } catch (error) {
        console.log("ERROR MESSAGE: ",error.message)
        throw new ApiErrors(500,"Something went wrong while verifying Instructor")
    }
})

const isAdmin = asycnHandler(async (req,_,next) => {
    try {
        if(req.user.accountType !== "Admin") {
            throw new ApiErrors(401,"This is a protected route for Admin only")
        }
        next();
    } catch (error) {
        console.log("ERROR MESSAGE: ",error.message)
        throw new ApiErrors(500,"Something went wrong while verifying Admin")
    }
})

export {
    auth,
    isStudent,
    isInstructor,
    isAdmin
}