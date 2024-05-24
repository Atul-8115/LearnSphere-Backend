import Razorpay from "razorpay"
import dotenv from "dotenv"

dotenv.config();

console.log('RAZORPAY_KEY_ID:', process.env.RAZORPAY_KEY);
console.log('RAZORPAY_KEY_SECRET:', process.env.RAZORPAY_SECRET);

const instance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY,
    key_secret: process.env.RAZORPAY_SECRET
})

export {
    instance
}