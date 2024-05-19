import mongoose from "mongoose";
import { Course } from "../models/Course.model.js";
import { ApiErrors } from "../utils/ApiErrors.js";
import { asycnHandler } from "../utils/asynHandler.js";
import { instance } from "../config/razorpay.js";
import { ApiResponse } from "../utils/AppResponse.js";
import { User } from "../models/User.model.js";
import { mailSender } from "../utils/mailSender.js";
import crypto from 'crypto'

const capturePayment = asycnHandler(async (req,res) => {
    try {
        const {courses} = req.body
        const userId = req.user.id 

        if(!courses) {
            throw new ApiErrors(400,"Please please provide valid courses.")
        }

        let totalAmount = 0

        for(const course_id of courses) {
            let course
            try {
                
                course = await Course.findById(course_id)
                if(!course) {
                    throw new ApiErrors(400,"Please add courses to cart.")
                }

                const uid = new mongoose.Types.ObjectId(userId)
                if(course.studentsEnrolled.includes(uid)) {
                    throw new ApiErrors(401,"Student already enrolled into the course.")
                }

                totalAmount += course.price
            } catch (error) {
                console.log("ERROR MESSAGE: ",error.message)
                throw new ApiErrors(500,"Something went wrong while amount")
            }
        }

        const currency = "INR";
        const options = {
            amount: totalAmount * 100,
            currency,
            receipt: Math.random(Date.now()).toString()
        }
        try {
            const paymentResponse = await instance.orders.create(options)
            console.log(paymentResponse)
            return res
                   .status(200)
                   .json(new ApiResponse(200,paymentResponse,"Payment initiated."))
        } catch (error) {
            console.log("ERROR MESSAGE: ",error.message)
            throw new ApiErrors(500,"Something went wrong while initiating payment.")
        }
    } catch (error) {
        console.log("ERROR MESSAGE: ",error.message)
        throw new ApiErrors(500,"Something went wrong while creating payment capture.")
    }
})

const verifyPayment = asycnHandler(async (req,res) => {
    const razorpay_order_id = req.body?.razorpay_order_id;
    const razorpay_payment_id = req.body?.razorpay_payment_id;
    const razorpay_signature = req.body?.razorpay_signature;
    const courses = req.body?.courses;
    const userId = req.user.id;

    if(!razorpay_order_id ||
        !razorpay_payment_id ||
        !razorpay_signature || !courses || !userId) {
            throw new ApiErrors(400,"All fields are required.")
    }

    let body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
          .createHmac("sha256",process.env.RAZORPAY_SECRET)
          .update(body.toString())
          .digest("hex");

    if(expectedSignature === razorpay_signature) {
        await enrollStudents(courses, userId, res)
        return res
               .status(200)
               .json(new ApiResponse(200,"Payment verified"))
    }
    throw new ApiErrors(500,"Something went wrong while verifying payment.")
})

const enrollStudents = async (courses, userId, res) => {
    if(!courses || !userId) {
        throw new ApiErrors(400,"Some information is missing.")
    }

    for(const courseId of courses) {
        try {
            const enrolledCourse = await Course.findByIdAndUpdate(
                {_id: courseId},
                {$push: {studentsEnrolled: userId}},
                {new:true}
            )

            if(!enrolledCourse) {
                throw new ApiErrors(403,"Course not found.")
            }

            const enrolledStudent = await User.findByIdAndUpdate(
                userId,
                {
                    $push:{
                        courses: courseId,
                    }
                },
                {new:true}
            )

            const emailResponse = await mailSender(
                enrolledStudent.email,
                `Successfully Enrolled into ${enrolledCourse.courseName}`,
                courseEnrollmentEmail(enrolledCourse.courseName, `${enrolledStudent.firstName}`)
            )
        } catch (error) {
            console.log("ERROR MESSAGE: ",error.message)
            throw new ApiErrors(500,"Something went wrong while enrolling the student into course")
        }
    }
}

const sendPaymentSuccessEmail = async(req, res) => {
    const {orderId, paymentId, amount} = req.body;

    const userId = req.user.id;

    if(!orderId || !paymentId || !amount || !userId) {
        throw new ApiErrors(400,"Some fields are missing.")
    }

    try{
        
        const enrolledStudent = await User.findById(userId);
        await mailSender(
            enrolledStudent.email,
            `Payment Recieved`,
             paymentSuccessEmail(`${enrolledStudent.firstName}`,
             amount/100,orderId, paymentId)
        )
    }
    catch(error) {
        console.log("ERROR MESSAGE", error)
        throw new ApiErrors(500,"Something went wrong while sending payment successful mail.")
    }
}

export {
    capturePayment,
    verifyPayment,
    sendPaymentSuccessEmail
}