import mongoose, { Schema } from "mongoose";

const courseProgress = new Schema(
    {
        courseID: {
            type: Schema.Types.ObjectId,
            ref: "Course"
        },
        completedVideos: [
            {
                type: Schema.Types.ObjectId,
                ref: "SubSection"
            }
        ]
    },
    {timestamps:true}
)

export const CourseProgress = mongoose.model("CourseProgress", courseProgress)