
import React, { useState, useEffect, useMemo } from 'react';
import { getAlerts, resolveAlert } from '../services/api';
import EmergencyMap from '../components/EmergencyMap';

// --- MOCK DATA ---
const INITIAL_ALERTS = [
  { id: 'e1', type: 'Panic Button', vehicleId: 'Bus #07', location: 'Engineering Gate', lat: 32.4948, lng: 35.9912, severity: 'Critical', assignee: 'Officer Sami', time: '2 mins ago', details: 'Student trigger at engineering bus stop.' },
  { id: 'e2', type: 'Mechanical Failure', vehicleId: 'Bus #12', location: 'Main Highway (KM 14)', lat: 32.5010, lng: 35.9820, severity: 'Warning', assignee: 'Unassigned', time: '8 mins ago', details: 'Engine smoke reported by driver.' },
  { id: 'e3', type: 'Unauthorized Route', vehicleId: 'Bus #03', location: 'Downtown Area', lat: 32.4850, lng: 36.0020, severity: 'Warning', assignee: 'Officer Ahmad', time: '15 mins ago', details: 'Vehicle deviated from designated Route 15.' },
  { id: 'e4', type: 'Accident Detection', vehicleId: 'Bus #19', location: 'Circle 4', lat: 32.4920, lng: 35.9950, severity: 'Critical', assignee: 'Officer Laila', time: 'Just now', details: 'G-Force impact detected. Automatic trigger.' }
];

const DISPATCH_OPTIONS = [
  { id: 'sec', name: 'University Security (Direct)', type: 'Emergency', icon: '👮‍♂️' },
  { id: 'civ', name: 'Civil Defense (JUST HQ)', type: 'Emergency', icon: '🚒' },
  { id: 'med', name: 'Medical Response Team', type: 'Emergency', icon: '🚑' },
  { id: 'b04', name: 'Bus #04 (Idle - 0.8km)', type: 'Backup', icon: '🚌' },
  { id: 'b09', name: 'Bus #09 (Idle - 1.2km)', type: 'Backup', icon: '🚌' }
];

