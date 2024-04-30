import mongoose, { Schema } from "mongoose"
import bcrypt from "bcrypt"
import  jwt  from "jsonwebtoken"

const userSchema = new Schema(
    {
        firstName: {
            type: String,
            required: true,
            trim: true
        }, 
        lastName: {
            type: String,
            required: true,
            trim: true
        },
        email: {
            type: String,
            required: true,
            trim: true
        },
        password: {
            type: String,
            required: true,
        },
        confirmPassword: {
            type: String,
            required: true,
        },
        accountType: {
            type: String,
            enum: ["Admin", "Student", "Instructor"],
            required: true
        },
        contactNumber: {
            type: Number,
            // required: true,
        },
        additionalDetails: {
            type: Schema.Types.ObjectId,
            ref: "Profile",
            // required : true
        },
        courses: [
            {
                type: Schema.Types.ObjectId,
                ref: "Course"
            }
        ],
        image: {
            type: String,
            // required: true
        }, 
        courseProgress: [
            {
                type: Schema.Types.ObjectId,
                ref: "CourseProgress",
            }
        ],
        refreshToken: {
            type: String,
        },
        token: {
            type: String
        },
        resetPasswordExpires: {
            type: Date
        }
    },
    {timestamps: true}
)
async function sendVerificationEmail(email, otp) {
    try {
        const mailResponse = await mailSender(email, "Verification Email from LearnSphere", otpTemplate(otp))
        // const some = otpTemplate(otp)
        console.log("Email sent Successfully: ", mailResponse);
    } catch (error) {
        throw new ApiErrors(500,error, "Error occurred while sending mail")
    }
}

userSchema.pre("save", async function (next) {
    if(!this.isModified("password")) return next();

    this.password = await bcrypt.hash(this.password,10)
    await sendVerificationEmail(this.email, this.otp)
    console.log("Printing this.password -> ",this.password)
    next();
})

//Verifying the password
userSchema.methods.isPassowrdCorrect = async function(password) {
    console.log(password," ",this.password);
    return await bcrypt.compare(password,this.password)
}

userSchema.methods.generateAccessToken = function() {
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            firstName: this.firstName,
            lastName: this.lastName,
            accountType: this.accountType
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}

userSchema.methods.generateRefreshToken = function() {
    return jwt.sign(
        {
            _id: this._id
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}

export const User = mongoose.model("User", userSchema)