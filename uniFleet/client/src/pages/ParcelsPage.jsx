
import React, { useState, useEffect } from 'react';
import { getParcels, createParcel, updateParcelStatus, deleteParcel, getTrips, getDrivers } from '../services/api';

const STATUSES = [
  { id: 'pending', label: '📁 Pending', color: 'var(--muted)', next: 'in-transit', nextLabel: 'Approve' },
  { id: 'in-transit', label: '🚚 In-Transit', color: 'var(--accent)', next: 'delivered', nextLabel: 'Deliver' },
  { id: 'delivered', label: '✅ Delivered', color: 'var(--accent4)' },
  { id: 'cancelled', label: '❌ Cancelled', color: 'var(--accent3)' },
];

function Modal({ title, onClose, children }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{
        background: 'var(--surface)', border: '1px solid var(--border)',
        borderRadius: '20px', padding: '32px', width: '480px', maxWidth: '95vw',
        boxShadow: '0 24px 60px rgba(0,0,0,0.6)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px' }}>
          <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '1rem', letterSpacing: '0.5px', textTransform: 'uppercase', color: 'var(--accent)' }}>{title}</h3>
          <button onClick={onClose} style={{
            background: 'var(--surface2)', border: '1px solid var(--border)',
            color: 'var(--muted)', borderRadius: '10px', padding: '6px 12px',
            cursor: 'pointer', fontSize: '1rem', transition: 'all 0.2s'
          }}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

