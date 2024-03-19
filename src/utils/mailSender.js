import nodemailer from "nodemailer"
import { ApiErrors } from "./ApiErrors.js"

const mailSender = async (email, title, body) => {
    try {
        process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
        let transporter = nodemailer.createTransport({
            host: process.env.MAIL_HOST,
            auth: {
                user: process.env.MAIL_USER,
                pass: process.env.MAIL_PASS
            }
        })

        // console.log("transporter ",transporter);
        let info = await transporter.sendMail({
            from: "LearnSphere - by Atul Pandey",
            to: `${email}`,
            subject: `${title}`,
            html: `${body}`,
        })

        // console.log("I'm here in mailsender: ",info)
        return info
    } catch (error) {
        console.log(error.message);
        throw new ApiErrors(500, "Something went wrong")
    }
}

export {mailSender}