export default function EmergencyPage() {
  const [alerts, setAlerts] = useState(INITIAL_ALERTS);
  const [filter, setFilter] = useState('All');
  const [selectedIncident, setSelectedIncident] = useState(null);
  
  // Modals / Menus
  const [activeDispatchAlert, setActiveDispatchAlert] = useState(null);
  const [activeContactAlert, setActiveContactAlert] = useState(null);
  const [activeResolveAlert, setActiveResolveAlert] = useState(null);
  const [reportText, setReportText] = useState('');
  const [resolveError, setResolveError] = useState('');
  const [isBroadcastOpen, setBroadcastOpen] = useState(false);

  // Transitions
  const filteredAlerts = useMemo(() => {
    if (filter === 'All') return alerts;
    return alerts.filter(a => a.severity === filter);
  }, [alerts, filter]);

  const mapIncidents = useMemo(() => {
    if (filter === 'Critical') return alerts.filter(a => a.severity === 'Critical');
    if (selectedIncident) return [selectedIncident];
    return alerts.length > 0 ? [alerts[0]] : [];
  }, [alerts, filter, selectedIncident]);

  useEffect(() => {
    // Critical Mode Effect: Flash the topbar bell
    if (filter === 'Critical') {
      document.body.setAttribute('data-emergency-impact', 'true');
    } else {
      document.body.removeAttribute('data-emergency-impact');
    }
  }, [filter]);

  const handleResolve = () => {
    if (activeResolveAlert.severity === 'Critical' && reportText.trim().length < 10) {
      setResolveError('⚠ Mandatory Incident Report required for critical cases (min 10 chars).');
      return;
    }
    setAlerts(prev => prev.filter(a => a.id !== activeResolveAlert.id));
    setActiveResolveAlert(null);
    setReportText('');
    setResolveError('');
  };

  return (
    <div className={`content ${filter === 'Critical' ? 'emergency-overlay' : ''}`}>
      
      {/* Header Area */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: '1.8rem', color: '#fff' }}>
            Emergency Console
          </h1>
          <p style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>
            {filter === 'Critical' ? `⚠️ Filtering by Critical Priority — ${filteredAlerts.length} Active Threats` : 'Fleet Safety Command Center'}
          </p>
        </div>
        
        <div style={{ display: 'flex', gap: '12px' }}>
          <button 
            onClick={() => setBroadcastOpen(true)}
            style={{ padding: '12px 24px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: 800, cursor: 'pointer', boxShadow: '0 8px 20px rgba(239, 68, 68, 0.3)' }}
          >📢 Broadcast Alert</button>
        </div>
      </div>

      {/* Top Grid: Map & Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.5fr) 1fr', gap: '24px', marginBottom: '32px' }}>
        <div style={{ background: 'var(--surface)', borderRadius: '24px', border: '1px solid var(--border)', padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
             <h3 style={{ fontSize: '1rem', fontWeight: 700, fontFamily: 'Syne' }}>{filter === 'Critical' ? 'Emergency View Enabled' : 'Live Incident Tracking'}</h3>
             <span style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>Satellite Hybrid Mode Active</span>
          </div>
          <EmergencyMap incidents={mapIncidents} height="360px" mode={filter === 'Critical' ? 'emergency' : 'normal'} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
           <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '24px', padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
                <h4 style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--muted)' }}>FILTER BY PRIORITY</h4>
                {filter === 'Critical' && <span className="glow-dot"></span>}
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                {['All', 'Critical', 'Warning'].map(f => (
                  <button 
                    key={f}
                    onClick={() => { setFilter(f); setSelectedIncident(null); }}
                    style={{ 
                      flex: 1, padding: '12px', borderRadius: '12px', cursor: 'pointer', border: 'none', fontWeight: 700,
                      background: filter === f ? (f === 'Critical' ? '#ef4444' : 'var(--accent)') : 'var(--surface2)',
                      color: filter === f ? '#fff' : 'var(--muted)',
                      boxShadow: filter === f && f === 'Critical' ? '0 0 15px rgba(239, 68, 68, 0.4)' : 'none',
                      transition: '0.3s'
                    }}
                  >{f}</button>
                ))}
              </div>
           </div>

           <div style={{ flex: 1, background: 'var(--surface)', borderRadius: '24px', border: '1px solid var(--border)', padding: '24px', position: 'relative', overflow: 'hidden' }}>
              <h4 style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--accent4)', marginBottom: '16px' }}>Protocol Status</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                 <div style={{ fontSize: '0.85rem' }}>✅ Security Guard Post: <span style={{ color: 'var(--accent4)' }}>READY</span></div>
                 <div style={{ fontSize: '0.85rem' }}>📡 Backup Unit B-04: <span style={{ color: 'var(--accent)' }}>IDLE</span></div>
                 <div style={{ fontSize: '0.85rem' }}>🚑 On-call Medical: <span style={{ color: 'var(--warn)' }}>TRANSIT</span></div>
              </div>
              <div style={{ position: 'absolute', bottom: '-20px', right: '-10px', fontSize: '5rem', opacity: 0.1 }}>🛡️</div>
           </div>
        </div>
      </div>

      {/* Priority Log */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {filteredAlerts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px', background: 'var(--surface)', borderRadius: '24px', border: '1px solid var(--border)' }}>
             <span style={{ fontSize: '3rem' }}>✅</span>
             <h4 style={{ marginTop: '12px', fontWeight: 800 }}>No Active Emergencies</h4>
             <p style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>All systems within normal parameters.</p>
          </div>
        ) : (
          filteredAlerts.map(alert => (
            <div 
              key={alert.id} 
              style={{ 
                background: alert.severity === 'Critical' ? 'linear-gradient(90deg, rgba(239,68,68,0.1), rgba(0,0,0,0))' : 'var(--surface)',
                border: alert.severity === 'Critical' ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid var(--border)',
                borderRadius: '20px', padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                animation: 'slideUp 0.4s ease forwards', cursor: 'pointer'
              }}
              onClick={() => setSelectedIncident(alert)}
            >
              <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
                <div style={{ 
                  width: '56px', height: '56px', borderRadius: '14px', background: 'var(--surface2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem',
                  border: alert.severity === 'Critical' ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid transparent',
                  animation: alert.severity === 'Critical' ? 'pulse-box 2s infinite' : 'none'
                }}>
                  {alert.type.includes('Panic') ? '🆘' : alert.type.includes('Accident') ? '💥' : '⚙️'}
                </div>
                <div>
                   <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                      <h4 style={{ fontWeight: 800 }}>{alert.severity === 'Critical' ? 'CRITICAL: ' : ''}{alert.type}</h4>
                      <span style={{ fontSize: '0.6rem', padding: '2px 8px', borderRadius: '4px', background: alert.severity === 'Critical' ? '#ef4444' : 'var(--warn)', color: '#fff' }}>{alert.severity}</span>
                   </div>
                   <div style={{ fontSize: '0.8rem', color: 'var(--muted)', display: 'flex', gap: '16px' }}>
                      <span>🚐 <strong>{alert.vehicleId}</strong></span>
                      <span>📍 {alert.location}</span>
                   </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                 <button 
                  onClick={(e) => { e.stopPropagation(); setActiveDispatchAlert(alert); }}
                  style={{ padding: '10px 18px', borderRadius: '10px', background: 'var(--accent)', color: '#fff', border: 'none', fontWeight: 800, cursor: 'pointer', fontSize: '0.75rem' }}
                 >
                  {alert.severity === 'Critical' ? 'Initiate Emergency Protocol' : 'Dispatch Help'}
                 </button>
                 
                 <div style={{ position: 'relative' }}>
                    <button 
                      onClick={(e) => { e.stopPropagation(); setActiveContactAlert(activeContactAlert === alert.id ? null : alert.id); }}
                      style={{ padding: '10px 18px', borderRadius: '10px', background: 'var(--surface2)', color: '#fff', border: '1px solid var(--border)', fontWeight: 800, cursor: 'pointer', fontSize: '0.75rem' }}
                    >Contact ▼</button>
                    {activeContactAlert === alert.id && (
                      <div style={{ position: 'absolute', top: '45px', right: 0, width: '180px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', zIndex: 100, overflow: 'hidden' }}>
                        {['Call Driver', 'Send Message', 'Priority Line (Bypass)'].map(o => (
                          <div key={o} className="menu-opt" style={{ padding: '12px 16px', fontSize: '0.75rem', cursor: 'pointer' }}>{o}</div>
                        ))}
                      </div>
                    )}
                 </div>

                 <button 
                  onClick={(e) => { e.stopPropagation(); setActiveResolveAlert(alert); }}
                  style={{ padding: '10px 18px', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', color: 'var(--muted)', border: '1px solid var(--border)', fontWeight: 800, cursor: 'pointer', fontSize: '0.75rem' }}
                 >Resolve</button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Dispatch Modal */}
      {activeDispatchAlert && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '24px', padding: '32px', width: '480px', animation: 'scaleIn 0.3s ease' }}>
            <h3 style={{ fontFamily: 'Syne', fontWeight: 800, marginBottom: '8px' }}>Dispatch Response Team</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--muted)', marginBottom: '24px' }}>Target: {activeDispatchAlert.vehicleId} at {activeDispatchAlert.location}</p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '32px' }}>
               {DISPATCH_OPTIONS.filter(o => activeDispatchAlert.severity === 'Critical' ? true : o.type === 'Backup').map(opt => (
                 <div key={opt.id} className="dispatch-row" style={{ padding: '16px', borderRadius: '16px', border: '1px solid var(--border)', background: 'var(--surface2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ fontSize: '1.2rem' }}>{opt.icon}</span>
                      <div>
                        <div style={{ fontSize: '0.85rem', fontWeight: 800 }}>{opt.name}</div>
                        <div style={{ fontSize: '0.7rem', color: opt.type === 'Emergency' ? '#ef4444' : 'var(--accent)' }}>{opt.type.toUpperCase()} UNIT</div>
                      </div>
                    </div>
                    <input type="radio" name="d-target" style={{ width: '18px', height: '18px' }} />
                 </div>
               ))}
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={() => setActiveDispatchAlert(null)} style={{ flex: 1, padding: '12px', background: 'none', border: '1px solid var(--border)', color: 'var(--muted)', borderRadius: '10px', cursor: 'pointer' }}>Cancel</button>
              <button onClick={() => setActiveDispatchAlert(null)} style={{ flex: 2, padding: '12px', background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 800, cursor: 'pointer' }}>Dispatch Unit Now</button>
            </div>
          </div>
        </div>
      )}

      {/* Resolve Modal */}
      {activeResolveAlert && (
         <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
         <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '24px', padding: '32px', width: '450px' }}>
           <h3 style={{ fontFamily: 'Syne', fontWeight: 800, marginBottom: '8px' }}>Mandatory Incident Report</h3>
           <p style={{ fontSize: '0.82rem', color: 'var(--muted)', marginBottom: '24px' }}>Incident Type: {activeResolveAlert.type}. Case #RC-{activeResolveAlert.id}</p>
           
           <textarea 
             value={reportText}
             onChange={(e) => { setReportText(e.target.value); setResolveError(''); }}
             placeholder="Describe the resolution steps taken (min 10 characters)..."
             style={{ width: '100%', height: '120px', background: 'var(--bg)', border: resolveError ? '1px solid #ef4444' : '1px solid var(--border)', borderRadius: '12px', padding: '16px', color: '#fff', outline: 'none', marginBottom: '12px' }}
           />

           {resolveError && (
             <div style={{ color: '#ef4444', fontSize: '0.75rem', fontWeight: 600, marginBottom: '16px', animation: 'shake 0.4s ease' }}>
               {resolveError}
             </div>
           )}

           <div style={{ display: 'flex', gap: '12px' }}>
             <button onClick={() => { setActiveResolveAlert(null); setReportText(''); setResolveError(''); }} style={{ flex: 1, color: 'var(--muted)', background: 'none', border: 'none', cursor: 'pointer' }}>Cancel</button>
             <button onClick={handleResolve} style={{ flex: 2, background: 'var(--accent4)', color: '#0b0f1a', border: 'none', borderRadius: '10px', padding: '12px', fontWeight: 800, cursor: 'pointer' }}>Finalize & Close Case</button>
           </div>
         </div>
       </div>
      )}

      {/* Broadcast Modal */}
      {isBroadcastOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(239, 68, 68, 0.4)', backdropFilter: 'blur(15px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000 }}>
           <div style={{ background: 'var(--surface)', border: '2px solid #ef4444', borderRadius: '24px', padding: '32px', width: '480px', boxShadow: '0 0 50px rgba(239, 68, 68, 0.5)' }}>
              <h2 style={{ fontFamily: 'Syne', fontWeight: 800, marginBottom: '12px', color: '#ef4444' }}>🚨 EMERGENCY BROADCAST</h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--muted)', marginBottom: '24px' }}>This will trigger a full-screen alert and audio chime to ALL users.</p>
              <textarea placeholder="Enter emergency notice..." style={{ width: '100%', height: '100px', background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '12px', padding: '16px', color: '#fff', marginBottom: '24px' }} />
              <div style={{ display: 'flex', gap: '12px' }}>
                 <button onClick={() => setBroadcastOpen(false)} style={{ flex: 1, padding: '12px', background: 'none', border: '1px solid var(--border)', color: 'var(--muted)', borderRadius: '10px' }}>Abort</button>
                 <button onClick={() => setBroadcastOpen(false)} style={{ flex: 2, padding: '12px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 800 }}>INIIATE BROADCAST</button>
              </div>
           </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        .emergency-overlay { position: relative; }
        .emergency-overlay::after { content: ''; position: fixed; inset: 0; pointer-events: none; border: 4px solid rgba(239, 68, 68, 0.15); box-shadow: inset 0 0 100px rgba(239, 68, 68, 0.1); border-radius: 0; z-index: 9999; animation: edge-glow 2s infinite; }
        @keyframes edge-glow { 0%, 100% { border-color: rgba(239, 68, 68, 0.1); } 50% { border-color: rgba(239, 68, 68, 0.3); } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes scaleIn { from { opacity: 0; transform: scale(0.9); } to { opacity: 1; transform: scale(1); } }
        @keyframes pulse-box { 0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.4); } 70% { box-shadow: 0 0 0 10px rgba(239, 68, 68, 0); } 100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); } }
        .glow-dot { width: 8px; height: 8px; background: #ef4444; border-radius: 50%; box-shadow: 0 0 10px #ef4444; animation: blink 0.5s infinite; }
        @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
        .menu-opt:hover { background: var(--surface2); color: var(--accent); }
        .dispatch-row:hover { border-color: var(--accent) !important; background: rgba(59,130,246,0.05) !important; }
        
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }

        /* Global Bell Pulsing Simulation */
        [data-emergency-impact="true"] .icon-btn { animation: bell-pulse 0.5s infinite; color: #ef4444 !important; border-color: #ef4444 !important; }
        @keyframes bell-pulse { 0% { transform: scale(1); } 50% { transform: scale(1.2); box-shadow: 0 0 15px #ef4444; } 100% { transform: scale(1); } }
      `}} />
    </div>
  );
}
