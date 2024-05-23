import dotenv from "dotenv"
import connectDB from "./db/index.js"
import { app } from "./app.js"

dotenv.config({
    path: './.env'
})
// isko development ke time use karna hai.
// "dev": "nodemon -r dotenv/config --experimental-json-modules src/index.js"

connectDB()
.then(() => {
    app.on("error", (error) => {
        console.log("ERROR: ",error);
        throw error
    })
    app.listen(process.env.PORT || 8000, () => {
        console.log(`Server is running at port : ${process.env.PORT}`)
    })
})
.catch((err) => {
    console.log("MONGO db connection failed !!! ",err)
})