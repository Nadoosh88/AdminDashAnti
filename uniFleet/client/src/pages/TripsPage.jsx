
import React, { useState, useEffect } from 'react';
import Pill from '../components/Pill';
import { getTrips, getRoutes, createTrip, updateTrip, deleteTrip } from '../services/api';

const STATUS_OPTIONS = ['pending', 'confirmed', 'completed', 'cancelled'];

const emptyForm = {
  routeId: '',
  dateTime: '',
  price: 0,
  seats: 50,
  status: 'pending',
};

function Modal({ title, onClose, children }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{
        background: 'var(--surface)', border: '1px solid var(--border)',
        borderRadius: '16px', padding: '32px', width: '500px', maxWidth: '95vw',
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

function FormField({ label, error, children }) {
  return (
    <div style={{ marginBottom: '14px' }}>
      <label style={{
        display: 'block', fontSize: '0.72rem', color: 'var(--muted)',
        marginBottom: '6px', letterSpacing: '0.5px', textTransform: 'uppercase',
      }}>{label}</label>
      {children}
      {error && <span style={{ fontSize: '0.7rem', color: 'var(--accent3)', marginTop: '3px', display: 'block' }}>{error}</span>}
    </div>
  );
}

const inputStyle = {
  width: '100%', background: 'var(--surface2)', border: '1px solid var(--border)',
  borderRadius: '8px', padding: '9px 12px', color: 'var(--text)',
  fontFamily: 'DM Sans, sans-serif', fontSize: '0.85rem', outline: 'none',
  transition: 'border-color 0.2s',
};

export default function TripsPage() {
  const [trips, setTrips] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [tripsRes, routesRes] = await Promise.all([getTrips(), getRoutes()]);
      setTrips(tripsRes.data);
      setRoutes(routesRes.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  function openAdd() {
    setEditing(null);
    setForm(emptyForm);
    setErrors({});
    setShowModal(true);
  }

  function openEdit(trip) {
    setEditing(trip);
    setForm({
      routeId: trip.routeId,
      dateTime: trip.dateTime.split('.')[0], // Format for datetime-local
      price: trip.price,
      seats: trip.seats,
      status: trip.status,
    });
    setErrors({});
    setShowModal(true);
  }

  function validate() {
    const e = {};
    if (!form.routeId) e.routeId = 'Route is required';
    if (!form.dateTime) e.dateTime = 'Date & Time is required';
    if (form.price < 0) e.price = 'Price cannot be negative';
    if (form.seats <= 0) e.seats = 'Seats must be greater than 0';
    return e;
  }

  async function handleSave() {
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setSaving(true);
    try {
      const payload = { ...form, dateTime: new Date(form.dateTime).toISOString() };
      if (editing) {
        await updateTrip(editing.id, payload);
      } else {
        await createTrip(payload);
      }
      setShowModal(false);
      await loadData();
    } catch (err) {
      setErrors({ general: 'Failed to save. Please check your data.' });
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(trip) {
    try {
      await deleteTrip(trip.id);
      setConfirmDelete(null);
      await loadData();
    } catch (err) {
      alert('Cannot delete: ' + (err.response?.data?.message || err.message));
    }
  }

  return (
    <div className="content">
      <div className="toolbar">
        <button className="btn btn-primary" onClick={openAdd}>+ New Special Trip</button>
      </div>

      <div className="panel">
        <div className="panel-header">
          <div className="panel-title">⤷ Active Special Trips</div>
          <span style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>{trips.length} trips total</span>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--muted)' }}>⏳ Loading trips...</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Trip ID</th>
                <th>Route & Schedule</th>
                <th>Price</th>
                <th>Seat Occupancy</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {trips.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', color: 'var(--muted)', padding: '30px' }}>
                    No special trips scheduled.
                  </td>
                </tr>
              )}
              {trips.map(trip => (
                <tr key={trip.id}>
                  <td style={{ color: 'var(--accent)', fontFamily: 'Syne, sans-serif', fontSize: '0.85rem' }}>
                    #{trip.id.slice(0, 6).toUpperCase()}
                  </td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{trip.route?.name}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--muted)' }}>
                      {new Date(trip.dateTime).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                    </div>
                  </td>
                  <td style={{ fontWeight: 600 }}>${trip.price.toFixed(2)}</td>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem' }}>
                        <span>{trip.booked} / {trip.seats} seats</span>
                        <span>{Math.round((trip.booked/trip.seats)*100)}%</span>
                      </div>
                      <div style={{ width: '120px', height: '6px', background: 'var(--surface2)', borderRadius: '10px', overflow: 'hidden' }}>
                        <div style={{ 
                          width: `${(trip.booked/trip.seats)*100}%`, 
                          height: '100%', 
                          background: (trip.booked/trip.seats) > 0.8 ? 'var(--accent3)' : 'var(--accent)',
                          transition: 'width 0.5s ease'
                        }} />
                      </div>
                    </div>
                  </td>
                  <td><Pill status={trip.status} /></td>
                  <td>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button className="btn btn-ghost" style={{ padding: '4px 10px', fontSize: '0.72rem' }} onClick={() => openEdit(trip)}>✏️</button>
                      <button className="btn btn-danger" style={{ padding: '4px 10px', fontSize: '0.72rem' }} onClick={() => setConfirmDelete(trip)}>🗑</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <Modal title={editing ? '✏️ Edit Special Trip' : '+ Create Special Trip'} onClose={() => setShowModal(false)}>
          {errors.general && <div style={{ color: 'var(--accent3)', fontSize: '0.82rem', marginBottom: '10px' }}>⚠️ {errors.general}</div>}

          <FormField label="Assigned Route" error={errors.routeId}>
            <select
              style={{ ...inputStyle, cursor: 'pointer' }}
              value={form.routeId}
              onChange={e => setForm({ ...form, routeId: e.target.value })}
            >
              <option value="">Select a route...</option>
              {routes.map(r => (
                <option key={r.id} value={r.id}>{r.name} ({r.startStop} → {r.endStop})</option>
              ))}
            </select>
          </FormField>

          <FormField label="Departure Date & Time" error={errors.dateTime}>
            <input
              type="datetime-local"
              style={inputStyle}
              value={form.dateTime}
              onChange={e => setForm({ ...form, dateTime: e.target.value })}
            />
          </FormField>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <FormField label="Ticket Price ($)" error={errors.price}>
              <input
                type="number"
                style={inputStyle}
                value={form.price}
                onChange={e => setForm({ ...form, price: parseFloat(e.target.value) })}
              />
            </FormField>
            <FormField label="Total Seats" error={errors.seats}>
              <input
                type="number"
                style={inputStyle}
                value={form.seats}
                onChange={e => setForm({ ...form, seats: parseInt(e.target.value) })}
              />
            </FormField>
          </div>

          <FormField label="Booking Status">
            <select
              style={{ ...inputStyle, cursor: 'pointer' }}
              value={form.status}
              onChange={e => setForm({ ...form, status: e.target.value })}
            >
              {STATUS_OPTIONS.map(s => (
                <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
              ))}
            </select>
          </FormField>

          <div style={{ display: 'flex', gap: '10px', marginTop: '24px' }}>
            <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setShowModal(false)}>Cancel</button>
            <button
              className="btn btn-primary"
              style={{ flex: 1 }}
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? '⏳ Saving...' : editing ? '✅ Update Trip' : '+ Create Trip'}
            </button>
          </div>
        </Modal>
      )}

      {confirmDelete && (
        <Modal title="⚠️ Delete Trip" onClose={() => setConfirmDelete(null)}>
          <p style={{ color: 'var(--muted)', fontSize: '0.85rem', marginBottom: '20px' }}>
            Are you sure you want to delete this trip? This action cannot be undone.
          </p>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setConfirmDelete(null)}>Cancel</button>
            <button className="btn btn-danger" style={{ flex: 1 }} onClick={() => handleDelete(confirmDelete)}>🗑 Delete</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
