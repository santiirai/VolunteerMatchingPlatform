import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import LoginForm from "./pages/Login";
import Signup from "./pages/Signup";
import LandingPage from "./pages/Landing";
import OrganizationDashboard from "./pages/OrganizationDashboard";
import VolunteerDashboard from "./pages/VolunteerDashboard";

export default function AppRoutes() {
    return (
        <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginForm />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/organization-dashboard" element={<OrganizationDashboard />} />
            <Route path="/volunteer-dashboard" element={<VolunteerDashboard />} />
            <Route path="/organization/dashboard" element={<OrganizationDashboard />} />
            <Route path="/volunteer/dashboard" element={<VolunteerDashboard />} />
        </Routes>
    )
}
