import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Homepage from "./pages/Homepage";
import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AdminDashboard from "./pages/AdminDashboard";
import DoctorDashboard from "./pages/DoctorDashboard";
import DoctorAvailability from "./pages/DoctorAvailability";
import UserActivity from "./pages/UserActivity";
import { useSelector } from "react-redux";
import Spinner from "./components/Spinner";
import ProtectedRoute from "./components/ProtectedRoute";
import PublicRoute from "./components/PublicRoute";
import ApplyDoctor from "./pages/ApplyDoctor";
import NotificationPage from "./pages/NotificationPage";
import Users from "./pages/admin/Users";
import Doctors from "./pages/admin/Doctors";
import Profile from "./pages/doctor/Profile";
import BookingPage from "./pages/BookingPage";
import Appointments from "./pages/Appointments";
import DoctorAppointments from "./pages/doctor/DoctorAppointments";
import DoctorPlanAssignment from "./pages/doctor/DoctorPlanAssignment";
import DoctorPatientMonitoring from "./pages/doctor/DoctorPatientMonitoring";
import DoctorConsultationReview from "./pages/doctor/DoctorConsultationReview";
import DoctorConsultation from "./pages/doctor/DoctorConsultation";
import PreConsultation from "./pages/PreConsultation";

function App() {
  const { loading } = useSelector((state) => state.alerts);
  return (
    <>
      <BrowserRouter>
        {loading ? (
          <Spinner />
        ) : (
          <>
            <Routes>
              <Route
                path="/apply-doctor"
                element={
                  <ProtectedRoute>
                    <ApplyDoctor />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/users"
                element={
                  <ProtectedRoute>
                    <Users />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/doctors"
                element={
                  <ProtectedRoute>
                    <Doctors />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/doctor/profile/:id"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/doctor/book-appointment/:doctorId"
                element={
                  <ProtectedRoute>
                    <BookingPage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/doctor/dashboard"
                element={
                  <ProtectedRoute>
                    <DoctorDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/doctor/availability"
                element={
                  <ProtectedRoute>
                    <DoctorAvailability />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/doctor/health-plans"
                element={
                  <ProtectedRoute>
                    <DoctorPlanAssignment />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/doctor/patient-monitoring"
                element={
                  <ProtectedRoute>
                    <DoctorPatientMonitoring />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/activity"
                element={
                  <ProtectedRoute>
                    <UserActivity />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/dashboard"
                element={
                  <ProtectedRoute>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/notification"
                element={
                  <ProtectedRoute>
                    <NotificationPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/"
                element={
                  <PublicRoute>
                    <LandingPage />
                  </PublicRoute>
                }
              />
              <Route
                path="/home"
                element={
                  <ProtectedRoute>
                    <Homepage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/appointments"
                element={
                  <ProtectedRoute>
                    <Appointments />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/doctor-appointments"
                element={
                  <ProtectedRoute>
                    <DoctorAppointments />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/pre-consultation/:appointmentId"
                element={
                  <ProtectedRoute>
                    <PreConsultation />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/doctor/consultation/:appointmentId"
                element={
                  <ProtectedRoute>
                    <DoctorConsultation />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/login"
                element={
                  <PublicRoute>
                    <Login />
                  </PublicRoute>
                }
              />
              <Route
                path="/register"
                element={
                  <PublicRoute>
                    <Register />
                  </PublicRoute>
                }
              />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </>
        )}
      </BrowserRouter>
    </>
  );
}

export default App;
