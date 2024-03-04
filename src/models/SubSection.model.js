import mongoose, {Schema} from "mongoose";

const subSectionSchema = new Schema({
    
   title: {
      type: String,
   },
   timeDuration: {
      type: String,
   },
   description: {
      type: String,
   },
   videoUrl: {
      type: String,
   }

});

export const SubSection = mongoose.model("SubSection", subSectionSchema);