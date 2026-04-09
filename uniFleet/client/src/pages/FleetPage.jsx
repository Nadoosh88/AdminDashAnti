import React, { useState, useEffect } from 'react';
import Pill from '../components/Pill';
import { getBuses, createBus, updateBus, deleteBus, getRoutes } from '../services/api';

const CONDITION_OPTIONS = ['good', 'service due', 'fault', 'offline'];

const emptyForm = {
  plateNumber: '', model: '', capacity: '', condition: 'good', routeId: '',
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
        borderRadius: '16px', padding: '32px', width: '480px', maxWidth: '95vw',
        boxShadow: '0 24px 60px rgba(0,0,0,0.5)',
        animation: 'slideIn 0.2s ease',
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
      <label style={{ display: 'block', fontSize: '0.72rem', color: 'var(--muted)', marginBottom: '6px', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
        {label}
      </label>
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

export default function FleetPage() {
  const [buses, setBuses] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null); // bus object or null
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [search, setSearch] = useState('');
  const [filterCondition, setFilterCondition] = useState('all');

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [busRes, routeRes] = await Promise.all([getBuses(), getRoutes()]);
      setBuses(busRes.data);
      setRoutes(routeRes.data);
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

  function openEdit(bus) {
    setEditing(bus);
    setForm({
      plateNumber: bus.plateNumber,
      model: bus.model,
      capacity: String(bus.capacity),
      condition: bus.condition,
      routeId: bus.routeId || '',
    });
    setErrors({});
    setShowModal(true);
  }

  function validate() {
    const e = {};
    if (!form.plateNumber.trim()) e.plateNumber = 'Plate number is required';
    if (!form.model.trim()) e.model = 'Model is required';
    if (!form.capacity || isNaN(Number(form.capacity)) || Number(form.capacity) <= 0)
      e.capacity = 'Capacity must be a positive number';
    return e;
  }

  async function handleSave() {
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setSaving(true);
    try {
      const payload = {
        plateNumber: form.plateNumber.trim(),
        model: form.model.trim(),
        capacity: Number(form.capacity),
        condition: form.condition,
        routeId: form.routeId || null,
      };
      if (editing) {
        await updateBus(editing.id, payload);
      } else {
        await createBus(payload);
      }
      setShowModal(false);
      await loadData();
    } catch (err) {
      setErrors({ general: err.response?.data?.message || 'Failed to save. Please try again.' });
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(bus) {
    try {
      await deleteBus(bus.id);
      setConfirmDelete(null);
      await loadData();
    } catch (err) {
      alert('Failed to delete bus: ' + (err.response?.data?.message || err.message));
    }
  }

  const conditionColor = {
    good: 'var(--accent4)',
    'service due': 'var(--warn)',
    fault: 'var(--accent3)',
    offline: 'var(--muted)',
  };

  const filtered = buses.filter(b => {
    const q = search.toLowerCase();
    const matchSearch = !q || b.plateNumber?.toLowerCase().includes(q) ||
      b.model?.toLowerCase().includes(q) ||
      b.driver?.name?.toLowerCase().includes(q) ||
      b.route?.name?.toLowerCase().includes(q);
    const matchCondition = filterCondition === 'all' || b.condition === filterCondition;
    return matchSearch && matchCondition;
  });

  return (
    <div className="content">
      {/* Toolbar */}
      <div className="toolbar">
        <button className="btn btn-primary" id="add-bus-btn" onClick={openAdd}>+ Add Bus</button>
        <button className="btn btn-ghost" onClick={() => setFilterCondition('all')}
          style={filterCondition === 'all' ? { borderColor: 'var(--accent)', color: 'var(--accent)' } : {}}>
          All Buses ({buses.length})
        </button>
        <button className="btn btn-ghost" onClick={() => setFilterCondition('good')}
          style={filterCondition === 'good' ? { borderColor: 'var(--accent4)', color: 'var(--accent4)' } : {}}>
          🟢 Good
        </button>
        <button className="btn btn-ghost" onClick={() => setFilterCondition('service due')}
          style={filterCondition === 'service due' ? { borderColor: 'var(--warn)', color: 'var(--warn)' } : {}}>
          🟡 Service Due
        </button>
        <button className="btn btn-ghost" onClick={() => setFilterCondition('fault')}
          style={filterCondition === 'fault' ? { borderColor: 'var(--accent3)', color: 'var(--accent3)' } : {}}>
          🔴 Fault
        </button>
        <input
          placeholder="🔍 Search plate, model, driver..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ ...inputStyle, width: '240px', marginLeft: 'auto' }}
        />
      </div>

      {/* Summary Cards */}
      <div className="stats-grid" style={{ marginBottom: '20px' }}>
        {[
          { label: 'TOTAL BUSES', value: buses.length, color: 'var(--accent)', icon: '🚌' },
          { label: 'GOOD CONDITION', value: buses.filter(b => b.condition === 'good').length, color: 'var(--accent4)', icon: '✅' },
          { label: 'SERVICE DUE', value: buses.filter(b => b.condition === 'service due').length, color: 'var(--warn)', icon: '🔧' },
          { label: 'FAULTS', value: buses.filter(b => b.condition === 'fault').length, color: 'var(--accent3)', icon: '⚠️' },
        ].map((s, i) => (
          <div className="stat-card" key={i}>
            <div className="stat-icon">{s.icon}</div>
            <div className="stat-label">{s.label}</div>
            <div className="stat-value" style={{ color: s.color, fontSize: '1.8rem' }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Fleet Table */}
      <div className="panel">
        <div className="panel-header">
          <div className="panel-title">🚌 Bus Fleet Registry</div>
          <span style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>
            {filtered.length} of {buses.length} buses
          </span>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--muted)' }}>
            <div style={{ fontSize: '1.5rem', marginBottom: '8px' }}>⏳</div>
            Loading fleet data...
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Bus ID</th>
                <th>Plate Number</th>
                <th>Model</th>
                <th>Capacity</th>
                <th>Driver</th>
                <th>Route</th>
                <th>Condition</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', color: 'var(--muted)', padding: '30px' }}>
                    {search ? 'No buses match your search.' : 'No buses added yet. Click "+ Add Bus" to get started.'}
                  </td>
                </tr>
              )}
              {filtered.map((bus, i) => {
                const condColor = conditionColor[bus.condition] || 'var(--muted)';
                return (
                  <tr key={bus.id}>
                    <td style={{ color: condColor, fontFamily: 'Syne, sans-serif', fontWeight: 700 }}>
                      #{String(i + 1).padStart(2, '0')}
                    </td>
                    <td style={{ fontWeight: 600, color: 'var(--text)' }}>{bus.plateNumber}</td>
                    <td style={{ color: 'var(--muted)' }}>{bus.model}</td>
                    <td>
                      <span style={{
                        background: 'rgba(59,130,246,.1)', color: 'var(--accent)',
                        borderRadius: '6px', padding: '2px 8px', fontSize: '0.78rem', fontFamily: 'Syne',
                      }}>
                        {bus.capacity} seats
                      </span>
                    </td>
                    <td>
                      {bus.driver ? (
                        <div className="driver-cell">
                          <div className="mini-avatar" style={{ background: 'rgba(129,140,248,.15)', color: 'var(--accent2)' }}>
                            {bus.driver.name?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
                          </div>
                          {bus.driver.name}
                        </div>
                      ) : (
                        <span style={{ color: 'var(--muted)', fontSize: '0.78rem', fontStyle: 'italic' }}>Unassigned</span>
                      )}
                    </td>
                    <td>
                      {bus.route ? (
                        <span style={{ color: 'var(--accent)', fontSize: '0.82rem' }}>{bus.route.name}</span>
                      ) : (
                        <span style={{ color: 'var(--muted)', fontSize: '0.78rem', fontStyle: 'italic' }}>No route</span>
                      )}
                    </td>
                    <td>
                      <Pill status={bus.condition === 'good' ? 'active' : bus.condition === 'fault' ? 'inactive' : bus.condition === 'service due' ? 'pending' : 'inactive'} />
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button
                          className="btn btn-ghost"
                          style={{ padding: '4px 10px', fontSize: '0.72rem' }}
                          onClick={() => openEdit(bus)}
                          id={`edit-bus-${bus.id}`}
                        >
                          ✏️ Edit
                        </button>
                        <button
                          className="btn btn-danger"
                          style={{ padding: '4px 10px', fontSize: '0.72rem' }}
                          onClick={() => setConfirmDelete(bus)}
                          id={`delete-bus-${bus.id}`}
                        >
                          🗑
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <Modal title={editing ? `✏️ Edit Bus — ${editing.plateNumber}` : '+ Add New Bus'} onClose={() => setShowModal(false)}>
          {errors.general && (
            <div style={{
              background: 'rgba(239,68,68,.1)', border: '1px solid rgba(239,68,68,.3)',
              borderRadius: '8px', padding: '10px 14px', color: 'var(--accent3)',
              fontSize: '0.82rem', marginBottom: '16px',
            }}>
              ⚠️ {errors.general}
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <FormField label="Plate Number" error={errors.plateNumber}>
              <input
                style={inputStyle}
                placeholder="e.g. UNB-101"
                value={form.plateNumber}
                onChange={e => setForm(f => ({ ...f, plateNumber: e.target.value }))}
                onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                onBlur={e => e.target.style.borderColor = 'var(--border)'}
              />
            </FormField>

            <FormField label="Model" error={errors.model}>
              <input
                style={inputStyle}
                placeholder="e.g. Toyota Coaster"
                value={form.model}
                onChange={e => setForm(f => ({ ...f, model: e.target.value }))}
                onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                onBlur={e => e.target.style.borderColor = 'var(--border)'}
              />
            </FormField>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <FormField label="Capacity (seats)" error={errors.capacity}>
              <input
                style={inputStyle}
                type="number"
                min="1"
                max="100"
                placeholder="e.g. 30"
                value={form.capacity}
                onChange={e => setForm(f => ({ ...f, capacity: e.target.value }))}
                onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                onBlur={e => e.target.style.borderColor = 'var(--border)'}
              />
            </FormField>

            <FormField label="Condition">
              <select
                style={{ ...inputStyle, cursor: 'pointer' }}
                value={form.condition}
                onChange={e => setForm(f => ({ ...f, condition: e.target.value }))}
              >
                {CONDITION_OPTIONS.map(c => (
                  <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                ))}
              </select>
            </FormField>
          </div>

          <FormField label="Assign to Route (optional)">
            <select
              style={{ ...inputStyle, cursor: 'pointer' }}
              value={form.routeId}
              onChange={e => setForm(f => ({ ...f, routeId: e.target.value }))}
            >
              <option value="">— No Route —</option>
              {routes.map(r => (
                <option key={r.id} value={r.id}>{r.name} ({r.startStop} → {r.endStop})</option>
              ))}
            </select>
          </FormField>

          <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
            <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setShowModal(false)}>
              Cancel
            </button>
            <button
              className="btn btn-primary"
              style={{ flex: 2, opacity: saving ? 0.7 : 1 }}
              onClick={handleSave}
              disabled={saving}
              id="save-bus-btn"
            >
              {saving ? '⏳ Saving...' : editing ? '✅ Update Bus' : '🚌 Add Bus'}
            </button>
          </div>
        </Modal>
      )}

      {/* Delete Confirm Modal */}
      {confirmDelete && (
        <Modal title="⚠️ Confirm Delete" onClose={() => setConfirmDelete(null)}>
          <p style={{ color: 'var(--muted)', fontSize: '0.88rem', marginBottom: '20px', lineHeight: '1.6' }}>
            Are you sure you want to remove <strong style={{ color: 'var(--text)' }}>{confirmDelete.plateNumber}</strong> ({confirmDelete.model}) from the fleet?
            This action cannot be undone.
          </p>
          {confirmDelete.driver && (
            <div style={{
              background: 'rgba(245,158,11,.08)', border: '1px solid rgba(245,158,11,.2)',
              borderRadius: '8px', padding: '10px 14px', color: 'var(--warn)',
              fontSize: '0.82rem', marginBottom: '16px',
            }}>
              ⚠️ This bus is currently assigned to driver <strong>{confirmDelete.driver.name}</strong>. Deleting will unassign them.
            </div>
          )}
          <div style={{ display: 'flex', gap: '10px' }}>
            <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setConfirmDelete(null)}>Cancel</button>
            <button className="btn btn-danger" style={{ flex: 1 }} onClick={() => handleDelete(confirmDelete)}>
              🗑 Delete Bus
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
