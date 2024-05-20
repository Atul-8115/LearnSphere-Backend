import mongoose, { Schema } from "mongoose"

const courseSchema = new Schema(
    {
        courseName: {
            type: String
        },
        courseDescription: {
            type: String
        },
        instructor: {
            type: mongoose.Schema.Types.ObjectId,
            // required: true,
            ref: "User",
        },
        whatYouWillLearn: {
            type: String
        },
        courseContent: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Section"
            }
        ],
        ratingAndReviews: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "RatingAndReview"
            }
        ],
        price: {
            type: Number
        },
        thumbnail: {
            type: String
        },
        category: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Category"
        },
        tag:{
            type: [String],
            required: true
        },
        studentsEnrolled: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
                required: true
            }
        ],
        instructions: {
            type: [String],
        },
        status: {
            type: String,
            enum: ["Draft", "Published"],
        }
    },
    {timestamps:true}
)

export const Course = mongoose.model("Course", courseSchema)