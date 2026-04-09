
import React, { useState, useEffect } from 'react';
import Pill from '../components/Pill';
import { getTrips, getRoutes, getBuses, createTrip, updateTrip, deleteTrip } from '../services/api';

const STATUS_OPTIONS = ['confirmed', 'pending approval', 'canceled'];

const emptyForm = {
  routeNameString: '',
  busNumberString: '',
  dateTime: '',
  price: 0,
  seats: 50,
  status: 'pending approval',
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
  const [buses, setBuses] = useState([]);
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
      const [tripsRes, routesRes, busesRes] = await Promise.all([getTrips(), getRoutes(), getBuses()]);
      setTrips(tripsRes.data);
      setRoutes(routesRes.data);
      setBuses(busesRes.data);
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
      routeNameString: trip.routeNameString || '',
      busNumberString: trip.busNumberString || '',
      dateTime: trip.dateTime ? trip.dateTime.split('.')[0] : '', // Format for datetime-local
      price: trip.price || 0,
      seats: trip.seats || 50,
      status: trip.status || 'pending approval',
    });
    setErrors({});
    setShowModal(true);
  }

  function validate() {
    const e = {};
    if (!form.routeNameString) e.routeNameString = 'Route is required';
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

  const exportSchedule = () => {
    if (trips.length === 0) return;
    
    // CSV Header
    const headers = ["TRIP ID", "DATE & TIME", "BUS", "SEATS", "PRICE", "STATUS"];
    const rows = trips.map((trip, idx) => [
      `ST#${idx + 1}`,
      new Date(trip.dateTime).toLocaleString([], { month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit' }),
      trip.busNumberString || (trip.bus ? trip.bus.plateNumber : 'N/A'),
      `${trip.booked}/${trip.seats}`,
      `${trip.price} JD`,
      trip.status
    ]);

    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${(cell || '').toString().replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `special_trip_schedule_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="content">


      <div className="toolbar" style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
        <button className="btn btn-primary" onClick={openAdd} style={{ padding: '10px 20px', borderRadius: '8px' }}>+ Schedule Trip</button>
        <button className="btn btn-ghost" onClick={exportSchedule} style={{ padding: '10px 20px', borderRadius: '8px', background: 'var(--surface2)', border: '1px solid var(--border)' }}>Export Schedule</button>
      </div>

      <div className="panel">
        <div className="panel-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', gap: '12px', padding: '20px' }}>
          <span role="img" aria-label="calendar" style={{ fontSize: '1.2rem' }}>🗓️</span>
          <div className="panel-title" style={{ fontSize: '1rem', fontWeight: 600, margin: 0 }}>Special Trip Schedule</div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--muted)' }}>⏳ Loading trips...</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th style={{ textAlign: 'left', padding: '12px 20px', color: 'var(--muted)', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.05em' }}>Trip ID</th>
                <th style={{ textAlign: 'left', padding: '12px 20px', color: 'var(--muted)', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.05em' }}>Date & Time</th>
                <th style={{ textAlign: 'left', padding: '12px 20px', color: 'var(--muted)', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.05em' }}>Bus</th>
                <th style={{ textAlign: 'left', padding: '12px 20px', color: 'var(--muted)', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.05em' }}>Seats</th>
                <th style={{ textAlign: 'left', padding: '12px 20px', color: 'var(--muted)', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.05em' }}>Price</th>
                <th style={{ textAlign: 'left', padding: '12px 20px', color: 'var(--muted)', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.05em' }}>Status</th>
                <th style={{ textAlign: 'center', padding: '12px 20px', color: 'var(--muted)', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.05em' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {trips.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', color: 'var(--muted)', padding: '30px' }}>
                    No special trips scheduled.
                  </td>
                </tr>
              )}
              {trips.map((trip, idx) => (
                <tr key={trip.id} style={{ borderTop: '1px solid var(--border)' }}>
                  <td style={{ color: 'var(--accent)', fontFamily: 'Syne, sans-serif', fontSize: '0.85rem', padding: '16px 20px' }}>
                    ST#{idx + 1}
                  </td>
                  <td style={{ padding: '16px 20px' }}>
                    <div style={{ fontSize: '0.875rem' }}>
                      {new Date(trip.dateTime).toLocaleString([], { month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </td>
                  <td style={{ padding: '16px 20px', fontSize: '0.875rem' }}>
                    {trip.busNumberString || (trip.bus ? `Bus #${trip.bus.plateNumber}` : <span style={{ color: 'var(--muted)' }}>Unassigned</span>)}
                  </td>
                  <td style={{ padding: '16px 20px', fontSize: '0.875rem' }}>
                    {trip.booked} / {trip.seats}
                  </td>
                  <td style={{ padding: '16px 20px', fontWeight: 600, fontSize: '0.875rem' }}>
                    {trip.price} JD
                  </td>
                  <td style={{ padding: '16px 20px' }}>
                    <Pill status={trip.status} />
                  </td>
                  <td style={{ padding: '16px 20px', textAlign: 'center' }}>
                    <button className="btn btn-ghost" style={{ padding: '6px 12px', fontSize: '0.8rem', background: 'var(--surface2)', borderRadius: '6px' }} onClick={() => openEdit(trip)}>Edit</button>
                    <button className="btn btn-danger" style={{ padding: '6px 12px', fontSize: '0.8rem', marginLeft: '8px' }} onClick={() => setConfirmDelete(trip)}>🗑</button>
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

          <FormField label="Assigned Route" error={errors.routeNameString}>
            <input
              type="text"
              placeholder="e.g. North Campus Loop"
              style={inputStyle}
              value={form.routeNameString}
              onChange={e => setForm({ ...form, routeNameString: e.target.value })}
            />
          </FormField>

          <FormField label="Departure Date & Time" error={errors.dateTime}>
            <input
              type="datetime-local"
              style={inputStyle}
              value={form.dateTime}
              onChange={e => setForm({ ...form, dateTime: e.target.value })}
            />
          </FormField>

          <FormField label="Specify Bus" error={errors.busNumberString}>
            <input
              type="text"
              placeholder="e.g. NBT-101"
              style={inputStyle}
              value={form.busNumberString}
              onChange={e => setForm({ ...form, busNumberString: e.target.value })}
            />
          </FormField>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <FormField label="Ticket Price (JD)" error={errors.price}>
              <input
                type="number"
                step="0.1"
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
