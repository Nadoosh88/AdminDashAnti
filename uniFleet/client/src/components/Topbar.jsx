import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getAlerts, getTrips, getParcels } from '../services/api';

const pageTitles = {
  '/': { title: 'Dashboard Overview', sub: 'Real-time monitoring active' },
  '/map': { title: 'Live Bus Map', sub: 'All routes — GPS tracking active' },
  '/routes': { title: 'Route & Stop Management', sub: 'Configure university bus routes and stops' },
  '/fleet': { title: 'Bus Fleet Management', sub: 'Manage all university buses' },
  '/drivers': { title: 'Driver Management', sub: 'Assign and monitor drivers' },
  '/trips': { title: 'Special Trips', sub: 'Schedule and manage special trips' },
  '/parcels': { title: 'Parcel Console', sub: 'Track parcels across trips' },
  '/blacklist': { title: 'Blacklist System', sub: 'Manage student restrictions' },
  '/rewards': { title: 'Rewards Configuration', sub: 'Configure loyalty point rules' },
  '/ratings': { title: 'Ratings Analytics', sub: 'Driver performance analytics' },
  '/emergency': { title: 'Emergency Console', sub: 'Active alerts and emergency management' },
};

export default function Topbar() {
  const location = useLocation();
  const info = pageTitles[location.pathname] || { title: 'UniFleet', sub: '' };

  const now = new Date();
  const dateStr = now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

  const navigate = useNavigate();
  const qParam = new URLSearchParams(location.search).get('q') || '';

  const [notifOpen, setNotifOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [theme, setTheme] = useState(localStorage.getItem('unifleet_theme') || 'dark');
  const [accountForm, setAccountForm] = useState({ email: 'admin@unifleet.com', password: '' });

  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    async function loadNotifications() {
      try {
        const [alertsRes, tripsRes, parcelsRes] = await Promise.all([
          getAlerts(), getTrips(), getParcels()
        ]);
        
        const freshNotifs = [];
        
        // From Emergency Console
        alertsRes.data.forEach(a => {
          freshNotifs.push({
            id: `alert-${a.id}`,
            type: 'danger', icon: '🚨',
            title: 'Emergency Triggered',
            text: `Bus ${a.bus?.plateNumber || 'Unknown'}: ${a.message || 'Panic activated'} by Student #${a.studentId?.slice(-6) || 'N/A'}.`,
            time: 'Just now',
            link: '/emergency'
          });
        });

        // From Special Trips Console
        tripsRes.data.forEach(t => {
          if (t.status === 'pending') {
            freshNotifs.push({
              id: `trip-${t.id}`,
              type: 'info', icon: '🚌',
              title: 'Special Trip Pending',
              text: `'${t.route?.name || 'Scheduled Trip'}' requires immediate admin approval.`,
              time: 'Recent',
              link: '/trips'
            });
          }
        });

        // From Parcel Console
        parcelsRes.data.forEach(p => {
          if (p.status === 'delivered') {
            freshNotifs.push({
              id: `parcel-${p.id}`,
              type: 'success', icon: '📦',
              title: 'Parcel Delivered',
              text: `${p.trackingCode || 'Item'} successfully delivered to destination.`,
              time: 'Recent',
              link: '/parcels'
            });
          }
        });

        if (freshNotifs.length > 0) {
          setNotifications(freshNotifs);
        } else {
          // Fallback dummy for visual demonstration if database arrays are completely empty
          setNotifications([
            { id: 1, type: 'danger', icon: '🚨', title: 'Panic Button', text: 'Activated by student on Bus #7 (Route 3C).', time: 'Just now', link: '/emergency' },
            { id: 2, type: 'warning', icon: '⚠️', title: 'Engine Failure', text: 'Sudden engine breakdown on Bus #12.', time: '14m ago', link: '/emergency' },
            { id: 3, type: 'info', icon: '🚌', title: 'Route Delay', text: 'Delay of more than 10 mins on Route 2A.', time: '28m ago', link: '/routes' },
            { id: 4, type: 'success', icon: '📦', title: 'Parcel Delivered', text: 'PKG-0035 delivered to final destination.', time: '2h ago', link: '/parcels' }
          ]);
        }
      } catch (err) {
        console.error("Failed to load global notifications", err);
      }
    }
    loadNotifications();
  }, []);

  useEffect(() => {
    if (theme === 'light') {
      document.body.classList.add('light-theme');
    } else {
      document.body.classList.remove('light-theme');
    }
    localStorage.setItem('unifleet_theme', theme);
  }, [theme]);

  const handleSaveSettings = () => {
    setSettingsOpen(false);
  };

  return (
    <header className="topbar">
      <div className="topbar-left">
        <h2>{info.title}</h2>
        {location.pathname !== '/' && <p>{dateStr} — {info.sub}</p>}
      </div>
      <div className="topbar-right">
        <input 
          className="search-bar" 
          placeholder="🔍  Search routes, buses, drivers..." 
          value={qParam}
          onChange={(e) => navigate(`/?q=${encodeURIComponent(e.target.value)}`, { replace: true })}
        />
        <div style={{ position: 'relative' }}>
          <button className="icon-btn" onClick={() => { setNotifOpen(!notifOpen); setSettingsOpen(false); }}>
            🔔
            {notifications.length > 0 && (
              <span style={{ 
                position: 'absolute', top: '2px', right: '4px', background: '#ef4444', 
                color: 'white', borderRadius: '50%', fontSize: '0.6rem', width: '16px', 
                height: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', 
                fontWeight: 'bold', border: '2px solid var(--surface)' 
              }}>
                {notifications.length}
              </span>
            )}
          </button>

          {notifOpen && (
            <div style={{
              position: 'absolute', top: '50px', right: '0', background: 'var(--surface)',
              border: '1px solid var(--border)', borderRadius: '12px', padding: '0',
              width: '380px', boxShadow: '0 10px 40px rgba(0,0,0,0.5)', zIndex: 9999, overflow: 'hidden'
            }}>
              
              <div style={{ padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)' }}>
                <h3 style={{ fontSize: '1.05rem', margin: 0, fontFamily: 'Syne', fontWeight: 700 }}>Notifications</h3>
                <span onClick={() => setNotifications([])} style={{ fontSize: '0.8rem', color: '#3b82f6', cursor: 'pointer', fontWeight: 500 }}>
                  Clear all
                </span>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', maxHeight: '400px', overflowY: 'auto' }}>
                {notifications.length === 0 ? (
                  <div style={{ padding: '40px', textAlign: 'center', color: 'var(--muted)', fontSize: '0.85rem' }}>✅ No new notifications</div>
                ) : notifications.map(n => {
                  let bg = 'rgba(255,255,255,0.05)';
                  if (n.type === 'danger') bg = 'rgba(239, 68, 68, 0.12)';
                  if (n.type === 'warning') bg = 'rgba(245, 158, 11, 0.12)';
                  if (n.type === 'info') bg = 'rgba(59, 130, 246, 0.12)';
                  if (n.type === 'success') bg = 'rgba(16, 185, 129, 0.12)';
                  
                  return (
                    <div key={n.id} onClick={() => { if(n.link) { navigate(n.link); setNotifOpen(false); } }} style={{ 
                      padding: '16px', borderBottom: '1px solid var(--border)', display: 'flex', gap: '14px', alignItems: 'flex-start', position: 'relative',
                      background: 'var(--surface)', cursor: n.link ? 'pointer' : 'default'
                    }}>
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#3b82f6', marginTop: '16px', flexShrink: 0 }} />
                      
                      <div style={{ 
                        width: '42px', height: '42px', borderRadius: '12px', background: bg, 
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem', flexShrink: 0,
                        border: `1px solid ${bg.replace('0.12', '0.3')}`
                      }}>
                        {n.icon}
                      </div>

                      <div style={{ flex: 1, paddingRight: '20px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                          <span style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text)' }}>{n.title}</span>
                          <span style={{ fontSize: '0.75rem', color: 'var(--muted)', marginTop: '2px' }}>{n.time}</span>
                        </div>
                        <p style={{ color: 'var(--text)', fontSize: '0.85rem', lineHeight: 1.4, margin: 0, opacity: 0.8 }}>{n.text}</p>
                      </div>
                      
                      {/* Delete notification button */}
                      <button onClick={(e) => { e.stopPropagation(); setNotifications(list => list.filter(item => item.id !== n.id)); }} style={{
                        position: 'absolute', right: '14px', top: '14px', background: 'transparent', border: 'none', color: 'var(--muted)', cursor: 'pointer', fontSize: '1.1rem',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', width: '20px', height: '20px', borderRadius: '50%'
                      }} title="Delete Notification">×</button>
                    </div>
                  );
                })}
              </div>
              
              <div style={{ padding: '14px', textAlign: 'center', background: 'var(--surface2)', cursor: 'pointer', borderTop: '1px solid var(--border)' }}>
                <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text)' }}>View All</span>
              </div>
            </div>
          )}
        </div>

        <div style={{ position: 'relative' }}>
          <button className="icon-btn" onClick={() => { setSettingsOpen(!settingsOpen); setNotifOpen(false); }}>⚙</button>
          
          {settingsOpen && (
            <div style={{
              position: 'absolute', top: '45px', right: '0', background: 'var(--surface)',
              border: '1px solid var(--border)', borderRadius: '12px', padding: '16px',
              width: '280px', boxShadow: '0 10px 40px rgba(0,0,0,0.5)', zIndex: 9999
            }}>
              <h3 style={{ fontSize: '0.9rem', marginBottom: '12px', fontFamily: 'Syne' }}>Settings</h3>
              
              <div style={{ marginBottom: '12px' }}>
                <label style={{ fontSize: '0.75rem', color: 'var(--muted)', display: 'block', marginBottom: '4px' }}>Account Email</label>
                <input type="email" value={accountForm.email} onChange={e => setAccountForm({...accountForm, email: e.target.value})} 
                  style={{ width: '100%', padding: '6px 10px', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '6px', color: 'var(--text)', fontSize: '0.8rem', fontFamily: 'DM Sans' }} />
              </div>
              
              <div style={{ marginBottom: '16px' }}>
                <label style={{ fontSize: '0.75rem', color: 'var(--muted)', display: 'block', marginBottom: '4px' }}>Password</label>
                <input type="password" value={accountForm.password} placeholder="••••••••" onChange={e => setAccountForm({...accountForm, password: e.target.value})} 
                  style={{ width: '100%', padding: '6px 10px', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '6px', color: 'var(--text)', fontSize: '0.8rem', fontFamily: 'DM Sans' }} />
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderTop: '1px solid var(--border)', paddingTop: '12px' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text)' }}>Appearance</span>
                <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')} 
                  style={{ background: 'var(--surface2)', border: '1px solid var(--border)', padding: '4px 10px', borderRadius: '6px', color: 'var(--text)', fontSize: '0.75rem', cursor: 'pointer', fontFamily: 'DM Sans', fontWeight: 500 }}>
                  {theme === 'light' ? '🌙 Dark Mode' : '☀️ Light Mode'}
                </button>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button style={{ flex: 1, padding: '8px', fontSize: '0.75rem', borderRadius: '6px', background: 'var(--accent)', color: '#fff', border: 'none', cursor: 'pointer', fontFamily: 'DM Sans', fontWeight: 600 }}
                  onClick={handleSaveSettings}>Save Changes</button>
                <button style={{ flex: 1, padding: '8px', fontSize: '0.75rem', borderRadius: '6px', background: 'transparent', color: 'var(--muted)', border: '1px solid var(--border)', cursor: 'pointer', fontFamily: 'DM Sans', fontWeight: 500 }}
                  onClick={() => { setSettingsOpen(false); setAccountForm({ email: 'admin@unifleet.com', password: '' }); }}>Discard changes</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
