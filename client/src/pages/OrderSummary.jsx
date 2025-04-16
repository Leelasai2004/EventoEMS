import { useContext, useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { UserContext } from "../UserContext";
import axios from "axios";
import { IoMdArrowBack } from "react-icons/io";

export default function OrderSummary() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(UserContext);
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [checked, setChecked] = useState(false);
  const [ticketCount, setTicketCount] = useState(1);

  useEffect(() => {
    if (!id) return;
    fetchEventDetails();
  }, [id]);

  const fetchEventDetails = async () => {
    try {
      const response = await axios.get(`/events/${id}`);
      setEvent(response.data);
    } catch (error) {
      console.error("Error fetching event details:", error);
      setError("Failed to load event details");
    } finally {
      setLoading(false);
    }
  };

  const handleCheckboxChange = (e) => {
    setChecked(e.target.checked);
  };

  const handleTicketCountChange = (e) => {
    const count = parseInt(e.target.value);
    if (count > 0 && count <= 10) {
      setTicketCount(count);
    }
  };

  const handleProceedToPayment = () => {
    if (!checked) return;

    // Store order details in localStorage for the payment page
    const orderDetails = {
      eventId: event._id,
      quantity: ticketCount,
      totalAmount: event.price * ticketCount,
      eventDetails: {
        title: event.title,
        date: event.eventDate,
        time: event.eventTime,
        venue: event.venue?.name || "TBD",
        price: event.price,
      },
    };

    localStorage.setItem("orderDetails", JSON.stringify(orderDetails));
    navigate(`/event/${id}/ordersummary/paymentsummary`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500">{error}</p>
        <Link
          to="/"
          className="text-blue-600 hover:text-blue-800 mt-4 inline-block"
        >
          Return to Home
        </Link>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">Event not found</p>
        <Link
          to="/"
          className="text-blue-600 hover:text-blue-800 mt-4 inline-block"
        >
          Return to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-4 py-5 sm:p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Order Summary
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Event Details */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Event Details
                </h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-900">{event.title}</h4>
                    <p className="text-gray-600">{event.description}</p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Date</span>
                      <span className="font-medium">
                        {new Date(event.eventDate).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Time</span>
                      <span className="font-medium">{event.eventTime}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Venue</span>
                      <span className="font-medium">
                        {event.venue?.name || "TBD"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Order Summary */}
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Order Summary
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Number of Tickets</span>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={ticketCount}
                      onChange={handleTicketCountChange}
                      className="w-20 px-2 py-1 border rounded"
                    />
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Ticket Price</span>
                    <span className="font-medium">₹{event.price}</span>
                  </div>
                  <div className="border-t pt-4">
                    <div className="flex justify-between font-bold">
                      <span>Total</span>
                      <span>₹{(event.price * ticketCount).toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <div className="flex items-start">
                    <div className="flex items-center h-5">
                      <input
                        id="terms"
                        type="checkbox"
                        checked={checked}
                        onChange={handleCheckboxChange}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label
                        htmlFor="terms"
                        className="font-medium text-gray-700"
                      >
                        I agree to the terms and conditions
                      </label>
                      <p className="text-gray-500">
                        By proceeding, you agree to our terms of service and
                        privacy policy.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <button
                    onClick={handleProceedToPayment}
                    disabled={!checked}
                    className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                      checked
                        ? "bg-blue-600 hover:bg-blue-700"
                        : "bg-gray-400 cursor-not-allowed"
                    } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
                  >
                    Proceed to Payment
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
