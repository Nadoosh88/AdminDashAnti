import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import LoginPage from './pages/LoginPage';
import { useAuth } from './hooks/useAuth';

import DashboardPage   from './pages/DashboardPage';
import LiveMapPage     from './pages/LiveMapPage';
import RoutesPage      from './pages/RoutesPage';
import FleetPage       from './pages/FleetPage';
import DriversPage     from './pages/DriversPage';
import TripsPage       from './pages/TripsPage';
import ParcelsPage     from './pages/ParcelsPage';
import BlacklistPage   from './pages/BlacklistPage';
import RewardsPage     from './pages/RewardsPage';
import RatingsPage     from './pages/RatingsPage';
import EmergencyPage   from './pages/EmergencyPage';

function ProtectedLayout({ children }) {
  const { token } = useAuth();
  if (!token) return <Navigate to="/login" replace />;
  return (
    <div style={{ display: 'flex', minHeight: '100vh', width: '100%' }}>
      <Sidebar />
      <div className="main">
        <Topbar />
        {children}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<ProtectedLayout><DashboardPage /></ProtectedLayout>} />
        <Route path="/map"       element={<ProtectedLayout><LiveMapPage /></ProtectedLayout>} />
        <Route path="/routes"    element={<ProtectedLayout><RoutesPage /></ProtectedLayout>} />
        <Route path="/fleet"     element={<ProtectedLayout><FleetPage /></ProtectedLayout>} />
        <Route path="/drivers"   element={<ProtectedLayout><DriversPage /></ProtectedLayout>} />
        <Route path="/trips"     element={<ProtectedLayout><TripsPage /></ProtectedLayout>} />
        <Route path="/parcels"   element={<ProtectedLayout><ParcelsPage /></ProtectedLayout>} />
        <Route path="/blacklist" element={<ProtectedLayout><BlacklistPage /></ProtectedLayout>} />
        <Route path="/rewards"   element={<ProtectedLayout><RewardsPage /></ProtectedLayout>} />
        <Route path="/ratings"   element={<ProtectedLayout><RatingsPage /></ProtectedLayout>} />
        <Route path="/emergency" element={<ProtectedLayout><EmergencyPage /></ProtectedLayout>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
