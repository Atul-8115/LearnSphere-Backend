import jwt from "jsonwebtoken"
import { asycnHandler } from "../utils/asynHandler.js"
import { ApiErrors } from "../utils/ApiErrors.js"


const auth = asycnHandler(async (req,_,next) => {
    try {
        const token = req.cookies.token 
                      || req.body.token
                      || req.header("Authorisation").replace("Bearer "," ")
        
        if(!token) {
            throw new ApiErrors(401,"Token is missing")
        }

        try {
            const decode = jwt.verify(token,process.env.JWT_SECRET)
            console.log(decode)
            req.user = decode
        } catch (error) {
            throw new ApiErrors(401,"token is invalid")
        }
        next()
    } catch (error) {
        console.log("ERROR MESSAGE: ",error.message);
        throw new ApiErrors(501,"Something went wrong while verifying token")
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