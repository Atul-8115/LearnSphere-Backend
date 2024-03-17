import nodemailer from "nodemailer"
import { asycnHandler } from "./asynHandler.js"
import { ApiErrors } from "./ApiErrors.js"

const mailSender = async (email, title, body) => {
    try {
        let transporter = nodemailer.createTransport({
            host: process.env.MAIL_HOST,
            auth: {
                user: process.env.MAIL_USER,
                pass: process.env.MAIL_PASS
            }
        })

        let info = await transporter.sendMail({
            from: "LearnSphere - by Atul Pandey",
            to: `${email}`,
            subject: `${title}`,
            html: `${body}`,
        })

        console.log("I'm here in mailsender: ",info)
        return info
    } catch (error) {
        console.log(error.message);
        throw new ApiErrors(500, "Something went wrong")
    }
}

export {mailSender}