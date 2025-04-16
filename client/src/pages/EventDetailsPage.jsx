import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import { getRandomEventImages } from "../utils/imageUtils";

export default function EventDetailsPage() {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [images, setImages] = useState([]);

  useEffect(() => {
    fetchEventDetails();
    // Set random images when component mounts
    setImages(getRandomEventImages(3));
  }, [id]);

  const fetchEventDetails = async () => {
    try {
      console.log("Fetching event details for ID:", id);
      const response = await axios.get(`http://localhost:4000/events/${id}`, {
        withCredentials: true,
      });
      console.log("Event data received:", response.data);
      setEvent(response.data);
    } catch (err) {
      console.error("Error fetching event details:", err);
      setError(err.response?.data?.message || "Failed to fetch event details");
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
          {error}
        </div>
        <Link
          to="/"
          className="text-blue-600 hover:text-blue-700 mt-4 inline-block"
        >
          Return to Home
        </Link>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="max-w-4xl mx-auto p-4 text-center py-12">
        <h2 className="text-2xl font-semibold text-gray-900">
          Event not found
        </h2>
        <Link
          to="/"
          className="text-blue-600 hover:text-blue-700 mt-2 inline-block"
        >
          Return to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      {/* Event Header */}
      <div className="mb-8">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {event.title}
            </h1>
            <div className="flex items-center text-gray-600">
              <span className="mr-4">
                <svg
                  className="w-5 h-5 inline mr-1"
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
                {new Date(event.date).toLocaleDateString()}
              </span>
              <span>
                <svg
                  className="w-5 h-5 inline mr-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                {event.time}
              </span>
            </div>
          </div>
          <Link
            to={`/event/${event._id}/ordersummary`}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Book Event
          </Link>
        </div>
      </div>

      {/* Event Images */}
      <div className="mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {images.map((image, index) => (
            <img
              key={index}
              src={image}
              alt={`${event.title} - Image ${index + 1}`}
              className="w-full h-64 object-cover rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300"
            />
          ))}
        </div>
      </div>

      {/* Event Details */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Event Details
        </h2>
        <div className="space-y-4">
          <p className="text-gray-700">{event.description}</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-medium text-gray-900">Venue</h3>
              <p className="text-gray-600">{event.venue?.name}</p>
            </div>
            <div>
              <h3 className="font-medium text-gray-900">Price</h3>
              <p className="text-gray-600">₹{event.price}</p>
            </div>
            <div>
              <h3 className="font-medium text-gray-900">Requirements</h3>
              <ul className="list-disc list-inside text-gray-600">
                {event.requirements?.map((req, index) => (
                  <li key={index}>{req}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end space-x-4">
        <Link
          to={`/event/${event._id}/ordersummary`}
          className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
        >
          Book Event
        </Link>
      </div>
    </div>
  );
}
