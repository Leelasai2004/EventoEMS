import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { useUser } from "../UserContext";

export default function TicketPurchasePage() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { user } = useUser();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [ticketCount, setTicketCount] = useState(1);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
  });

  useEffect(() => {
    fetchEventDetails();
  }, [eventId]);

  const fetchEventDetails = async () => {
    try {
      const response = await axios.get(
        `http://localhost:4000/events/${eventId}`,
        {
          withCredentials: true,
        }
      );
      setEvent(response.data);
    } catch (err) {
      setError("Failed to fetch event details");
      console.error("Error fetching event:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleTicketCountChange = (e) => {
    const count = parseInt(e.target.value);
    if (count > 0 && count <= (event?.capacity || 1)) {
      setTicketCount(count);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      // Validate form data
      if (!formData.name || !formData.email || !formData.phone) {
        throw new Error("Please fill in all required fields");
      }

      // Create ticket data
      const ticketData = {
        userid: user._id,
        eventid: eventId,
        ticketDetails: {
          name: formData.name,
          email: formData.email,
          eventname: event.title,
          eventdate: event.eventDate,
          eventtime: event.eventTime,
          ticketprice: event.pricePerTicket * ticketCount,
          qr: `QR-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        },
        count: ticketCount,
      };

      // Process dummy payment
      const paymentResult = await processDummyPayment(
        ticketData.ticketDetails.ticketprice
      );

      if (!paymentResult.success) {
        throw new Error("Payment failed. Please try again.");
      }

      // Create ticket
      const response = await axios.post(
        "http://localhost:4000/tickets",
        ticketData,
        {
          withCredentials: true,
        }
      );

      // Navigate to success page
      navigate(`/tickets/${response.data.ticket._id}`);
    } catch (err) {
      setError(err.message || "Failed to purchase tickets");
    }
  };

  const processDummyPayment = async (amount) => {
    // Simulate payment processing
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          transactionId: `TXN-${Date.now()}-${Math.random()
            .toString(36)
            .substr(2, 9)}`,
          amount,
        });
      }, 1500);
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
          <p className="font-medium">Error</p>
          <p>{error}</p>
          <button
            onClick={() => navigate(-1)}
            className="mt-2 text-sm underline hover:text-red-700"
          >
            Go back
          </button>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <div className="text-center py-12">
          <h2 className="text-2xl font-semibold text-gray-900">
            Event Not Found
          </h2>
          <p className="text-gray-600 mt-2">
            The event you're looking for doesn't exist.
          </p>
          <button
            onClick={() => navigate(-1)}
            className="mt-4 text-blue-600 hover:text-blue-700"
          >
            Go back
          </button>
        </div>
      </div>
    );
  }

  const totalPrice = event.pricePerTicket * ticketCount;

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          Purchase Tickets
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Event Details */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Event Details
            </h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium text-gray-900">
                  {event.title}
                </h3>
                <p className="text-gray-600">{event.description}</p>
              </div>
              <div className="space-y-2">
                <p className="flex items-center text-gray-600">
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  {new Date(event.eventDate).toLocaleDateString()} at{" "}
                  {event.eventTime}
                </p>
                <p className="flex items-center text-gray-600">
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  {event.venue.name}
                </p>
              </div>
            </div>
          </div>

          {/* Ticket Purchase Form */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Ticket Information
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="ticketCount"
                  className="block text-sm font-medium text-gray-700"
                >
                  Number of Tickets
                </label>
                <input
                  type="number"
                  id="ticketCount"
                  min="1"
                  max={event.capacity}
                  value={ticketCount}
                  onChange={handleTicketCountChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700"
                >
                  Full Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700"
                >
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="phone"
                  className="block text-sm font-medium text-gray-700"
                >
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="pt-4 border-t">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-gray-600">Total Price:</span>
                  <span className="text-lg font-semibold text-gray-900">
                    ₹{totalPrice}
                  </span>
                </div>

                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Purchase Tickets
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
