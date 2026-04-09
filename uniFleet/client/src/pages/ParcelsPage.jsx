
import React, { useState, useEffect } from 'react';
import { getParcels, createParcel, updateParcelStatus, deleteParcel, getTrips } from '../services/api';

const STATUSES = [
  { id: 'pending', label: '📁 Pending', color: 'var(--muted)' },
  { id: 'in-transit', label: '🚚 In-Transit', color: 'var(--accent)' },
  { id: 'delivered', label: '✅ Delivered', color: 'var(--accent2)' },
  { id: 'cancelled', label: '❌ Cancelled', color: 'var(--accent3)' },
];

function Modal({ title, onClose, children }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{
        background: 'var(--surface)', border: '1px solid var(--border)',
        borderRadius: '16px', padding: '32px', width: '450px', maxWidth: '95vw',
        boxShadow: '0 24px 60px rgba(0,0,0,0.5)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
          <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '1rem' }}>{title}</h3>
          <button onClick={onClose} style={{
            background: 'var(--surface2)', border: '1px solid var(--border)',
            color: 'var(--muted)', borderRadius: '8px', padding: '4px 10px',
            cursor: 'pointer', fontSize: '1rem',
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
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [search, setSearch] = useState('');
  const [newParcel, setNewParcel] = useState({ description: '', tripId: '' });

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [pRes, tRes] = await Promise.all([getParcels(), getTrips()]);
      setParcels(pRes.data);
      setTrips(tRes.data);
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
      setNewParcel({ description: '', tripId: '' });
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
    if (!window.confirm('Delete this parcel?')) return;
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
      <div className="toolbar">
        <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>+ Register Parcel</button>
        <input 
          placeholder="🔍 Search tracking code or description..." 
          className="search-input"
          style={{ 
            width: '300px', marginLeft: 'auto',
            background: 'var(--surface2)', border: '1px solid var(--border)',
            borderRadius: '8px', padding: '10px 16px', color: 'var(--text)',
            outline: 'none', fontSize: '0.85rem'
          }}
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '100px', color: 'var(--muted)' }}>⏳ Loading parcel console...</div>
      ) : (
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
          gap: '20px',
          alignItems: 'start'
        }}>
          {STATUSES.map(status => (
            <div key={status.id} style={{
              background: 'rgba(15, 23, 42, 0.4)',
              borderRadius: '16px',
              border: '1px solid var(--border)',
              padding: '16px',
              minHeight: '400px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 700 }}>{status.label}</h4>
                <span style={{ 
                  background: 'var(--surface2)', padding: '2px 8px', borderRadius: '6px', 
                  fontSize: '0.75rem', color: 'var(--muted)', fontWeight: 600 
                }}>
                  {filtered.filter(p => p.status === status.id).length}
                </span>
              </div>

              {filtered.filter(p => p.status === status.id).map(parcel => (
                <div key={parcel.id} style={{
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  borderRadius: '12px',
                  padding: '16px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  position: 'relative',
                  transition: 'transform 0.2s',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ color: 'var(--accent)', fontWeight: 800, fontSize: '0.8rem', fontFamily: 'Syne, sans-serif' }}>
                      {parcel.trackingCode}
                    </span>
                    <button onClick={() => handleDelete(parcel.id)} style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', fontSize: '0.8rem' }}>🗑</button>
                  </div>
                  
                  <p style={{ fontSize: '0.85rem', marginBottom: '12px', lineHeight: 1.4 }}>{parcel.description}</p>
                  
                  {parcel.trip && (
                    <div style={{ 
                      background: 'var(--surface2)', padding: '6px 10px', borderRadius: '8px', 
                      fontSize: '0.72rem', border: '1px solid var(--border)', marginBottom: '12px' 
                    }}>
                      <span style={{ color: 'var(--muted)' }}>Assigned Trip:</span>
                      <div style={{ fontWeight: 600 }}>{parcel.trip.route?.name}</div>
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                    {STATUSES.map(s => s.id !== parcel.status && (
                      <button 
                        key={s.id} 
                        onClick={() => moveStatus(parcel.id, s.id)}
                        style={{ 
                          fontSize: '0.65rem', padding: '3px 8px', borderRadius: '4px',
                          background: 'var(--surface2)', border: '1px solid var(--border)',
                          color: 'var(--text)', cursor: 'pointer', opacity: 0.8
                        }}
                        onMouseEnter={e => e.target.style.opacity = 1}
                        onMouseLeave={e => e.target.style.opacity = 0.8}
                      >
                        Move to {s.id.split('-').join(' ')}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      {showAddModal && (
        <Modal title="+ Register New Parcel" onClose={() => setShowAddModal(false)}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.72rem', color: 'var(--muted)', marginBottom: '6px' }}>DESCRIPTION</label>
              <textarea 
                style={{ 
                  width: '100%', background: 'var(--surface2)', border: '1px solid var(--border)',
                  borderRadius: '8px', padding: '10px', color: 'var(--text)',
                  outline: 'none', fontSize: '0.85rem', minHeight: '80px', fontFamily: 'inherit'
                }}
                placeholder="e.g. Lost laptop bag, found at cafeteria..."
                value={newParcel.description}
                onChange={e => setNewParcel({ ...newParcel, description: e.target.value })}
              />
            </div>
            
            <div>
              <label style={{ display: 'block', fontSize: '0.72rem', color: 'var(--muted)', marginBottom: '6px' }}>ASSIGN TO TRIP (OPTIONAL)</label>
              <select 
                style={{ 
                  width: '100%', background: 'var(--surface2)', border: '1px solid var(--border)',
                  borderRadius: '8px', padding: '10px', color: 'var(--text)',
                  outline: 'none', fontSize: '0.85rem'
                }}
                value={newParcel.tripId}
                onChange={e => setNewParcel({ ...newParcel, tripId: e.target.value })}
              >
                <option value="">No trip assigned</option>
                {trips.map(t => (
                  <option key={t.id} value={t.id}>
                    {t.route?.name} - {new Date(t.dateTime).toLocaleDateString()}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
              <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setShowAddModal(false)}>Cancel</button>
              <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleAdd}>Add Parcel</button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
