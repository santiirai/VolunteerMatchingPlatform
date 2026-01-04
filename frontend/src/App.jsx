import { Routes, Route, Link } from 'react-router-dom';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Landing from './pages/Landing';
import OrganizationDashboard from './pages/OrganizationDashboard';
import VolunteerDashboard from './pages/VolunteerDashboard';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/organization-dashboard" element={<OrganizationDashboard />} />
      <Route path="/volunteer-dashboard" element={<VolunteerDashboard />} />
    </Routes>
  );
}

export default App;
