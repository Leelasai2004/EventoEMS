/* eslint-disable no-unused-vars */
import axios from "axios";
import { useContext, useEffect, useState } from "react";
import { Link, Navigate, useParams, useNavigate } from "react-router-dom";
import { IoMdArrowBack } from "react-icons/io";
import { UserContext } from "../UserContext";
import Qrcode from "qrcode"; //TODO:
import QRCode from "qrcode"; //TODO:

export default function PaymentSummary() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(UserContext);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [orderDetails, setOrderDetails] = useState(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [paymentDetails, setPaymentDetails] = useState({
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    cardName: "",
  });

  useEffect(() => {
    const storedOrder = localStorage.getItem("orderDetails");
    if (!storedOrder) {
      setError("No order details found. Please go back and try again.");
      return;
    }

    try {
      const parsedOrder = JSON.parse(storedOrder);
      console.log("Parsed order details:", parsedOrder);

      // If the data is in the old format (direct properties), convert it to the new format
      let formattedOrder = parsedOrder;
      if (parsedOrder.title && !parsedOrder.eventDetails) {
        formattedOrder = {
          eventId: parsedOrder._id,
          quantity: parsedOrder.ticketCount || 1,
          totalAmount:
            Number(parsedOrder.ticketPrice) * (parsedOrder.ticketCount || 1),
          eventDetails: {
            title: parsedOrder.title,
            date: parsedOrder.eventDate,
            time: parsedOrder.eventTime,
            venue: parsedOrder.venue,
            price: Number(parsedOrder.ticketPrice),
          },
        };
      }

      // Ensure all numeric values are properly converted
      formattedOrder.quantity = Number(
        formattedOrder.quantity || formattedOrder.ticketCount || 1
      );
      formattedOrder.totalAmount = Number(
        formattedOrder.totalAmount ||
          formattedOrder.price * formattedOrder.quantity
      );
      formattedOrder.price = Number(
        formattedOrder.price || formattedOrder.eventDetails?.price || 0
      );

      // Format the date
      if (formattedOrder.eventDetails?.date) {
        formattedOrder.eventDetails.date = new Date(
          formattedOrder.eventDetails.date
        ).toISOString();
      }

      setOrderDetails(formattedOrder);
    } catch (err) {
      console.error("Error parsing order details:", err);
      setError("Invalid order details. Please go back and try again.");
    }
  }, []);

  const handlePaymentDetailsChange = (e) => {
    const { name, value } = e.target;
    setPaymentDetails((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleProceedToPayment = () => {
    setShowPaymentDialog(true);
  };

  const generateQRCode = async (eventName, userName) => {
    try {
      const qrCodeData = await Qrcode.toDataURL(
        `Event: ${eventName}\nUser: ${userName}`
      );
      return qrCodeData;
    } catch (error) {
      console.error("Error generating QR code:", error);
      return null;
    }
  };

  const handlePayment = async () => {
    if (!orderDetails || !user) {
      setError("Order details or user information is missing");
      return;
    }

    // Validate payment details
    if (
      !paymentDetails.cardNumber ||
      !paymentDetails.expiryDate ||
      !paymentDetails.cvv
    ) {
      setError("Please fill in all payment details");
      return;
    }

    try {
      setLoading(true);
      setError("");

      // Generate QR code
      const qrCode = `TICKET-${Date.now()}-${Math.random()
        .toString(36)
        .substr(2, 9)}`;

      // Prepare ticket data
      const ticketData = {
        userId: user._id,
        eventId: orderDetails.eventId || orderDetails._id,
        quantity: Number(
          orderDetails.quantity || orderDetails.ticketCount || 1
        ),
        totalAmount: Number(
          orderDetails.totalAmount ||
            orderDetails.price * (orderDetails.ticketCount || 1)
        ),
        eventDetails: {
          title: orderDetails.eventDetails.title,
          date: new Date(orderDetails.eventDetails.date),
          time: orderDetails.eventDetails.time,
          venue: orderDetails.eventDetails.venue,
          location:
            orderDetails.eventDetails.location ||
            orderDetails.eventDetails.venue,
          description: orderDetails.eventDetails.description || "Event ticket",
          price: Number(orderDetails.eventDetails.price || orderDetails.price),
        },
        ticketDetails: {
          price: Number(orderDetails.eventDetails.price || orderDetails.price),
          purchaseDate: new Date(),
        },
        qrCode: qrCode,
        status: "active",
      };

      console.log("Creating ticket with data:", ticketData);

      // Create ticket
      const response = await axios.post(
        "http://localhost:4000/tickets",
        ticketData,
        {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.data.success) {
        setPaymentSuccess(true);
        // Clear the order details from localStorage
        localStorage.removeItem("orderDetails");
        // Redirect to tickets page after 2 seconds
        setTimeout(() => {
          navigate("/my-tickets");
        }, 2000);
      } else {
        throw new Error(response.data.message || "Failed to create ticket");
      }
    } catch (error) {
      console.error("Payment error:", error);
      setError(
        error.response?.data?.message ||
          error.message ||
          "Payment failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error && !orderDetails) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <button
            onClick={() => navigate(-1)}
            className="text-blue-600 hover:text-blue-800"
          >
            Go back
          </button>
        </div>
      </div>
    );
  }

  if (paymentSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-green-500 text-6xl mb-4">✓</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Payment Successful!
          </h2>
          <p className="text-gray-600">
            Your tickets have been booked successfully.
          </p>
          <p className="text-gray-500 mt-2">Redirecting to your tickets...</p>
        </div>
      </div>
    );
  }

  if (!orderDetails) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center mb-6">
              <button
                onClick={() => navigate(-1)}
                className="flex items-center text-blue-600 hover:text-blue-800"
              >
                <IoMdArrowBack className="mr-2" />
                Back to Order Summary
              </button>
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Payment Summary
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Order Details */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Order Details
                </h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-900">
                      {orderDetails?.eventDetails?.title}
                    </h4>
                    <p className="text-gray-600">
                      {orderDetails?.eventDetails?.date
                        ? new Date(
                            orderDetails.eventDetails.date
                          ).toLocaleDateString()
                        : "Invalid Date"}{" "}
                      at {orderDetails?.eventDetails?.time || ""}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Venue</span>
                      <span className="font-medium">
                        {orderDetails?.eventDetails?.venue}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tickets</span>
                      <span className="font-medium">
                        {orderDetails?.quantity || 1}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Price per Ticket</span>
                      <span className="font-medium">
                        ${(orderDetails?.price || 0).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Summary */}
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Payment Summary
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium">
                      $
                      {(
                        (orderDetails?.price || 0) *
                        (orderDetails?.quantity || 1)
                      ).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Service Fee</span>
                    <span className="font-medium">$0.00</span>
                  </div>
                  <div className="border-t pt-4">
                    <div className="flex justify-between font-bold">
                      <span>Total</span>
                      <span>
                        $
                        {(
                          (orderDetails?.price || 0) *
                          (orderDetails?.quantity || 1)
                        ).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                {error && (
                  <div
                    className={`mt-4 text-sm ${
                      error.includes("Processing")
                        ? "text-blue-600"
                        : "text-red-500"
                    }`}
                  >
                    {error}
                  </div>
                )}

                <div className="mt-6">
                  <button
                    onClick={handleProceedToPayment}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Proceed to Payment
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Dialog */}
      {showPaymentDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Enter Payment Details
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Card Name
                </label>
                <input
                  type="text"
                  name="cardName"
                  value={paymentDetails.cardName}
                  onChange={handlePaymentDetailsChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Name on card"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Card Number
                </label>
                <input
                  type="text"
                  name="cardNumber"
                  value={paymentDetails.cardNumber}
                  onChange={handlePaymentDetailsChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="1234 5678 9012 3456"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Expiry Date
                  </label>
                  <input
                    type="text"
                    name="expiryDate"
                    value={paymentDetails.expiryDate}
                    onChange={handlePaymentDetailsChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    placeholder="MM/YY"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    CVV
                  </label>
                  <input
                    type="text"
                    name="cvv"
                    value={paymentDetails.cvv}
                    onChange={handlePaymentDetailsChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    placeholder="123"
                  />
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setShowPaymentDialog(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handlePayment}
                disabled={loading}
                className={`px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white ${
                  loading
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  "Pay Now"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
