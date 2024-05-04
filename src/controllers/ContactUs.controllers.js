import { asycnHandler } from "../utils/asynHandler.js";
import { mailSender } from "../utils/mailSender.js";
import { ApiResponse } from "../utils/AppResponse.js";
import { ApiErrors } from "../utils/ApiErrors.js";
import { ContactUsEmail } from "../mail/templates/ContactUsEmail.js"

const contactUsController = asycnHandler(async (req,res) => {
    const {email, firstname, lastname, message, phoneNo, countrycode} = req.body
    console.log(req.body)
    try {
        const emailRes = await mailSender(
            email,
            "Your Data send successfully",
            ContactUsEmail(email, firstname, lastname, message, phoneNo, countrycode)
        )
        console.log("Email Res ", emailRes)

        return res
               .status(200)
               .json(new ApiResponse(200,"Email send successfully"))
    } catch (error) {
        console.log("Error ", error)
        console.log("Error Message: ",error.message)
        throw new ApiErrors(500, "Something went wrong...")
    }
})

export {
    contactUsController
}