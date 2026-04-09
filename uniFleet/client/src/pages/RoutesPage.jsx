
import React, { useState, useEffect } from 'react';
import Pill from '../components/Pill';
import StopList from '../components/StopList';
import { getRoutes, createRoute, updateRoute, deleteRoute } from '../services/api';

const STATUS_OPTIONS = ['active', 'en-route', 'pending', 'inactive'];

const emptyForm = {
  name: '',
  startStop: '',
  endStop: '',
  status: 'active',
  stops: [],
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
        borderRadius: '16px', padding: '32px', width: '550px', maxWidth: '95vw',
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

export default function RoutesPage() {
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [search, setSearch] = useState('');

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    setLoading(true);
    try {
      const res = await getRoutes();
      setRoutes(res.data);
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

  function openEdit(route) {
    setEditing(route);
    setForm({
      name: route.name,
      startStop: route.startStop,
      endStop: route.endStop,
      status: route.status,
      stops: route.stops.map(s => ({
        name: s.name,
        order: s.order,
        lat: s.lat,
        lng: s.lng
      })),
    });
    setErrors({});
    setShowModal(true);
  }

  function validate() {
    const e = {};
    if (!form.name.trim()) e.name = 'Name is required';
    if (!form.startStop.trim()) e.startStop = 'Start stop is required';
    if (!form.endStop.trim()) e.endStop = 'End stop is required';
    return e;
  }

  async function handleSave() {
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setSaving(true);
    try {
      if (editing) {
        await updateRoute(editing.id, form);
      } else {
        await createRoute(form);
      }
      setShowModal(false);
      await loadData();
    } catch (err) {
      setErrors({ general: 'Failed to save. Please check your data.' });
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(route) {
    try {
      await deleteRoute(route.id);
      setConfirmDelete(null);
      await loadData();
    } catch (err) {
      alert('Cannot delete: ' + (err.response?.data?.message || err.message));
    }
  }

  const filtered = routes.filter(r =>
    r.name.toLowerCase().includes(search.toLowerCase()) ||
    r.id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="content">
      {/* Toolbar */}
      <div className="toolbar">
        <button className="btn btn-primary" onClick={openAdd}>+ New Route</button>
        <input
          placeholder="🔍 Search routes by name or ID..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ ...inputStyle, width: '300px', marginLeft: 'auto' }}
        />
      </div>

      {/* Routes Table */}
      <div className="panel">
        <div className="panel-header">
          <div className="panel-title">⤷ All Routes</div>
          <span style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>{filtered.length} routes active</span>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--muted)' }}>⏳ Loading routes...</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Route ID</th>
                <th>Name</th>
                <th>Stops</th>
                <th>Buses</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', color: 'var(--muted)', padding: '30px' }}>
                    No routes found.
                  </td>
                </tr>
              )}
              {filtered.map(route => (
                <tr key={route.id}>
                  <td style={{ color: 'var(--accent)', fontFamily: 'Syne, sans-serif', fontSize: '0.85rem' }}>
                    {route.id.slice(0, 8).toUpperCase()}
                  </td>
                  <td>
                    <div style={{ fontWeight: 500 }}>{route.name}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--muted)' }}>{route.startStop} → {route.endStop}</div>
                  </td>
                  <td>
                    <span style={{
                      background: 'rgba(129,140,248,.12)', color: 'var(--accent2)',
                      padding: '2px 8px', borderRadius: '6px', fontSize: '0.78rem', fontWeight: 600
                    }}>
                      {route.stops?.length || 0} stops
                    </span>
                  </td>
                  <td>
                    <span style={{ color: 'var(--accent4)', fontWeight: 600 }}>
                      {route._count?.buses || 0} buses
                    </span>
                  </td>
                  <td><Pill status={route.status} /></td>
                  <td>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button
                        className="btn btn-ghost"
                        style={{ padding: '4px 10px', fontSize: '0.72rem' }}
                        onClick={() => openEdit(route)}
                      >
                        ✏️ Edit
                      </button>
                      <button
                        className="btn btn-danger"
                        style={{ padding: '4px 10px', fontSize: '0.72rem' }}
                        onClick={() => setConfirmDelete(route)}
                      >
                        🗑
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <Modal title={editing ? `✏️ Edit Route — ${editing.name}` : '+ Add New Route'} onClose={() => setShowModal(false)}>
          {errors.general && <div style={{ color: 'var(--accent3)', fontSize: '0.82rem', marginBottom: '10px' }}>⚠️ {errors.general}</div>}

          <FormField label="Route Name" error={errors.name}>
            <input
              style={inputStyle}
              placeholder="e.g. East Campus Circular"
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
            />
          </FormField>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <FormField label="Start Stop" error={errors.startStop}>
              <input
                style={inputStyle}
                placeholder="Gate 1"
                value={form.startStop}
                onChange={e => setForm({ ...form, startStop: e.target.value })}
              />
            </FormField>
            <FormField label="End Stop" error={errors.endStop}>
              <input
                style={inputStyle}
                placeholder="Faculty Block A"
                value={form.endStop}
                onChange={e => setForm({ ...form, endStop: e.target.value })}
              />
            </FormField>
          </div>

          <FormField label="Status">
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

          <StopList
            stops={form.stops}
            onChange={(stops) => setForm({ ...form, stops })}
          />

          <div style={{ display: 'flex', gap: '10px', marginTop: '24px' }}>
            <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setShowModal(false)}>Cancel</button>
            <button
              className="btn btn-primary"
              style={{ flex: 1 }}
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? '⏳ Saving...' : editing ? '✅ Update Route' : '+ Add Route'}
            </button>
          </div>
        </Modal>
      )}

      {/* Delete Confirmation */}
      {confirmDelete && (
        <Modal title="⚠️ Delete Route" onClose={() => setConfirmDelete(null)}>
          <p style={{ color: 'var(--muted)', fontSize: '0.85rem', marginBottom: '20px' }}>
            Are you sure you want to delete <strong style={{ color: 'var(--text)' }}>{confirmDelete.name}</strong>?
            This will also remove all intermediate stop data.
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
