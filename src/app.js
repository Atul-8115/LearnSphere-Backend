import express from "express";
import { cloudinaryConnect } from "./config/cloudinary.js"
const app = express()

// Userful libraries
import cookieParser from "cookie-parser";
import cors from "cors"
import fileUpload from "express-fileupload"

app.use(express.json())
app.use(express.urlencoded({extended: true, limit: "16kb"}))
app.use(express.static("public"))
app.use(cookieParser())

// Padhna hai iske baare me
app.use(
    cors({
        origin: "https://learn-sphere-frontend.vercel.app",
        credentials: true,
    })
)

app.use(
	fileUpload({
		useTempFiles:true,
		tempFileDir:"/tmp",
	})
)

// cloudinary connection
cloudinaryConnect();

// import routes
import userRoutes from "./routes/User.router.js"
import profileRoutes from "./routes/Profile.router.js"
import paymentRoutes from "./routes/Payment.router.js"
import courseRoutes from "./routes/Course.router.js"
import contactRoutes from "./routes/Contact.router.js"
// routes
app.use("/api/v1/auth", userRoutes);
app.use("/api/v1/profile", profileRoutes);
app.use("/api/v1/course", courseRoutes);
app.use("/api/v1/payment", paymentRoutes);
app.use("/api/v1/contact",contactRoutes)

app.get("/", (req,res) => {
    return res.json({
		success: true,
		message: "Your server is up and running ...",
	});
})

export { app }