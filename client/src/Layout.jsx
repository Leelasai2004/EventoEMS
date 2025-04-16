import { Link, useNavigate, Outlet } from "react-router-dom";
import { useUser } from "./UserContext";

export default function Layout() {
  const navigate = useNavigate();
  const { user, logout } = useUser();

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="text-2xl font-bold text-blue-600">
                EventoEMS
              </Link>
            </div>

            <div className="flex items-center space-x-4">
              {user ? (
                <>
                  {/* Common Links for all logged-in users */}
                  <Link
                    to="/dashboard"
                    className="text-gray-600 hover:text-blue-600 px-4 py-2 rounded-md text-sm font-medium"
                  >
                    Dashboard
                  </Link>

                  {/* Regular User Menu */}
                  {user.role === "user" && (
                    <>
                      <Link
                        to="/"
                        className="text-gray-600 hover:text-blue-600 px-4 py-2 rounded-md text-sm font-medium"
                      >
                        Browse Events
                      </Link>
                      <Link
                        to="/my-tickets"
                        className="text-gray-600 hover:text-blue-600 px-4 py-2 rounded-md text-sm font-medium"
                      >
                        My Tickets
                      </Link>
                    </>
                  )}

                  {/* Venue Owner Menu */}
                  {user.role === "venue_owner" && (
                    <>
                      <Link
                        to="/venues"
                        className="text-gray-600 hover:text-blue-600 px-4 py-2 rounded-md text-sm font-medium"
                      >
                        My Venues
                      </Link>
                      <Link
                        to="/venues/add"
                        className="text-gray-600 hover:text-blue-600 px-4 py-2 rounded-md text-sm font-medium"
                      >
                        Add Venue
                      </Link>
                    </>
                  )}

                  {/* Event Organizer Menu */}
                  {user.role === "organizer" && (
                    <>
                      <Link
                        to="/events/create"
                        className="text-gray-600 hover:text-blue-600 px-4 py-2 rounded-md text-sm font-medium"
                      >
                        Create Event
                      </Link>
                      <Link
                        to="/my-events"
                        className="text-gray-600 hover:text-blue-600 px-4 py-2 rounded-md text-sm font-medium"
                      >
                        My Events
                      </Link>
                    </>
                  )}

                  {/* User Menu Dropdown */}
                  <div className="relative group">
                    <button className="flex items-center space-x-2 text-gray-700 hover:text-blue-600">
                      <span>{user.name}</span>
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </button>
                    <div className="absolute right-0 w-48 mt-2 py-2 bg-white rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                      <Link
                        to="/profile"
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Profile
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Logout
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="text-gray-600 hover:text-blue-600 px-4 py-2 rounded-md text-sm font-medium"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700"
                  >
                    Register
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-gray-600">
              © {new Date().getFullYear()} EventoEMS. All rights reserved.
            </div>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="text-gray-600 hover:text-blue-600">
                About
              </a>
              <a href="#" className="text-gray-600 hover:text-blue-600">
                Contact
              </a>
              <a href="#" className="text-gray-600 hover:text-blue-600">
                Privacy Policy
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
