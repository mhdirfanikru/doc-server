import Razorpay from "razorpay";
import crypto from "crypto";


const razorpay = new Razorpay({
  key_id: "rzp_test_JfiruKTJHf8QRk",
  key_secret: "eyVKi376gF3mxfs1nLwWWmwf",
});


export const order = async (req, res) => {
  console.log("first")
  try {
    const instance = new Razorpay({
      key_id: process.env.RAZOR_KEY_ID,
      key_secret: process.env.RAZOR_SECRET_KEY,
    });

    const options = {
      amount: 500 * 100,
      currency: "INR",
      receipt: crypto.randomBytes(10).toString("hex"),
    };

    instance.orders.create(options, (error, order) => {
      if (error) {
        console.log(error)
        return res.status(500).json({ message: "Something went wrong!" });
      }
      res.status(200).json({ data: order });
    });
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: `Error -> ${error}` });
  }
};

export const verifyPayment = async (req, res) => {
  try {
    // Verify the payment using Razorpay API
    const payment = await razorpay.payments.fetch(req.body.razorpay_payment_id);
    
    // Check the payment status
    if (payment.status === "authorized") {
      // Payment is authorized, proceed with further steps
      res.status(200).json({ message: "Payment verified and authorized" });
    } else {
      res.status(400).json({ message: "Payment not authorized" });
    }
  } catch (error) {
    console.error("Payment verification error:", error);
    res.status(500).json({ message: "Error verifying payment" });
  }
};
