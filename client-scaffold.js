const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, 'uniFleet/client/src');

const dirs = ['hooks', 'pages', 'components'];
dirs.forEach(d => {
  const p = path.join(root, d);
  if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
});

// useSocket.js
fs.writeFileSync(path.join(root, 'hooks/useSocket.js'), `
import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3001';

export function useSocket(handlers = {}) {
  const socketRef = useRef(null);

  useEffect(() => {
    socketRef.current = io(SOCKET_URL);

    if (handlers.onBusLocation)
      socketRef.current.on('bus:location', handlers.onBusLocation);
    if (handlers.onAlertNew)
      socketRef.current.on('alert:new', handlers.onAlertNew);
    if (handlers.onAlertResolved)
      socketRef.current.on('alert:resolved', handlers.onAlertResolved);
    if (handlers.onParcelUpdated)
      socketRef.current.on('parcel:updated', handlers.onParcelUpdated);

    return () => socketRef.current.disconnect();
  }, []);

  return socketRef;
}
`);

// useAuth.js
fs.writeFileSync(path.join(root, 'hooks/useAuth.js'), `
import { useState, useEffect } from 'react';

export function useAuth() {
  const [token, setToken] = useState(localStorage.getItem('unifleet_token'));

  useEffect(() => {
    const handleStorageChange = () => {
      setToken(localStorage.getItem('unifleet_token'));
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return { token, setToken };
}
`);

// 11 Pages scaffold
const pages = [
  'DashboardPage', 'LiveMapPage', 'RoutesPage', 'FleetPage', 
  'DriversPage', 'TripsPage', 'ParcelsPage', 'BlacklistPage', 
  'RewardsPage', 'RatingsPage', 'EmergencyPage', 'LoginPage'
];

pages.forEach(p => {
  fs.writeFileSync(path.join(root, `pages/${p}.jsx`), `
import React from 'react';

export default function ${p}() {
  return (
    <div style={{ color: 'white' }}>
      <h1>${p}</h1>
      <p>This is a scaffolded page.</p>
    </div>
  );
}
`);
});

// Components scaffold
fs.writeFileSync(path.join(root, 'components/Sidebar.jsx'), `
import React from 'react';
import { Link } from 'react-router-dom';

export default function Sidebar() {
  return (
    <div style={{ width: '240px', background: 'var(--surface)', height: '100vh', position: 'fixed', color: '#fff', padding: '20px' }}>
      <h2>UniFleet</h2>
      <ul style={{ listStyle: 'none', padding: 0, marginTop: '30px' }}>
        <li><Link to="/" style={{ color: 'var(--accent)', textDecoration: 'none' }}>Dashboard</Link></li>
        <li><Link to="/map" style={{ color: 'white', textDecoration: 'none' }}>Live Map</Link></li>
        <li><Link to="/routes" style={{ color: 'white', textDecoration: 'none' }}>Routes</Link></li>
        <li><Link to="/fleet" style={{ color: 'white', textDecoration: 'none' }}>Fleet</Link></li>
        <li><Link to="/drivers" style={{ color: 'white', textDecoration: 'none' }}>Drivers</Link></li>
        <li><Link to="/login" style={{ color: '#ff5f6d', textDecoration: 'none', marginTop: '20px', display: 'block' }}>Logout (Login)</Link></li>
      </ul>
    </div>
  );
}
`);

fs.writeFileSync(path.join(root, 'components/Topbar.jsx'), `
import React from 'react';

export default function Topbar() {
  return (
    <div style={{ height: '60px', background: 'var(--surface2)', display: 'flex', alignItems: 'center', padding: '0 20px', color: '#fff' }}>
      <div style={{ flex: 1 }}>Top Navigation</div>
      <div>Admin User</div>
    </div>
  );
}
`);

// App.jsx
fs.writeFileSync(path.join(root, 'App.jsx'), `
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import LoginPage from './pages/LoginPage';
import { useAuth } from './hooks/useAuth';

// All page imports
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
  // Bypass auth check for scaffolding if token doesn't exist yet, but architecture specifies redirect:
  if (!token && import.meta.env.PROD) return <Navigate to="/login" replace />;
  // For local scaffold dev, we will allow it or we just create a fake token.
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg, #0b0f1a)' }}>
      <Sidebar />
      <div style={{ marginLeft: '240px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Topbar />
        <main style={{ padding: '24px 28px', flex: 1 }}>{children}</main>
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
`);

console.log('Client scaffold complete!');
