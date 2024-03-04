import mongoose, {Schema} from "mongoose";

const ratingAndReviewSchema = new Schema({
    user:{
        type: Schema.Types.ObjectId,
        required: true,
        ref: "User",
    },
    rating: {
        type:Number,
        required:true,
    },
    review:{
        type:String,
        required:true,
    }
});

export const RatingAndReview = mongoose.model("RatingAndReview", ratingAndReviewSchema)