export default function ParcelsPage() {
  const [parcels, setParcels] = useState([]);
  const [trips, setTrips] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [search, setSearch] = useState('');
  const [newParcel, setNewParcel] = useState({ description: '', tripId: '', driverId: '', from: '', to: '' });

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [pRes, tRes, dRes] = await Promise.all([getParcels(), getTrips(), getDrivers()]);
      setParcels(pRes.data);
      setTrips(tRes.data);
      setDrivers(dRes.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function handleAdd() {
    if (!newParcel.description) return;
    try {
      await createParcel(newParcel);
      setShowAddModal(false);
      setNewParcel({ description: '', tripId: '', driverId: '', from: '', to: '' });
      await loadData();
    } catch (e) {
      console.error(e);
    }
  }

  async function moveStatus(parcelId, newStatus) {
    try {
      await updateParcelStatus(parcelId, newStatus);
      await loadData();
    } catch (e) {
      console.error(e);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Are you sure you want to permanently delete this parcel?')) return;
    try {
      await deleteParcel(id);
      await loadData();
    } catch (e) {
      console.error(e);
    }
  }

  const filtered = parcels.filter(p => 
    p.trackingCode.toLowerCase().includes(search.toLowerCase()) ||
    p.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="content">
      <div className="toolbar" style={{ marginBottom: '32px', alignItems: 'center', gap: '16px' }}>
        <button className="btn btn-primary" onClick={() => setShowAddModal(true)} style={{ padding: '12px 24px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '1.2rem' }}>+</span> Register Parcel
        </button>
        
        <div style={{ position: 'relative', flex: 1, maxWidth: '400px' }}>
          <input 
            placeholder="Search by Tracking ID or Description..." 
            className="search-input"
            style={{ 
              width: '100%',
              background: 'var(--surface)', border: '1px solid var(--border)',
              borderRadius: '12px', padding: '12px 16px 12px 42px', color: 'var(--text)',
              outline: 'none', fontSize: '0.9rem', transition: 'all 0.2s',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
            }}
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <span style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }}>🔍</span>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '100px', color: 'var(--muted)', fontSize: '1rem', fontStyle: 'italic' }}>⏳ Loading parcel console...</div>
      ) : (
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', 
          gap: '24px',
          alignItems: 'start'
        }}>
          {STATUSES.map(status => (
            <div key={status.id} style={{
              background: 'rgba(15, 23, 42, 0.3)',
              borderRadius: '24px',
              border: '1px solid var(--border)',
              padding: '20px',
              minHeight: '600px',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              backdropFilter: 'blur(10px)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '12px', borderBottom: '1px solid var(--border)' }}>
                <h4 style={{ fontSize: '1rem', fontWeight: 700, fontFamily: 'Syne, sans-serif' }}>{status.label}</h4>
                <span style={{ 
                  background: 'var(--surface2)', padding: '4px 12px', borderRadius: '10px', 
                  fontSize: '0.75rem', color: 'var(--muted)', fontWeight: 700 
                }}>
                  {filtered.filter(p => p.status === status.id).length}
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {filtered.filter(p => p.status === status.id).map(parcel => (
                  <div key={parcel.id} style={{
                    background: 'var(--surface)',
                    border: '1px solid var(--border)',
                    borderRadius: '16px',
                    padding: '20px',
                    boxShadow: '0 8px 16px rgba(0,0,0,0.15)',
                    position: 'relative',
                    transition: 'transform 0.2s, border-color 0.2s',
                    cursor: 'default'
                  }} className="parcel-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', alignItems: 'center' }}>
                      <span style={{ 
                        color: 'var(--accent)', fontWeight: 800, fontSize: '0.9rem', 
                        fontFamily: 'Syne, sans-serif', background: 'rgba(59,130,246,0.1)',
                        padding: '4px 8px', borderRadius: '6px'
                      }}>
                        {parcel.trackingCode}
                      </span>
                      <button onClick={() => handleDelete(parcel.id)} style={{ 
                        background: 'none', border: 'none', color: 'var(--muted)', 
                        cursor: 'pointer', fontSize: '1.2rem', padding: '4px',
                        transition: 'color 0.2s'
                      }} onMouseEnter={e => e.target.style.color = 'var(--accent3)'} onMouseLeave={e => e.target.style.color = 'var(--muted)'}>🗑</button>
                    </div>
                    
                    <p style={{ fontSize: '0.95rem', marginBottom: '16px', lineHeight: 1.5, color: 'var(--text)' }}>
                      {parcel.description}
                    </p>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
                      {parcel.driver && (
                        <div style={{ 
                          display: 'flex', alignItems: 'center', gap: '8px',
                          fontSize: '0.75rem', color: 'var(--muted)'
                        }}>
                          <span>👤</span>
                          <span style={{ fontWeight: 600, color: 'var(--text)' }}>{parcel.driver.name}</span>
                        </div>
                      )}
                      
                      <div style={{ display: 'flex', gap: '8px', fontSize: '0.75rem', color: 'var(--muted)', background: 'var(--surface2)', padding: '10px', borderRadius: '10px', border: '1px solid var(--border)' }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: '0.65rem', textTransform: 'uppercase', opacity: 0.5, marginBottom: '2px' }}>Pick Up</div>
                          <div style={{ fontWeight: 600, color: 'var(--text)' }}>{parcel.from || '—'}</div>
                        </div>
                        <div style={{ width: '1px', background: 'var(--border)' }}></div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: '0.65rem', textTransform: 'uppercase', opacity: 0.5, marginBottom: '2px' }}>Drop Off</div>
                          <div style={{ fontWeight: 600, color: 'var(--text)' }}>{parcel.to || '—'}</div>
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', paddingTop: '12px', borderTop: '1px solid var(--border)' }}>
                      {status.next && (
                        <button 
                          onClick={() => moveStatus(parcel.id, status.next)}
                          style={{ 
                            flex: 1, fontSize: '0.75rem', padding: '8px 12px', borderRadius: '8px',
                            background: 'var(--accent)', border: 'none',
                            color: '#fff', cursor: 'pointer', fontWeight: 700,
                            transition: 'transform 0.1s'
                          }}
                          onMouseDown={e => e.target.style.transform = 'scale(0.95)'}
                          onMouseUp={e => e.target.style.transform = 'scale(1)'}
                        >
                          {status.nextLabel}
                        </button>
                      )}
                      
                      {status.id !== 'cancelled' && status.id !== 'delivered' && (
                        <button 
                          onClick={() => moveStatus(parcel.id, 'cancelled')}
                          style={{ 
                            fontSize: '0.75rem', padding: '8px 12px', borderRadius: '8px',
                            background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)',
                            color: 'var(--accent3)', cursor: 'pointer', fontWeight: 600
                          }}
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {showAddModal && (
        <Modal title="Parcel Registration" onClose={() => setShowAddModal(false)}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--muted)', marginBottom: '8px', fontWeight: 600, letterSpacing: '0.5px' }}>DESCRIPTION</label>
              <textarea 
                style={{ 
                  width: '100%', background: 'var(--surface2)', border: '1px solid var(--border)',
                  borderRadius: '12px', padding: '14px', color: 'var(--text)',
                  outline: 'none', fontSize: '0.9rem', minHeight: '100px', fontFamily: 'inherit',
                  resize: 'none'
                }}
                placeholder="Describe the parcel package..."
                value={newParcel.description}
                onChange={e => setNewParcel({ ...newParcel, description: e.target.value })}
              />
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--muted)', marginBottom: '8px', fontWeight: 600 }}>FROM (PICKUP)</label>
                <input 
                  placeholder="e.g. Engineering Gate"
                  style={{ 
                    width: '100%', background: 'var(--surface2)', border: '1px solid var(--border)',
                    borderRadius: '12px', padding: '12px', color: 'var(--text)',
                    outline: 'none', fontSize: '0.85rem'
                  }}
                  value={newParcel.from}
                  onChange={e => setNewParcel({ ...newParcel, from: e.target.value })}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--muted)', marginBottom: '8px', fontWeight: 600 }}>TO (DELIVERY)</label>
                <input 
                  placeholder="e.g. IT Building"
                  style={{ 
                    width: '100%', background: 'var(--surface2)', border: '1px solid var(--border)',
                    borderRadius: '12px', padding: '12px', color: 'var(--text)',
                    outline: 'none', fontSize: '0.85rem'
                  }}
                  value={newParcel.to}
                  onChange={e => setNewParcel({ ...newParcel, to: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--muted)', marginBottom: '8px', fontWeight: 600 }}>ASSIGN DRIVER</label>
              <select 
                style={{ 
                  width: '100%', background: 'var(--surface2)', border: '1px solid var(--border)',
                  borderRadius: '12px', padding: '12px', color: 'var(--text)',
                  outline: 'none', fontSize: '0.85rem'
                }}
                value={newParcel.driverId}
                onChange={e => setNewParcel({ ...newParcel, driverId: e.target.value })}
              >
                <option value="">Select Driver</option>
                {drivers.map(d => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>
            <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
              <button className="btn btn-ghost" style={{ flex: 1, padding: '14px', borderRadius: '12px' }} onClick={() => setShowAddModal(false)}>Cancel</button>
              <button className="btn btn-primary" style={{ flex: 1, padding: '14px', borderRadius: '12px' }} onClick={handleAdd}>Add Parcel</button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
