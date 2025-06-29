import React from "react";
import Navbar from "./components/Navbar/Navbar";
import { Route, Routes } from "react-router-dom";
import Home from "./pages/Home/Home";
import Cart from "./pages/Cart/Cart";
import PlaceOrder from "./pages/PlaceOrder/PlaceOrder";
import Footer from "./components/Footer/Footer";
import { useState, useEffect } from "react";
import LoginPopup from "./components/LoginPopup/LoginPopup";
import Verify from "./pages/Verify/Verify";
import MyOrders from "./pages/MyOrders/MyOrders";

const App = () => {
  const [showLogin, setShowLogin] = useState(false);

  // Clean up stale order data on app load
  useEffect(() => {
    // Remove any pending order data that might be stale
    // This ensures we don't have leftover data from previous sessions
    const pendingOrderData = localStorage.getItem("pendingOrderData");
    if (pendingOrderData) {
      try {
        const orderData = JSON.parse(pendingOrderData);
        // If the data is older than 1 hour, remove it
        const oneHourAgo = Date.now() - 60 * 60 * 1000;
        if (orderData.timestamp && orderData.timestamp < oneHourAgo) {
          localStorage.removeItem("pendingOrderData");
        }
      } catch (error) {
        // If parsing fails, remove the corrupted data
        localStorage.removeItem("pendingOrderData");
      }
    }
  }, []);

  return (
    <>
      {showLogin ? <LoginPopup setShowLogin={setShowLogin} /> : <></>}
      <div className="app">
        <Navbar setShowLogin={setShowLogin} />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/order" element={<PlaceOrder />} />
          <Route path="/verify" element={<Verify />} />
          <Route path="/myorders" element={<MyOrders />} />
        </Routes>
      </div>
      <Footer />
    </>
  );
};

export default App;
