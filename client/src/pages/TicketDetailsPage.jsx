import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";

export default function TicketDetailsPage() {
  const { ticketId } = useParams();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchTicketDetails();
  }, [ticketId]);

  const fetchTicketDetails = async () => {
    try {
      const response = await axios.get(
        `http://localhost:4000/tickets/${ticketId}`,
        {
          withCredentials: true,
        }
      );
      setTicket(response.data);
    } catch (err) {
      setError("Failed to fetch ticket details");
      console.error("Error fetching ticket details:", err);
    } finally {
      setLoading(false);
    }
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
        </div>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <div className="text-center py-12">
          <h2 className="text-2xl font-semibold text-gray-900">
            Ticket Not Found
          </h2>
          <p className="text-gray-600 mt-2">
            The requested ticket could not be found.
          </p>
          <Link
            to="/my-tickets"
            className="mt-4 inline-block text-blue-600 hover:text-blue-700"
          >
            Back to My Tickets
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          Ticket Details
        </h1>

        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              {ticket.ticketDetails.eventname}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-gray-600">Date</p>
                <p className="font-medium">
                  {new Date(
                    ticket.ticketDetails.eventdate
                  ).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-gray-600">Time</p>
                <p className="font-medium">{ticket.ticketDetails.eventtime}</p>
              </div>
              <div>
                <p className="text-gray-600">Venue</p>
                <p className="font-medium">{ticket.ticketDetails.venue}</p>
              </div>
              <div>
                <p className="text-gray-600">Location</p>
                <p className="font-medium">{ticket.ticketDetails.location}</p>
              </div>
            </div>
          </div>

          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Purchase Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-gray-600">Ticket Quantity</p>
                <p className="font-medium">{ticket.count}</p>
              </div>
              <div className="flex justify-between">
                <p className="text-gray-600">Price per Ticket</p>
                <p className="font-medium">₹{ticket.ticketDetails.price}</p>
              </div>
              <div className="flex justify-between">
                <p className="text-gray-600">Total Amount</p>
                <p className="font-medium">
                  ₹{ticket.count * ticket.ticketDetails.price}
                </p>
              </div>
              <div>
                <p className="text-gray-600">Purchase Date</p>
                <p className="font-medium">
                  {new Date(ticket.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>

          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Event Description
            </h3>
            <p className="text-gray-600">{ticket.ticketDetails.description}</p>
          </div>
        </div>

        <div className="mt-8 flex justify-between items-center">
          <Link to="/my-tickets" className="text-blue-600 hover:text-blue-700">
            Back to My Tickets
          </Link>
          <button
            onClick={() => window.print()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Print Ticket
          </button>
        </div>
      </div>
    </div>
  );
}
