import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, LineChart, Line, CartesianGrid } from 'recharts';
import StatCard from '../components/StatCard';
import LiveMap from '../components/LiveMap';
import Pill from '../components/Pill';
import { getDashboardStats, getAlerts, getDrivers } from '../services/api';
import { useSocket } from '../hooks/useSocket';

function timeAgo(dateStr) {
  const diff = (Date.now() - new Date(dateStr)) / 1000;
  if (diff < 60) return `${Math.floor(diff)}s ago`;
  if (diff < 3600) return `${Math.floor(diff/60)}m ago`;
  return `${Math.floor(diff/3600)}h ago`;
}

export default function DashboardPage() {
  const [stats, setStats] = useState({ buses: 18, routes: 12, students: 342, parcels: 4 });
  const [alerts, setAlerts] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [busPositions, setBusPositions] = useState([]);
  const [emergencyAlert, setEmergencyAlert] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    getDashboardStats().then(r => setStats(prev => ({...prev, ...r.data}))).catch(() => {});
    getAlerts().then(r => {
      const active = r.data.filter(a => a.status === 'active');
      setAlerts(active.slice(0, 4));
      if (active.length > 0) setEmergencyAlert(active[0]);
    }).catch(() => {});
    getDrivers().then(r => setDrivers(r.data.slice(0, 5))).catch(() => {});
  }, []);

  const weeklyTripsData = [
    { name: 'Mon', trips: 35 },
    { name: 'Tue', trips: 82 },
    { name: 'Wed', trips: 42 },
    { name: 'Thu', trips: 78 },
    { name: 'Fri', trips: 0 },
    { name: 'Sat', trips: 4 },
    { name: 'Sun', trips: 76 }
  ];

  const driverRatingData = [
    { name: 'Khalid', rating: 4.9 },
    { name: 'Sami', rating: 4.2 },
    { name: 'Omar', rating: 4.5 },
    { name: 'Laith', rating: 4.8 },
    { name: 'Ahmad', rating: 4.4 }
  ];

  useSocket({
    onBusLocation: (data) => {
      setBusPositions(prev => {
        const idx = prev.findIndex(b => b.busId === data.busId);
        if (idx >= 0) { const u = [...prev]; u[idx] = data; return u; }
        return [...prev, data];
      });
    },
    onAlertNew: (alert) => {
      setEmergencyAlert(alert);
      setAlerts(prev => [alert, ...prev].slice(0, 4));
    },
  });

  const location = useLocation();
  const searchQuery = new URLSearchParams(location.search).get('q') || '';
  const q = searchQuery.toLowerCase();

  const dummyAlerts = [
    { id: 'demo-1', isDummy: true, type: 'warning', icon: '⚡', title: 'Route 5B — 18 min delay', text: 'Heavy traffic near South Campus junction', time: '28m ago', searchStr: 'route 5b delay heavy traffic junction' },
    { id: 'demo-2', isDummy: true, type: 'info', icon: 'ℹ️', title: 'Special Trip Scheduled', text: 'Tomorrow 08:00 — Admin approval pending', time: '1h ago', searchStr: 'special trip scheduled admin approval' }
  ];
  
  const displayAlerts = alerts.length > 0 ? alerts : dummyAlerts;

  const filteredAlerts = displayAlerts.filter(a => {
    if (!q) return true;
    if (a.isDummy) return a.searchStr.includes(q);
    return a.message?.toLowerCase().includes(q) || 
           a.bus?.plateNumber?.toLowerCase().includes(q) ||
           a.studentId?.toLowerCase().includes(q);
  });

  const maleNames = ['Khalid Amin', 'Sami Mohammed', 'Omar Tariq', 'Laith Haddad', 'Ahmad Saleh'];
  const mockDataArray = [
    { rating: 4.9, trips: 5, statusOverride: 'en-route', route: 'Route 2A', bus: 'Bus #3' },
    { rating: 4.2, trips: 3, statusOverride: 'emergency', route: 'Route 3C', bus: 'Bus #7' },
    { rating: 4.5, trips: 4, statusOverride: 'en-route', route: 'Route 4D', bus: 'Bus #11' },
    { rating: 4.8, trips: 6, statusOverride: 'active', route: 'Route 1B', bus: 'Bus #14' },
    { rating: 4.4, trips: 2, statusOverride: 'active', route: 'Route 5A', bus: 'Bus #5' }
  ];

  const baseDriversArray = drivers.length >= 5 ? drivers : [
    { id: 'd1', name: 'Mock' }, { id: 'd2', name: 'Mock' }, { id: 'd3', name: 'Mock' }, { id: 'd4', name: 'Mock' }, { id: 'd5', name: 'Mock' }
  ];

  const enrichedDrivers = baseDriversArray.map((d, i) => {
    return { ...d, displayName: maleNames[i % 5], sdoc: mockDataArray[i % 5] };
  });

  const filteredDrivers = enrichedDrivers.filter(d => 
    !q || 
    d.displayName.toLowerCase().includes(q) || 
    d.sdoc.bus.toLowerCase().includes(q) || 
    d.sdoc.route.toLowerCase().includes(q) ||
    d.sdoc.statusOverride.toLowerCase().includes(q)
  );

  return (
    <div className="content">
      {/* Emergency Banner */}
      {emergencyAlert && (
        <div className="emergency-banner">
          <span className="emergency-icon">🚨</span>
          <div className="emergency-text">
            <strong>ACTIVE EMERGENCY — {emergencyAlert.bus?.plateNumber || 'Bus'}</strong>
            <p>
              Student panic button triggered · GPS: {emergencyAlert.lat?.toFixed(4)}°N, {emergencyAlert.lng?.toFixed(4)}°E
              · {timeAgo(emergencyAlert.createdAt)}
            </p>
          </div>
          <div className="emergency-actions">
            <button className="btn btn-danger" style={{ padding: '6px 14px', fontSize: '0.78rem' }}
              onClick={() => navigate('/emergency')}>View Alert</button>
            <button className="btn btn-ghost" style={{ padding: '6px 14px', fontSize: '0.78rem' }}
              onClick={() => setEmergencyAlert(null)}>Dismiss</button>
          </div>
        </div>
      )}

      {/* Stat Cards */}
      <div className="stats-grid">
        <StatCard icon="🚌" label="ACTIVE BUSES" value={stats.buses} trend="↑ 3 more than yesterday" />
        <StatCard icon="⤷" label="ACTIVE ROUTES" value={stats.routes || 12} trend="All systems normal" />
        <StatCard icon="👥" label="STUDENTS ON BOARD" value={stats.students} trend="↑ 5.2% this week" />
        <StatCard icon="📦" label="PENDING PARCELS" value={stats.parcels || 4} trend="↑ 2 new since morning" />
      </div>

      {/* Map + Alerts */}
      <div className="dashboard-grid">
        <div className="panel">
          <div className="panel-header">
            <div className="panel-title">🗺 Live Bus Locations</div>
            <button className="panel-action" onClick={() => navigate('/map')}>Full Map →</button>
          </div>
          <LiveMap buses={busPositions} height="300px" />
        </div>

        <div className="panel">
          <div className="panel-header">
            <div className="panel-title">🚨 Emergency Console</div>
            <button className="panel-action" onClick={() => navigate('/emergency')}>View All →</button>
          </div>
          <div>
            {filteredAlerts.length === 0 && searchQuery && (
              <div style={{ color: 'var(--muted)', fontSize: '0.85rem', textAlign: 'center', padding: '30px 0' }}>
                No search results found
              </div>
            )}
            {!searchQuery && alerts.length === 0 && filteredAlerts.length === 0 && (
              <div style={{ color: 'var(--muted)', fontSize: '0.85rem', textAlign: 'center', padding: '30px 0' }}>
                ✅ No active emergencies
              </div>
            )}
            {filteredAlerts.map((alert) => {
              if (alert.isDummy) {
                return (
                  <div key={alert.id} className={`alert-item ${alert.type}`}>
                    <span className="alert-icon">{alert.icon}</span>
                    <div className="alert-text">
                      <div className="alert-title">{alert.title}</div>
                      <div className="alert-desc">{alert.text}</div>
                    </div>
                    <span className="alert-time">{alert.time}</span>
                  </div>
                );
              }
              return (
                <div key={alert.id} className="alert-item critical">
                  <span className="alert-icon">⚠️</span>
                  <div className="alert-text">
                    <div className="alert-title">Panic — Student #{alert.studentId?.slice(-6)}</div>
                    <div className="alert-desc">Bus {alert.bus?.plateNumber} · {alert.message || 'Emergency triggered'}</div>
                  </div>
                  <span className="alert-time">{timeAgo(alert.createdAt)}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Charts row */}
      <div className="dashboard-grid-2">
        <div className="panel">
          <div className="panel-header">
            <div className="panel-title">📈 Weekly Trips</div>
          </div>
          <div style={{ height: '220px', width: '100%', marginTop: '10px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyTripsData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--muted)' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--muted)' }} />
                <RechartsTooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} contentStyle={{ background: 'var(--surface2)', border: 'none', borderRadius: '8px', color: 'var(--text)' }} />
                <Bar dataKey="trips" fill="var(--accent)" radius={[4, 4, 0, 0]} barSize={28} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="panel">
          <div className="panel-header">
            <div className="panel-title" style={{ textTransform: 'uppercase', letterSpacing: '1px', fontSize: '1rem' }}>⭐ DRIVER RATING</div>
          </div>
          <div style={{ height: '220px', width: '100%', marginTop: '10px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={driverRatingData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--muted)' }} dy={10} />
                <YAxis domain={[3.5, 5.0]} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--muted)' }} />
                <RechartsTooltip contentStyle={{ background: 'var(--surface2)', border: 'none', borderRadius: '8px', color: 'var(--text)' }} />
                <Line type="monotone" dataKey="rating" stroke="var(--accent2)" strokeWidth={3} dot={{ r: 4, fill: 'var(--accent2)', strokeWidth: 0 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Driver Table */}
      <div className="panel">
        <div className="panel-header">
          <div className="panel-title">👤 Recent Driver Activity</div>
          <button className="panel-action" onClick={() => navigate('/drivers')}>Manage →</button>
        </div>
        <table>
          <thead>
            <tr>
              <th>DRIVER</th>
              <th>BUS</th>
              <th>ROUTE</th>
              <th>STATUS</th>
              <th>RATING</th>
              <th>TRIPS TODAY</th>
            </tr>
          </thead>
          <tbody>
            {filteredDrivers.length === 0 && (
              <tr><td colSpan={6} style={{ textAlign: 'center', color: 'var(--muted)', padding: '20px' }}>No driver data found</td></tr>
            )}
            {filteredDrivers.map((d, i) => {
              const colors = ['var(--accent)', 'var(--accent4)', 'var(--accent2)', 'var(--warn)', 'var(--accent3)'];
              const bgs = ['rgba(59,130,246,.15)', 'rgba(16,185,129,.12)', 'rgba(129,140,248,.12)', 'rgba(245,158,11,.12)', 'rgba(239,68,68,.12)'];
              const initials = d.displayName.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase();
              
              const sdoc = d.sdoc;
              const renderStatus = d.status === 'fault' || d.status === 'emergency' ? 'emergency' : sdoc.statusOverride;

              return (
                <tr key={d.id}>
                  <td>
                    <div className="driver-cell">
                      <div className="mini-avatar" style={{ background: bgs[i%5], color: colors[i%5] }}>{initials}</div>
                      {d.displayName}
                    </div>
                  </td>
                  <td style={{ fontWeight: 500 }}>{sdoc.bus}</td>
                  <td style={{ color: 'var(--muted)' }}>{sdoc.route}</td>
                  <td><Pill status={renderStatus} /></td>
                  <td style={{ color: 'var(--text)', fontSize: '0.8rem' }}>
                    <span style={{ color: 'var(--warn)', marginRight: '6px', letterSpacing: '2px' }}>★★★★★</span>
                    {sdoc.rating}
                  </td>
                  <td style={{ textAlign: 'center', fontWeight: 'bold' }}>{sdoc.trips}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
