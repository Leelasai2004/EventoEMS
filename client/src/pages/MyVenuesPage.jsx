import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { getRandomVenueImages } from "../utils/imageUtils";

export default function MyVenuesPage() {
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [venueImages, setVenueImages] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    fetchMyVenues();
  }, []);

  const fetchMyVenues = async () => {
    try {
      console.log("Fetching venues...");
      const response = await axios.get("http://localhost:4000/venues", {
        withCredentials: true,
        params: { owner: true },
      });
      console.log("Venues response:", response.data);

      if (!Array.isArray(response.data)) {
        throw new Error("Invalid response format");
      }

      setVenues(response.data);

      // Generate random images for each venue
      const images = {};
      response.data.forEach((venue) => {
        images[venue._id] = getRandomVenueImages(1)[0];
      });
      setVenueImages(images);
    } catch (err) {
      console.error("Error fetching venues:", err);
      if (err.response?.status === 401) {
        // Unauthorized - redirect to login
        navigate("/login");
      } else if (err.response?.status === 403) {
        // Forbidden - user is not a venue owner
        setError(
          "You don't have permission to view venues. Please login as a venue owner."
        );
      } else if (err.response) {
        setError(err.response.data.error || "Failed to fetch venues");
      } else if (err.request) {
        setError("No response from server. Please check your connection.");
      } else {
        setError("Error: " + err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (venueId) => {
    if (!window.confirm("Are you sure you want to delete this venue?")) {
      return;
    }

    try {
      await axios.delete(`http://localhost:4000/venues/${venueId}`, {
        withCredentials: true,
      });
      setVenues(venues.filter((venue) => venue._id !== venueId));
      // Remove the image from venueImages state
      setVenueImages((prev) => {
        const newImages = { ...prev };
        delete newImages[venueId];
        return newImages;
      });
    } catch (err) {
      console.error("Error deleting venue:", err);
      if (err.response?.status === 401) {
        navigate("/login");
      } else if (err.response?.status === 403) {
        alert("You don't have permission to delete this venue.");
      } else {
        alert(err.response?.data?.error || "Failed to delete venue");
      }
    }
  };

  const handleImageError = (venueId) => {
    // Replace the failed image with a fallback image
    const fallbackImage =
      "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3";
    setVenueImages((prev) => ({
      ...prev,
      [venueId]: fallbackImage,
    }));
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
            onClick={fetchMyVenues}
            className="mt-2 text-sm underline hover:text-red-700"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Venues</h1>
        <Link
          to="/venues/create"
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          Add New Venue
        </Link>
      </div>

      {venues.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600">
            You haven&apos;t added any venues yet.
          </p>
          <Link
            to="/venues/create"
            className="text-blue-600 hover:text-blue-700 mt-2 inline-block"
          >
            Add your first venue
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {venues.map((venue) => (
            <div
              key={venue._id}
              className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-300"
            >
              <div className="relative h-48">
                <img
                  src={venueImages[venue._id]}
                  alt={venue.name}
                  className="w-full h-full object-cover"
                  onError={() => handleImageError(venue._id)}
                />
                <div className="absolute top-2 right-2">
                  <button
                    onClick={() => handleDelete(venue._id)}
                    className="bg-red-600 text-white p-2 rounded-full hover:bg-red-700"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                </div>
              </div>
              <div className="p-4">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  {venue.name}
                </h2>
                <div className="space-y-2 text-gray-600">
                  <p className="flex items-center">
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
                    {venue.address}
                  </p>
                  <p className="flex items-center">
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
                        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                      />
                    </svg>
                    {venue.contact}
                  </p>
                  <p className="flex items-center">
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
                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                    </svg>
                    Capacity: {venue.capacity} people
                  </p>
                  <p className="flex items-center">
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
                        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    ₹{venue.pricePerDay}/day
                  </p>
                </div>
                <div className="mt-4">
                  <Link
                    to={`/venues/${venue._id}`}
                    className="text-blue-600 hover:text-blue-700"
                  >
                    View Details →
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
