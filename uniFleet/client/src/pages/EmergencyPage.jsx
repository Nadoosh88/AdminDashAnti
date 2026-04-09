
import React, { useState, useEffect } from 'react';
import { getAlerts, resolveAlert } from '../services/api';

export default function EmergencyPage() {
  const [alerts, setAlerts] = useState([]);
  const [stats, setStats] = useState({ activeCount: 0, resolvedToday: 0, avgResponseTime: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    setLoading(true);
    try {
      const res = await getAlerts();
      setAlerts(res.data.alerts);
      setStats(res.data.stats);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  const handleResolve = async (id) => {
    try {
      await resolveAlert(id);
      loadData();
    } catch (e) {
      alert('Failed to resolve alert.');
    }
  };

  return (
    <div className="content">
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '1.6rem', marginBottom: '4px' }}>Emergency Alert Console</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: stats.activeCount > 0 ? 'var(--accent3)' : 'var(--accent2)' }} />
          <p style={{ color: 'var(--muted)', fontSize: '0.82rem' }}>{stats.activeCount} Active Alerts — Security Notified</p>
        </div>
      </div>

      {/* Red Alert Banner */}
      {stats.activeCount > 0 && (
        <div style={{ 
          background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.4)',
          borderRadius: '12px', padding: '16px 24px', marginBottom: '24px',
          display: 'flex', alignItems: 'center', gap: '16px'
        }}>
          <span style={{ fontSize: '1.4rem' }}>🚨</span>
          <div>
            <h4 style={{ color: 'white', fontWeight: 800, fontSize: '0.9rem', marginBottom: '2px', fontFamily: 'Syne, sans-serif' }}>
              {stats.activeCount} ACTIVE EMERGENCY ALERTS
            </h4>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.78rem' }}>University Security has been notified. Monitoring all student GPS locations.</p>
          </div>
        </div>
      )}

      {/* Stats Dashboard */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '40px' }}>
        {[
          { label: 'ACTIVE ALERTS', value: stats.activeCount, icon: '🔴' },
          { label: 'RESOLVED TODAY', value: stats.resolvedToday, icon: '✅' },
          { label: 'TRACKED STUDENTS', value: '342', icon: '📍' },
          { label: 'AVG RESPONSE TIME', value: `${stats.avgResponseTime}m`, icon: '🕒' }
        ].map((s, idx) => (
          <div key={idx} style={{ 
            background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: '16px', padding: '20px' 
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <span style={{ fontSize: '1rem' }}>{s.icon}</span>
              <span style={{ fontSize: '0.68rem', color: 'var(--muted)', fontWeight: 700, letterSpacing: '0.5px' }}>{s.label}</span>
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, fontFamily: 'Syne, sans-serif', color: 'white' }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Priority Log */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <span style={{ fontSize: '1rem' }}>🚨</span>
          <h3 style={{ fontSize: '0.9rem', fontWeight: 700, fontFamily: 'Syne, sans-serif' }}>All Emergency Alerts — Priority Log</h3>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {alerts.map(alert => {
            const isActive = alert.status === 'active';
            const isPanic = alert.type === 'PANIC_BUTTON';
            
            return (
              <div key={alert.id} style={{
                background: isActive ? (isPanic ? 'rgba(245, 158, 11, 0.05)' : 'rgba(239, 68, 68, 0.05)') : 'rgba(15, 23, 42, 0.3)',
                border: '1px solid ' + (isActive ? (isPanic ? 'rgba(245, 158, 11, 0.2)' : 'rgba(239, 68, 68, 0.2)') : 'var(--border)'),
                borderRadius: '16px', padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
              }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                  <div style={{ 
                    marginTop: '4px', fontSize: '1.2rem',
                    color: isActive ? (isPanic ? '#f59e0b' : '#ef4444') : '#10b981'
                  }}>
                    {isActive ? (isPanic ? '⚠️' : '🛑') : '✅'}
                  </div>
                  <div>
                    <h4 style={{ 
                      fontSize: '0.9rem', fontWeight: 700, marginBottom: '6px',
                      color: isActive ? 'white' : 'var(--muted)',
                      textTransform: !isActive ? 'uppercase' : 'none'
                    }}>
                      {alert.message}
                    </h4>
                    {isActive && (
                      <p style={{ color: 'var(--muted)', fontSize: '0.75rem', marginBottom: '14px' }}>
                        Location: 32.0911°N, 35.8500°E • Route 3C • Near Campus Gate 2
                      </p>
                    )}
                    
                    {isActive && (
                      <div style={{ display: 'flex', gap: '10px' }}>
                        {isPanic ? (
                          <>
                            <button className="btn btn-secondary" style={{ fontSize: '0.7rem', padding: '6px 12px', borderColor: 'var(--accent3)', color: 'var(--accent3)' }}>Dispatch Security</button>
                            <button className="btn btn-secondary" style={{ fontSize: '0.7rem', padding: '6px 12px' }}>Contact Driver</button>
                          </>
                        ) : (
                          <button className="btn btn-secondary" style={{ fontSize: '0.7rem', padding: '6px 12px', borderColor: 'var(--accent)', color: 'var(--accent)' }}>Send Replacement</button>
                        )}
                        <button className="btn btn-primary" style={{ fontSize: '0.7rem', padding: '6px 12px', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)' }} onClick={() => handleResolve(alert.id)}>Mark Resolved</button>
                      </div>
                    )}
                  </div>
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--muted)' }}>
                  {new Date(alert.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ({Math.round((new Date() - new Date(alert.createdAt)) / 60000)} min ago)
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
