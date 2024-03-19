import { v2 as cloudinary } from "cloudinary"
import fs from "fs"

// cloudinary.config({
//     cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//     api_key: process.env.CLOUDINARY_API_KEY,
//     api_secret: process.env.CLOUDINARY_API_SECRET
// })

const uploadOnCloudinary = async (file, folder, height, quality) => {
    try {
        const options = {folder};
        if(height) {
            options.height = height;
        }
        if(quality) {
            options.quality = quality;
        }
        options.resource_type = "auto";

        const response = await cloudinary.uploader.upload(file.tempFilePath,options)
        fs.unlinkSync(file.tempFilePath)
        return response
    } catch (error) {
        fs.unlinkSync(file.tempFilePath)
        return null
    }
}

export { uploadOnCloudinary }

// exports.uploadImageToCloudinary  = async (file, folder, height, quality) => {
//     const options = {folder};
//     if(height) {
//         options.height = height;
//     }
//     if(quality) {
//         options.quality = quality;
//     }
//     options.resource_type = "auto";

//     return await cloudinary.uploader.upload(file.tempFilePath, options);
// }