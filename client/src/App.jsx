/* eslint-disable no-unused-vars */
import { Routes, Route, Navigate } from "react-router-dom";
import "./App.css";
import IndexPage from "./pages/IndexPage";
import RegisterPage from "./pages/RegisterPage";
import Layout from "./Layout";
import LoginPage from "./pages/LoginPage";
import axios from "axios";
import { UserContextProvider, useUser } from "./UserContext";
import UserAccountPage from "./pages/UserAccountPage";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import EventPage from "./pages/EventPage";
import CalendarView from "./pages/CalendarView";
import OrderSummary from "./pages/OrderSummary";
import PaymentSummary from "./pages/PaymentSummary";
import TicketPage from "./pages/TicketPage";
import VenueListPage from "./pages/VenueListPage";
import EventCreatePage from "./pages/EventCreatePage";
import HomePage from "./pages/HomePage";
import AddVenuePage from "./pages/AddVenuePage";
import DashboardPage from "./pages/DashboardPage";
import ProfilePage from "./pages/ProfilePage";
import MyEventsPage from "./pages/MyEventsPage";
import EventDetailsPage from "./pages/EventDetailsPage";
import VenueDetailsPage from "./pages/VenueDetailsPage";
import MyVenuesPage from "./pages/MyVenuesPage";
import TicketDetailsPage from "./pages/TicketDetailsPage";
import MyTicketsPage from "./pages/MyTicketsPage";

axios.defaults.baseURL = "http://localhost:4000/";
axios.defaults.withCredentials = true;

function PrivateRoute({ children, allowedRoles }) {
  const { user, loading } = useUser();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" />;
  }

  return children;
}

function App() {
  return (
    <UserContextProvider>
      <Routes>
        {/* Public routes */}
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgotpassword" element={<ForgotPassword />} />
        <Route path="/resetpassword" element={<ResetPassword />} />

        {/* Protected routes with layout */}
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/event/:id" element={<EventDetailsPage />} />
          <Route path="/venues/:id" element={<VenueDetailsPage />} />
          <Route path="/calendar" element={<CalendarView />} />
          <Route path="/wallet" element={<TicketPage />} />
          <Route path="/event/:id/ordersummary" element={<OrderSummary />} />
          <Route
            path="/event/:id/ordersummary/paymentsummary"
            element={<PaymentSummary />}
          />
          <Route path="/tickets/:ticketId" element={<TicketDetailsPage />} />
          <Route
            path="/my-tickets"
            element={
              <PrivateRoute allowedRoles={["user"]}>
                <MyTicketsPage />
              </PrivateRoute>
            }
          />

          {/* Venue Owner Routes */}
          <Route
            path="/venues"
            element={
              <PrivateRoute allowedRoles={["venue_owner"]}>
                <VenueListPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/venues/add"
            element={
              <PrivateRoute allowedRoles={["venue_owner"]}>
                <AddVenuePage />
              </PrivateRoute>
            }
          />

          {/* Event Organizer Routes */}
          <Route
            path="/events/create"
            element={
              <PrivateRoute allowedRoles={["organizer"]}>
                <EventCreatePage />
              </PrivateRoute>
            }
          />
          <Route
            path="/my-events"
            element={
              <PrivateRoute allowedRoles={["organizer"]}>
                <MyEventsPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/my-venues"
            element={
              <PrivateRoute allowedRoles={["venue_owner"]}>
                <MyVenuesPage />
              </PrivateRoute>
            }
          />
        </Route>
      </Routes>
    </UserContextProvider>
  );
}

export default App;
