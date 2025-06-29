import React, { useContext } from "react";
import "./Verify.css";
import { useNavigate, useSearchParams } from "react-router-dom";
import { StoreContext } from "../../context/StoreContext";
import { useEffect } from "react";
import axios from "axios";

const Verify = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const success = searchParams.get("success");
  const orderId = searchParams.get("orderId");
  const razorpay_order_id = searchParams.get("razorpay_order_id");
  const razorpay_payment_id = searchParams.get("razorpay_payment_id");
  const razorpay_signature = searchParams.get("razorpay_signature");
  const { url, token } = useContext(StoreContext);
  const navigate = useNavigate();

  const verifyPayment = async () => {
    try {
      // For Razorpay, we need to verify with signature
      if (razorpay_order_id && razorpay_payment_id && razorpay_signature) {
        // Get orderData from localStorage
        const storedOrderData = localStorage.getItem("pendingOrderData");
        let orderData = null;

        if (storedOrderData) {
          try {
            orderData = JSON.parse(storedOrderData);
          } catch (error) {
            console.error("Error parsing stored order data:", error);
          }
        }

        if (!orderData) {
          console.error("No order data available for verification");
          navigate("/cart");
          return;
        }

        const response = await axios.post(
          url + "/api/order/verify",
          {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            orderData: orderData,
          },
          { headers: { token } }
        );

        if (response.data.success) {
          localStorage.removeItem("pendingOrderData");
          navigate("/myorders");
        } else {
          localStorage.removeItem("pendingOrderData");
          navigate("/cart");
        }
      } else if (success && orderId) {
        // Fallback for old verification method (Stripe)
        const response = await axios.post(url + "/api/order/verify", {
          success,
          orderId,
        });
        if (response.data.success) {
          navigate("/myorders");
        } else {
          navigate("/");
        }
      } else {
        // No verification parameters, redirect to home
        navigate("/");
      }
    } catch (error) {
      console.error("Verification error:", error);
      // Clear the stored order data on error
      localStorage.removeItem("pendingOrderData");
      navigate("/cart");
    }
  };

  useEffect(() => {
    verifyPayment();
  }, []);

  return (
    <div className="verify">
      <div className="spinner">
        <p>Verifying payment...</p>
      </div>
    </div>
  );
};

export default Verify;
