import mongoose from "mongoose";
import { Course } from "../models/Course.model.js";
import { ApiErrors } from "../utils/ApiErrors.js";
import { asycnHandler } from "../utils/asynHandler.js";
import { instance } from "../config/razorpay.js";
import { ApiResponse } from "../utils/AppResponse.js";
import { User } from "../models/User.model.js";
import { mailSender } from "../utils/mailSender.js";


const capturePayment = asycnHandler(async (req,res) => {
    try {
        const {courseId} = req.body
        const userId = req.user.id 

        if(!courseId) {
            throw new ApiErrors(400,"Please please provide valid courseId.")
        }

        const courseDetails = await Course.findById(courseId)
        if(!courseDetails) {
            throw new ApiErrors(400,"Course couldn't found. ")
        }

        const uid = new mongoose.Schema.Types.ObjectId(userId)

        if(courseDetails.studentsEnrolled.includes(uid)) {
            throw new ApiErrors(400,"User purchased course already.")
        }

        const amount = courseDetails.price
        const currency = "INR"

        const options = {
            amount: amount*100,
            currency,
            receipt: Math.random(Date.now()).toString(),
            notes: {
                courseId: courseId,
                userId
            }
        }
        try {
            const paymentResponse = await instance.orders.create(options)
            console.log(paymentResponse)

            return res
                   .status(200)
                   .json(
                    new ApiResponse(
                        200,
                        courseDetails.courseName,
                        courseDetails.courseDescription,
                        courseDetails.thumbnail,
                        paymentResponse.id,
                        paymentResponse.currency,
                        paymentResponse.amount,
                        "Payment created successfully."
                    )
                   )
        } catch (error) {
            console.log("ERROR MESSAGE: ",error.message)
            throw new ApiErrors(500,"Something went wrong while initiating payment.")
        }
    } catch (error) {
        console.log("ERROR MESSAGE: ",error.message)
        throw new ApiErrors(500,"Something went wrong while creating payment capture.")
    }
})

const verifySignature = asycnHandler(async (req,res) => {
    const webhookSecrete = "12345678"

    const signature = req.headers["x-razorpay-signature"]

    const shasum = crypto.createHmac("sha256",webhookSecrete)
    shasum.update(JSON.stringify(req.body))
    const digest = shasum.digest()

    if(signature === digest) {
        console.log("Payment is Authorized. ")

        const {userId,courseId} = req.body.payload.payment.entity.notes

        try {
            const enrolledCourse = await Course.findOneAndUpdate(
                                             {_id:courseId},
                                             {
                                                $push: {
                                                    studentsEnrolled: userId
                                                }
                                             },
                                             {new:true}
            )

            if(!enrolledCourse) {
                throw new ApiErrors(500,"Course not found.")
            }
            console.log(enrolledCourse)

            const enrolledStudent = await User.findOneAndUpdate(
                                   {_id:userId},
                                   {
                                      $push: {
                                          courses: courseId
                                      }
                                   },
                                   {new:true}
            )

            if(enrolledStudent) {
                throw new ApiErrors(500,"Student not found.")
            }
            console.log(enrolledStudent)

            const emailResponse = mailSender(
                                  enrolledStudent.email,
                                  "Congratulation from LearnSphere",
                                  "Congratulation, you are enrolled into new course from learnshere."
            )

            console.log(emailResponse)

            return res
                   .status(200)
                   .json(
                    new ApiResponse(200,"Signature verified and course added successfully.")
                   )
        } catch (error) {
            console.log("ERROR MESSAGE: ",error.message)
            throw new ApiErrors(500,"Something went wrong while authorization process.")
        }
    } else {
        throw new ApiErrors(400,"Invalid request.")
    }
})

export {
    capturePayment,
    verifySignature,
}