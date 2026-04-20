import React, { useState } from 'react';
import StatCard from '../components/StatCard';
import LiveMap from '../components/LiveMap';
import Pill from '../components/Pill';
import { useSocket } from '../hooks/useSocket';

export default function LiveMapPage() {
  const [busPositions, setBusPositions] = useState([]);
  const [filterOpen, setFilterOpen] = useState(false);
  const [trackOpen, setTrackOpen] = useState(false);
  const [trackedBusId, setTrackedBusId] = useState(null);
  const [activeRoute, setActiveRoute] = useState(null);
  const [tempRoute, setTempRoute] = useState('');
  
  const [showCameraModal, setShowCameraModal] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [driverMessage, setDriverMessage] = useState('');
  const [messageStatus, setMessageStatus] = useState('');

  useSocket({
    onBusLocation: (data) => {
      setBusPositions(prev => {
        const idx = prev.findIndex(b => b.busId === data.busId);
        if (idx >= 0) { const u = [...prev]; u[idx] = data; return u; }
        return [...prev, data];
      });
    },
  });

  const active = busPositions.filter(b => b.status !== 'fault').length;
  const emergency = busPositions.filter(b => b.status === 'fault').length;

  return (
    <div className="content">
      <div className="stats-grid">
        <StatCard icon="🟢" label="BUSES ON ROAD" value={active || busPositions.length || '—'} trend="Live tracking" />
        <StatCard icon="🔴" label="EMERGENCY" value={emergency} trend={emergency > 0 ? 'Immediate action required' : 'All clear'} trendDown={emergency > 0} />
        <StatCard icon="⏱" label="AVG DELAY" value="6m" trend="Within normal range" />
        <StatCard icon="👥" label="PASSENGERS" value="342" trend="↑ 5.2% this week" />
      </div>

      <div className="panel">
        <div className="panel-header">
          <div className="panel-title">🗺 Full Live Map — All Routes</div>
          <div style={{ display: 'flex', gap: '12px', position: 'relative', zIndex: 50 }}>
            {/* Filter Route Button */}
            <div style={{ position: 'relative' }}>
              <button className="btn btn-ghost" onClick={() => { setFilterOpen(!filterOpen); setTrackOpen(false); }} style={{ 
                fontSize: '0.78rem', padding: '6px 12px',
                background: filterOpen ? 'var(--surface2)' : 'transparent',
                borderColor: filterOpen ? 'var(--accent)' : 'transparent',
              }}>Filter Route</button>
              
              {filterOpen && (
                <div style={{ 
                  position: 'absolute', top: 'calc(100% + 12px)', right: 0, 
                  background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px',
                  width: '300px', padding: '20px', boxShadow: '0 10px 40px rgba(0,0,0,0.5)', zIndex: 100
                }}>
                  <h4 style={{ fontSize: '0.9rem', marginBottom: '16px', color: 'var(--text)', borderBottom: '1px solid var(--border)', paddingBottom: '10px' }}>
                    🛤️ Filter Route
                  </h4>
                  
                  <div style={{ marginBottom: '12px' }}>
                      <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--muted)', marginBottom: '6px' }}>Filter by Route Name</label>
                    <select value={tempRoute} onChange={(e) => setTempRoute(e.target.value)} style={{ width: '100%', padding: '8px 12px', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: '6px', color: 'var(--text)', fontSize: '0.8rem', outline: 'none' }}>
                      <option value="">Select Route...</option>
                      <option value="Route 10A">Route 10A</option>
                      <option value="Route 15">Route 15</option>
                      <option value="University Express">University Express</option>
                    </select>
                  </div>

                  <div style={{ marginBottom: '12px' }}>
                    <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--muted)', marginBottom: '6px' }}>Direction</label>
                    <select style={{ width: '100%', padding: '8px 12px', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: '6px', color: 'var(--text)', fontSize: '0.8rem', outline: 'none' }}>
                      <option>Both Directions</option>
                      <option>Inbound (To University)</option>
                      <option>Outbound (From University)</option>
                    </select>
                  </div>

                  <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input type="checkbox" id="delayedOnly" style={{ cursor: 'pointer' }} />
                    <label htmlFor="delayedOnly" style={{ fontSize: '0.75rem', color: 'var(--text)', cursor: 'pointer' }}>Status Filter: Delayed Only</label>
                  </div>

                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button className="btn btn-ghost" style={{ flex: 1, fontSize: '0.75rem' }} onClick={() => { setActiveRoute(null); setTempRoute(''); setFilterOpen(false); }}>Clear Filter</button>
                    <button className="btn btn-primary" style={{ flex: 1, fontSize: '0.75rem' }} onClick={() => { setActiveRoute(tempRoute || null); setFilterOpen(false); }}>Apply Filter</button>
                  </div>
                  
                  <div style={{ marginTop: '12px', textAlign: 'center' }}>
                    <button onClick={() => { setActiveRoute(null); setTempRoute(''); setFilterOpen(false); }} style={{ background: 'none', border: 'none', color: 'var(--accent)', fontSize: '0.75rem', cursor: 'pointer', textDecoration: 'underline' }}>
                      Show All Active Buses
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Track Bus Button */}
            <div style={{ position: 'relative' }}>
              <button className="btn btn-primary" onClick={() => { setTrackOpen(!trackOpen); setFilterOpen(false); }} style={{ 
                fontSize: '0.78rem', padding: '6px 12px',
                background: trackOpen || trackedBusId ? 'var(--accent)' : 'transparent', 
                borderColor: 'var(--accent)',
                boxShadow: trackOpen || trackedBusId ? '0 0 12px var(--accent)' : 'none',
              }}>Track Bus</button>
              
              {trackOpen && (
                <div style={{ 
                  position: 'absolute', top: 'calc(100% + 12px)', right: 0, 
                  background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px',
                  padding: '16px', width: '280px', boxShadow: '0 10px 40px rgba(0,0,0,0.5)', zIndex: 100
                }}>
                  <h4 style={{ fontSize: '0.85rem', marginBottom: '12px', color: 'var(--text)' }}>
                    🎯 Track Specific Bus
                  </h4>
                  <div style={{ marginBottom: '10px' }}>
                    <label style={{ display: 'block', fontSize: '0.7rem', color: 'var(--muted)', marginBottom: '6px' }}>Select from Active Buses</label>
                    <select 
                      onChange={(e) => { setTrackedBusId(e.target.value); setTrackOpen(false); }}
                      value={trackedBusId || ''}
                      style={{ width: '100%', padding: '8px 12px', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: '6px', color: 'var(--text)', fontSize: '0.8rem', outline: 'none' }}
                    >
                      <option value="">-- Choose a Bus --</option>
                      {busPositions.map(b => {
                        const routeName = b.routeId || (String(b.busId).includes('1') ? 'Route 10A' : 'University Express');
                        return <option key={b.busId} value={b.busId}>{b.plateNumber} ({routeName})</option>;
                      })}
                      {!busPositions.length && <option value="JBS-105">JBS-105 (Demo)</option>}
                    </select>
                  </div>
                  <div style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--muted)', margin: '10px 0' }}>— OR —</div>
                  <div onClick={() => { setTrackedBusId('JBS-105'); setTrackOpen(false); }} style={{ textAlign: 'center', fontSize: '0.8rem', color: 'var(--accent)', cursor: 'pointer', padding: '8px', background: 'rgba(59,130,246,0.1)', borderRadius: '6px', border: '1px dashed var(--accent)' }}>
                    🖱️ Select from Map
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Map Container with LiveFocus Panel */}
        <div style={{ position: 'relative' }}>
          <LiveMap buses={busPositions} height="480px" trackedBusId={trackedBusId} activeRoute={activeRoute} />
          
          {trackedBusId && (() => {
            const trackedBus = busPositions.find(b => String(b.busId) === String(trackedBusId));
            const displayTrackedId = trackedBus ? trackedBus.plateNumber : trackedBusId;
            return (
            <div style={{
              position: 'absolute', top: '20px', left: '20px', zIndex: 400,
              background: 'rgba(23, 26, 31, 0.85)', backdropFilter: 'blur(12px)',
              border: '1px solid var(--border)', borderRadius: '16px',
              padding: '20px', width: '280px', boxShadow: '0 20px 50px rgba(0,0,0,0.6)',
              animation: 'slideIn 0.3s ease'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                <div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 700, marginBottom: '4px' }}>LIVE FOCUS</div>
                  <h3 style={{ fontSize: '1.2rem', fontFamily: 'Syne', margin: 0 }}>Bus {displayTrackedId}</h3>
                </div>
                <button className="btn-ghost" onClick={() => setTrackedBusId(null)} style={{ padding: '4px 8px', borderRadius: '6px', fontSize: '0.7rem', border: '1px solid var(--border)', cursor: 'pointer', background: 'var(--surface2)', color: 'var(--text)' }}>Stop Tracking</button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '8px' }}>
                  <span style={{ color: 'var(--muted)', fontSize: '0.8rem' }}>Current Speed</span>
                  <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>45 km/h</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '8px' }}>
                  <span style={{ color: 'var(--muted)', fontSize: '0.8rem' }}>Next Stop</span>
                  <span style={{ fontWeight: 600, fontSize: '0.85rem', textAlign: 'right' }}>Engineering Bldg<br/><span style={{ color: 'var(--accent4)', fontSize: '0.7rem' }}>ETA: 3 mins</span></span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '8px' }}>
                  <span style={{ color: 'var(--muted)', fontSize: '0.8rem' }}>Occupancy Level</span>
                  <span style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--warn)' }}>80% Full</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '8px' }}>
                  <span style={{ color: 'var(--muted)', fontSize: '0.8rem' }}>Fuel Level</span>
                  <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>65%</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--muted)', fontSize: '0.8rem' }}>Driver Status</span>
                  <span style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--accent4)' }}>Active</span>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <button onClick={() => setShowMessageModal(true)} className="btn btn-primary" style={{ width: '100%', fontSize: '0.8rem', display: 'flex', justifyContent: 'center', gap: '8px', cursor: 'pointer' }}>
                  ✉️ Message Driver
                </button>
                <button onClick={() => setShowCameraModal(true)} className="btn btn-ghost" style={{ width: '100%', fontSize: '0.8rem', display: 'flex', justifyContent: 'center', gap: '8px', cursor: 'pointer' }}>
                  📷 View Interior Camera
                </button>
              </div>
            </div>
            );
          })()}

          {/* Camera Modal */}
          {showCameraModal && trackedBusId && (() => {
            const trackedBus = busPositions.find(b => String(b.busId) === String(trackedBusId));
            const displayTrackedId = trackedBus ? trackedBus.plateNumber : trackedBusId;
            return (
            <div style={{
              position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
              background: 'rgba(0,0,0,0.8)', zIndex: 9999,
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <div style={{
                background: 'var(--surface)', padding: '20px', borderRadius: '16px',
                width: '600px', maxWidth: '90%', border: '1px solid var(--border)',
                boxShadow: '0 20px 50px rgba(0,0,0,0.8)', animation: 'slideIn 0.3s ease'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h3 style={{ fontSize: '1.1rem', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ color: 'var(--accent3)' }}>● REC</span>
                    Interior Camera - Bus {displayTrackedId}
                  </h3>
                  <button onClick={() => setShowCameraModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text)', fontSize: '1.2rem', cursor: 'pointer' }}>×</button>
                </div>
                <div style={{
                  width: '100%', height: '320px', background: '#000', borderRadius: '8px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative',
                  overflow: 'hidden'
                }}>
                  {/* Mock Camera Feed with Noise and Timestamp */}
                  <div style={{ position: 'absolute', top: '10px', right: '10px', color: '#fff', fontSize: '0.75rem', fontFamily: 'monospace', textShadow: '1px 1px 2px #000' }}>
                    {new Date().toISOString().replace('T', ' ').slice(0, 19)}
                  </div>
                  <div style={{ position: 'absolute', bottom: '10px', left: '10px', color: '#fff', fontSize: '0.75rem', fontFamily: 'monospace', textShadow: '1px 1px 2px #000' }}>
                    CAM 01 - INTERIOR
                  </div>
                  <div style={{
                    width: '100%', height: '100%',
                    background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.05) 2px, rgba(255,255,255,0.05) 4px), url("https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&q=80&w=800") center/cover',
                    opacity: 0.8, filter: 'grayscale(0.3) contrast(1.2)'
                  }}></div>
                </div>
              </div>
            </div>
            );
          })()}

          {/* Message Modal */}
          {showMessageModal && trackedBusId && (() => {
            const trackedBus = busPositions.find(b => String(b.busId) === String(trackedBusId));
            const displayTrackedId = trackedBus ? trackedBus.plateNumber : trackedBusId;
            const driverName = trackedBus?.driverName || 'Unknown Driver';
            return (
              <div style={{
                position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                background: 'rgba(0,0,0,0.6)', zIndex: 9999,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                backdropFilter: 'blur(4px)'
              }}>
                <div style={{
                  background: 'var(--surface)', padding: '24px', borderRadius: '16px',
                  width: '400px', border: '1px solid var(--border)',
                  boxShadow: '0 20px 50px rgba(0,0,0,0.5)', animation: 'slideIn 0.3s ease'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <h3 style={{ fontSize: '1.1rem', margin: 0 }}>Message Driver</h3>
                    <button onClick={() => { setShowMessageModal(false); setMessageStatus(''); setDriverMessage(''); }} style={{ background: 'none', border: 'none', color: 'var(--text)', fontSize: '1.2rem', cursor: 'pointer' }}>×</button>
                  </div>
                  
                  <div style={{ padding: '12px', background: 'var(--surface2)', borderRadius: '8px', marginBottom: '20px', border: '1px solid var(--border)' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--muted)', marginBottom: '4px' }}>TO</div>
                    <div style={{ fontWeight: '600', color: 'var(--text)' }}>{driverName} (Bus {displayTrackedId})</div>
                  </div>

                  <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--muted)', marginBottom: '8px' }}>Message content</label>
                    <textarea 
                      value={driverMessage}
                      onChange={(e) => setDriverMessage(e.target.value)}
                      placeholder="Type your message here..."
                      style={{
                        width: '100%', height: '100px', padding: '12px', background: 'var(--bg)',
                        border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text)',
                        resize: 'none', fontFamily: 'inherit', fontSize: '0.85rem', outline: 'none'
                      }}
                    />
                  </div>

                  {messageStatus && (
                    <div style={{ marginBottom: '16px', fontSize: '0.8rem', color: 'var(--accent4)', textAlign: 'center' }}>
                      {messageStatus}
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                    <button onClick={() => { setShowMessageModal(false); setMessageStatus(''); setDriverMessage(''); }} className="btn btn-ghost">Cancel</button>
                    <button 
                      onClick={() => {
                        if (!driverMessage.trim()) return;
                        setMessageStatus('Sending...');
                        setTimeout(() => {
                          setMessageStatus('Message Sent Successfully!');
                          setDriverMessage('');
                          setTimeout(() => {
                            setShowMessageModal(false);
                            setMessageStatus('');
                          }, 1500);
                        }, 800);
                      }} 
                      className="btn btn-primary"
                      disabled={!driverMessage.trim() || messageStatus}
                      style={{ opacity: !driverMessage.trim() ? 0.5 : 1 }}
                    >
                      {messageStatus ? 'Sending...' : 'Send Message'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>

        {/* Bus List Table */}
        {busPositions.length > 0 && (
          <div style={{ marginTop: '20px' }}>
            <div className="panel-header">
              <div className="panel-title" style={{ fontSize: '0.82rem' }}>📍 Live Bus Positions</div>
            </div>
            <table>
              <thead>
                <tr>
                  <th>Plate</th>
                  <th>Driver</th>
                  <th>Lat</th>
                  <th>Lng</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {busPositions.map(b => (
                  <tr key={b.busId}>
                    <td style={{ fontFamily: 'Syne', color: 'var(--accent)', fontWeight: 600 }}>{b.plateNumber}</td>
                    <td>{b.driverName || '—'}</td>
                    <td style={{ color: 'var(--muted)', fontSize: '0.78rem' }}>{b.lat?.toFixed(5)}</td>
                    <td style={{ color: 'var(--muted)', fontSize: '0.78rem' }}>{b.lng?.toFixed(5)}</td>
                    <td><Pill status={b.status === 'fault' ? 'emergency' : 'active'} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {busPositions.length === 0 && (
          <div style={{ marginTop: '16px', textAlign: 'center', color: 'var(--muted)', fontSize: '0.85rem', padding: '20px 0' }}>
            ⏳ Waiting for live bus data from server...
          </div>
        )}
      </div>
    </div>
  );
}
