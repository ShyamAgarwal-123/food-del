import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";
// import Stripe from "stripe";
import Razorpay from "razorpay";
import crypto from "crypto";

// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// creating Razorpay order for frontend (without saving to our DB yet)
const placeOrder = async (req, res) => {
  try {
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_SECRET,
    });

    // Generate a temporary receipt ID
    const tempReceiptId = `order_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;

    const options = {
      amount: req.body.amount * 100, // Razorpay expects amount in paise
      currency: "INR",
      receipt: tempReceiptId,
      notes: {
        userId: req.userId,
        tempReceiptId: tempReceiptId,
      },
    };

    const razorpayOrder = await razorpay.orders.create(options);

    if (!razorpayOrder) {
      return res.status(500).send("Error creating Razorpay order");
    }

    res.json({
      success: true,
      order: razorpayOrder,
      key: process.env.RAZORPAY_KEY_ID,
      tempReceiptId: tempReceiptId,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Error creating order" });
  }
};

const verifyOrder = async (req, res) => {
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    orderData,
  } = req.body;
  console.log(req.body);

  try {
    // Validate required fields
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.json({
        success: false,
        message: "Missing Razorpay payment details",
      });
    }

    // Validate orderData
    if (
      !orderData ||
      !orderData.items ||
      !orderData.amount ||
      !orderData.address
    ) {
      return res.json({
        success: false,
        message: "Missing order data",
      });
    }

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_SECRET)
      .update(razorpay_order_id + "|" + razorpay_payment_id)
      .digest("hex");

    if (expectedSignature === razorpay_signature) {
      // Payment is verified, now save the order to our database
      const newOrder = new orderModel({
        userId: req.userId,
        items: orderData.items,
        amount: orderData.amount,
        address: orderData.address,
        payment: true,
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
      });

      await newOrder.save();

      // Clear the user's cart only after successful payment
      await userModel.findByIdAndUpdate(req.userId, { cartData: {} });

      res.json({
        success: true,
        message: "Payment verified successfully",
        orderId: newOrder._id,
      });
    } else {
      // Payment verification failed, don't save anything
      res.json({ success: false, message: "Payment verification failed" });
    }
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error verifying payment" });
  }
};

//user orders for frontend
const userOrders = async (req, res) => {
  try {
    const orders = await orderModel.find({ userId: req.userId });
    res.json({ success: true, data: orders });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error" });
  }
};

// listening orders for admin panel
const listOrders = async (req, res) => {
  try {
    const orders = await orderModel.find({});
    res.json({ success: true, data: orders });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error" });
  }
};

// api for updating order status
const updateStatus = async (req, res) => {
  try {
    await orderModel.findByIdAndUpdate(req.body.orderId, {
      status: req.body.status,
    });
    res.json({ success: true, message: "Status Updated" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error" });
  }
};

export { placeOrder, verifyOrder, userOrders, listOrders, updateStatus };
