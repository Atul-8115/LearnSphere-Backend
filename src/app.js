import express from "express";
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
        origin: "http://localhost:3000",
        credentials: true,
    })
)

// import routes
import userRoutes from "./routes/User.router.js"
import profileRoutes from "./routes/Profile.router.js"
import paymentRoutes from "./routes/Payment.router.js"
import courseRoutes from "./routes/Course.router.js"

// routes
app.use("/api/v1/auth", userRoutes);
app.use("/api/v1/profile", profileRoutes);
app.use("/api/v1/course", courseRoutes);
app.use("/api/v1/payment", paymentRoutes);

export { app }