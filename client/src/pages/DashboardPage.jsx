import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../UserContext";
import axios from "axios";

export default function DashboardPage() {
  const navigate = useNavigate();
  const { user } = useUser();
  const [stats, setStats] = useState({
    totalEvents: 0,
    totalVenues: 0,
    upcomingEvents: 0,
    availableVenues: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [eventsResponse, venuesResponse] = await Promise.all([
        axios.get("http://localhost:4000/events", { withCredentials: true }),
        axios.get("http://localhost:4000/venues", { withCredentials: true }),
      ]);

      const events = eventsResponse.data;
      const venues = venuesResponse.data;

      // Filter events based on user role
      const userEvents = events.filter(
        (event) => event.organizer?._id === user._id
      );
      const userVenues = venues.filter(
        (venue) => venue.owner?._id === user._id
      );

      // Calculate stats
      setStats({
        totalEvents: userEvents.length,
        totalVenues: userVenues.length,
        upcomingEvents: userEvents.filter(
          (event) => new Date(event.date) >= new Date()
        ).length,
        availableVenues: userVenues.filter((venue) => venue.availability)
          .length,
      });
    } catch (err) {
      setError("Failed to fetch dashboard data");
      console.error("Error fetching dashboard data:", err);
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
      <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
        {error}
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Dashboard</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Total Events
          </h3>
          <p className="text-3xl font-bold text-blue-600">
            {stats.totalEvents}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Total Venues
          </h3>
          <p className="text-3xl font-bold text-blue-600">
            {stats.totalVenues}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Upcoming Events
          </h3>
          <p className="text-3xl font-bold text-blue-600">
            {stats.upcomingEvents}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Available Venues
          </h3>
          <p className="text-3xl font-bold text-blue-600">
            {stats.availableVenues}
          </p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {user.role === "organizer" && (
            <>
              <button
                onClick={() => navigate("/events/create")}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              >
                Create New Event
              </button>
              <button
                onClick={() => navigate("/my-events")}
                className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
              >
                View My Events
              </button>
            </>
          )}
          {user.role === "venue_owner" && (
            <>
              <button
                onClick={() => navigate("/venues/add")}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              >
                Add New Venue
              </button>
              <button
                onClick={() => navigate("/venues")}
                className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
              >
                Manage Venues
              </button>
            </>
          )}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Recent Activity
        </h2>
        <div className="space-y-4">
          {user.role === "organizer" ? (
            <p className="text-gray-600">
              Your recent events and bookings will appear here.
            </p>
          ) : (
            <p className="text-gray-600">
              Your venue bookings and inquiries will appear here.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
