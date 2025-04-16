import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../UserContext";
import axios from "axios";

export default function VenueListPage() {
  const navigate = useNavigate();
  const { user } = useUser();
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchVenues();
  }, []);

  const fetchVenues = async () => {
    try {
      const response = await axios.get("http://localhost:4000/venues", {
        withCredentials: true,
      });
      setVenues(response.data);
    } catch (err) {
      console.error("Error fetching venues:", err);
      setError("Failed to fetch venues");
    } finally {
      setLoading(false);
    }
  };

  const handleAvailabilityUpdate = async (venueId, currentAvailability) => {
    try {
      const response = await axios.put(
        `http://localhost:4000/venues/${venueId}/availability`,
        { availability: !currentAvailability },
        {
          withCredentials: true,
        }
      );

      if (response.data) {
        setVenues((prevVenues) =>
          prevVenues.map((venue) =>
            venue._id === venueId
              ? { ...venue, availability: !currentAvailability }
              : venue
          )
        );
      }
    } catch (error) {
      console.error("Error updating availability:", error);
      alert(
        error.response?.data?.error ||
          error.response?.data?.details ||
          "Failed to update availability"
      );
    }
  };

  if (!user || user.role !== "venue_owner") {
    return (
      <div className="text-center py-8">
        <h2 className="text-2xl font-semibold text-red-600">Access Denied</h2>
        <p className="text-gray-600 mt-2">
          Only venue owners can access this page.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
        {error}
      </div>
    );
  }

  const userVenues = venues.filter((venue) => venue.owner._id === user._id);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Venues</h1>
        <button
          onClick={() => navigate("/venues/add")}
          className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700"
        >
          Add New Venue
        </button>
      </div>

      {userVenues.length === 0 ? (
        <div className="text-center py-12">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No Venues Added Yet
          </h3>
          <p className="text-gray-600 mb-4">
            Start by adding your first venue to manage your event spaces.
          </p>
          <button
            onClick={() => navigate("/venues/add")}
            className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700"
          >
            Add Your First Venue
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {userVenues.map((venue) => (
            <div
              key={venue._id}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200"
            >
              {(
                <img
                  src="https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3"
                  alt={venue.name}
                  className="w-full h-48 object-cover"
                />
              )}
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {venue.name}
                </h3>
                <p className="text-gray-600 mb-4">{venue.address}</p>

                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Capacity:</span>
                    <span className="font-medium">{venue.capacity} people</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Price per day:</span>
                    <span className="font-medium">${venue.pricePerDay}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Rating:</span>
                    <span className="font-medium">
                      {venue.rating ? venue.rating.toFixed(1) : "No ratings"}
                    </span>
                  </div>
                </div>

                {venue.amenities && venue.amenities.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">
                      Amenities
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {venue.amenities.map((amenity, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-gray-100 text-gray-600 text-sm rounded-full"
                        >
                          {amenity}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex justify-between items-center">
                  <button
                    onClick={() =>
                      handleAvailabilityUpdate(venue._id, venue.availability)
                    }
                    className={`px-4 py-2 rounded-md text-sm font-medium ${
                      venue.availability
                        ? "bg-red-600 text-white hover:bg-red-700"
                        : "bg-blue-600 text-white hover:bg-blue-700"
                    }`}
                  >
                    {venue.availability ? "Mark Unavailable" : "Mark Available"}
                  </button>
                  <button
                    onClick={() => navigate(`/venues/${venue._id}`)}
                    className="text-blue-600 hover:text-blue-700 font-medium"
                  >
                    View Details →
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
