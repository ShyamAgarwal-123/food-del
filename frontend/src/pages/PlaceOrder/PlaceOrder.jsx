import React, { useEffect } from "react";
import "./PlaceOrder.css";
import { useContext } from "react";
import { StoreContext } from "../../context/StoreContext";
import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const PlaceOrder = () => {
  const { getTotalCartAmount, token, food_list, cartItems, url } =
    useContext(StoreContext);
  const [data, setData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    street: "",
    city: "",
    state: "",
    zipcode: "",
    country: "",
    phone: "",
  });
  const [loading, setLoading] = useState(false);
  const [orderData, setOrderData] = useState(null);

  const onChangeHandler = (event) => {
    const name = event.target.name;
    const value = event.target.value;
    setData((data) => ({ ...data, [name]: value }));
  };

  const loadScript = (src) => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = src;
      script.onload = () => {
        resolve(true);
      };
      script.onerror = () => {
        resolve(false);
      };
      document.body.appendChild(script);
    });
  };

  const displayRazorpay = async (razorpayResponse, orderData) => {
    const res = await loadScript(
      "https://checkout.razorpay.com/v1/checkout.js"
    );
    console.log(res);

    if (!res) {
      alert("Razorpay SDK failed to load");
      setLoading(false);
      return;
    }
    console.log(orderData);

    // Store orderData in localStorage for verification fallback
    localStorage.setItem("pendingOrderData", JSON.stringify(orderData));

    const options = {
      key: razorpayResponse.key,
      amount: razorpayResponse.order.amount,
      currency: razorpayResponse.order.currency,
      name: "Food Delivery",
      description: "Food Order Payment",
      order_id: razorpayResponse.order.id,
      handler: async function (response) {
        try {
          const verifyResponse = await axios.post(
            url + "/api/order/verify",
            {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              orderData: orderData,
            },
            { headers: { token } }
          );

          if (verifyResponse.data.success) {
            // Clear the stored order data
            localStorage.removeItem("pendingOrderData");
            alert("Payment successful!");
            navigate("/myorders");
          } else {
            alert("Payment verification failed!");
            navigate("/cart");
          }
        } catch (error) {
          console.error("Payment verification error:", error);
          // If verification fails, redirect to verify page with params
          const params = new URLSearchParams({
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
          });
          navigate(`/verify?${params.toString()}`);
        } finally {
          setLoading(false);
        }
      },
      modal: {
        ondismiss: function () {
          // Clear the stored order data if payment is cancelled
          localStorage.removeItem("pendingOrderData");
          alert("Payment cancelled. You can try again.");
          setLoading(false);
        },
      },
      prefill: {
        name: `${data.firstName} ${data.lastName}`,
        email: data.email,
        contact: data.phone,
      },
      theme: {
        color: "#3399cc",
      },
    };

    try {
      const paymentObject = new window.Razorpay(options);
      paymentObject.open();
    } catch (error) {
      console.error("Error opening Razorpay modal:", error);
      alert("Error opening payment gateway. Please try again.");
      setLoading(false);
    }
  };

  const placeOrder = async (event) => {
    event.preventDefault();
    setLoading(true);

    try {
      let orderItems = [];
      food_list.map((item) => {
        if (cartItems[item._id] > 0) {
          let itemInfo = item;
          itemInfo["quantity"] = cartItems[item._id];
          orderItems.push(itemInfo);
        }
      });

      let orderDataToSend = {
        address: data,
        items: orderItems,
        amount: getTotalCartAmount() + 2,
      };

      const orderDataWithTimestamp = {
        items: orderItems,
        amount: getTotalCartAmount() + 2,
        address: data,
        timestamp: Date.now(), // Add timestamp for cleanup
      };

      setOrderData(orderDataWithTimestamp);

      let response = await axios.post(
        url + "/api/order/place",
        orderDataToSend,
        { headers: { token } }
      );

      if (response.data.success) {
        await displayRazorpay(response.data, orderDataWithTimestamp);
      } else {
        alert("Error creating order");
        setLoading(false);
      }
    } catch (error) {
      console.error("Order creation error:", error);
      alert("Error creating order");
      setLoading(false);
    }
  };

  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      navigate("/cart");
    } else if (getTotalCartAmount() === 0) {
      navigate("/cart");
    }
  }, [token]);

  return (
    <form onSubmit={placeOrder} className="place-order">
      <div className="place-order-left">
        <p className="title">Delivery Information</p>
        <div className="multi-fields">
          <input
            required
            name="firstName"
            onChange={onChangeHandler}
            value={data.firstName}
            type="text"
            placeholder="First name"
          />
          <input
            required
            name="lastName"
            onChange={onChangeHandler}
            value={data.lastName}
            type="text"
            placeholder="Last name"
          />
        </div>
        <input
          required
          name="email"
          onChange={onChangeHandler}
          value={data.email}
          type="email"
          placeholder="Email address"
        />
        <input
          required
          name="street"
          onChange={onChangeHandler}
          value={data.street}
          type="text"
          placeholder="Street"
        />
        <div className="multi-fields">
          <input
            required
            name="city"
            onChange={onChangeHandler}
            value={data.city}
            type="text"
            placeholder="City"
          />
          <input
            required
            name="state"
            onChange={onChangeHandler}
            value={data.state}
            type="text"
            placeholder="State"
          />
        </div>
        <div className="multi-fields">
          <input
            required
            name="zipcode"
            onChange={onChangeHandler}
            value={data.zipcode}
            type="text"
            placeholder="Zip code"
          />
          <input
            required
            name="country"
            onChange={onChangeHandler}
            value={data.country}
            type="text"
            placeholder="Country"
          />
        </div>
        <input
          required
          name="phone"
          onChange={onChangeHandler}
          value={data.phone}
          type="text"
          placeholder="Phone"
        />
      </div>

      <div className="place-order-right">
        <div className="cart-total">
          <h2>Cart Totals</h2>
          <div>
            <div className="cart-total-details">
              <p>Subtotal</p>
              <p>₹ {getTotalCartAmount()}</p>
            </div>
            <hr />
            <div className="cart-total-details">
              <p>Delivery Fee</p>
              <p>₹ {getTotalCartAmount() === 0 ? 0 : 2}</p>
            </div>
            <hr />
            <div className="cart-total-details">
              <b>Total</b>
              <b>
                ₹ {getTotalCartAmount() === 0 ? 0 : getTotalCartAmount() + 2}
              </b>
            </div>
          </div>
          <button type="submit" disabled={loading}>
            {loading ? "PROCESSING..." : "PROCEED TO PAYMENT"}
          </button>
        </div>
      </div>
    </form>
  );
};

export default PlaceOrder;
