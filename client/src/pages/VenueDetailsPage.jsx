import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import { getRandomVenueImages } from "../utils/imageUtils";

export default function VenueDetailsPage() {
  const [venue, setVenue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [venueImages, setVenueImages] = useState([]);
  const [imageError, setImageError] = useState(false);

  const { id } = useParams();

  useEffect(() => {
    fetchVenueDetails();
  }, [id]);

  const fetchVenueDetails = async () => {
    try {
      console.log("Fetching venue details for ID:", id);
      const response = await axios.get(`http://localhost:4000/venues/${id}`, {
        withCredentials: true,
      });
      console.log("Venue data received:", response.data);

      if (!response.data) {
        throw new Error("Venue not found");
      }

      setVenue(response.data);

      // Generate random images for the venue
      const images = getRandomVenueImages(3); // Get 3 random images
      setVenueImages(images);
    } catch (err) {
      console.error("Error fetching venue details:", err);
      if (err.response) {
        console.error("Error response:", err.response.data);
        setError(err.response.data.message || "Failed to fetch venue details");
      } else if (err.request) {
        console.error("No response received:", err.request);
        setError("No response from server. Please check your connection.");
      } else {
        console.error("Error setting up request:", err.message);
        setError("Error: " + err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleImageError = () => {
    setImageError(true);
    // Replace the failed image with a fallback image
    const fallbackImage =
      "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3";
    setVenueImages((prevImages) =>
      prevImages.map((img) => (img === venueImages[0] ? fallbackImage : img))
    );
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
            onClick={fetchVenueDetails}
            className="mt-2 text-sm underline hover:text-red-700"
          >
            Try again
          </button>
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

  if (!venue) {
    return (
      <div className="max-w-4xl mx-auto p-4 text-center py-12">
        <h2 className="text-2xl font-semibold text-gray-900">
          Venue not found
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
      {/* Venue Header */}
      <div className="mb-8">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {venue.name}
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
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                  />
                </svg>
                {venue.contact}
              </span>
            </div>
          </div>
          <Link
            to="/events/create"
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Book This Venue
          </Link>
        </div>
      </div>

      {/* Venue Images */}
      <div className="mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {venueImages.map((image, index) => (
            <div key={index} className="relative h-64">
              <img
                src={image}
                alt={`${venue.name} - Image ${index + 1}`}
                className="w-full h-full object-cover rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300"
                onError={handleImageError}
              />
              {imageError && index === 0 && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg">
                  <span className="text-gray-500">Image not available</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Venue Details */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Venue Details
        </h2>
        <div className="space-y-4">
          <p className="text-gray-700">{venue.description}</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-medium text-gray-900">Capacity</h3>
              <p className="text-gray-600">{venue.capacity} people</p>
            </div>
            <div>
              <h3 className="font-medium text-gray-900">Price per Hour</h3>
              <p className="text-gray-600">₹{venue.pricePerHour}</p>
            </div>
            <div>
              <h3 className="font-medium text-gray-900">Available Hours</h3>
              <p className="text-gray-600">
                {venue.availableHours?.start} - {venue.availableHours?.end}
              </p>
            </div>
            <div>
              <h3 className="font-medium text-gray-900">Amenities</h3>
              <ul className="list-disc list-inside text-gray-600">
                {venue.amenities?.map((amenity, index) => (
                  <li key={index}>{amenity}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Venue Owner */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Venue Owner
        </h2>
        <div className="flex items-center">
          <div>
            <h3 className="font-medium text-gray-900">{venue.owner?.name}</h3>
            <p className="text-gray-600">{venue.owner?.email}</p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end space-x-4">
        <Link
          to="/events/create"
          className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
        >
          Book This Venue
        </Link>
      </div>
    </div>
  );
}
