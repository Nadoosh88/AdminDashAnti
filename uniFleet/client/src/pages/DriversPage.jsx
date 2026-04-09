import React, { useState, useEffect } from 'react';
import Pill from '../components/Pill';
import { getDrivers, createDriver, updateDriver, deleteDriver, getBuses } from '../services/api';

const STATUS_OPTIONS = ['active', 'inactive', 'suspended'];

const emptyForm = {
  name: '', phone: '', licenseNumber: '', status: 'active', busId: '',
};

const inputStyle = {
  width: '100%', background: 'var(--surface2)', border: '1px solid var(--border)',
  borderRadius: '8px', padding: '9px 12px', color: 'var(--text)',
  fontFamily: 'DM Sans, sans-serif', fontSize: '0.85rem', outline: 'none',
  transition: 'border-color 0.2s',
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

function DriverAvatar({ name, index }) {
  const colors = [
    { bg: 'rgba(59,130,246,.15)', fg: 'var(--accent)' },
    { bg: 'rgba(16,185,129,.12)', fg: 'var(--accent4)' },
    { bg: 'rgba(129,140,248,.12)', fg: 'var(--accent2)' },
    { bg: 'rgba(245,158,11,.12)', fg: 'var(--warn)' },
    { bg: 'rgba(239,68,68,.12)', fg: 'var(--accent3)' },
  ];
  const c = colors[index % colors.length];
  const initials = name?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || '??';
  return (
    <div style={{
      width: '36px', height: '36px', borderRadius: '50%',
      background: c.bg, color: c.fg,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '0.78rem',
      flexShrink: 0,
    }}>{initials}</div>
  );
}

export default function DriversPage() {
  const [drivers, setDrivers] = useState([]);
  const [buses, setBuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [dRes, bRes] = await Promise.all([getDrivers(), getBuses()]);
      setDrivers(dRes.data);
      setBuses(bRes.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }

  function openAdd() {
    setEditing(null);
    setForm(emptyForm);
    setErrors({});
    setShowModal(true);
  }

  function openEdit(driver) {
    setEditing(driver);
    setForm({
      name: driver.name,
      phone: driver.phone,
      licenseNumber: driver.licenseNumber,
      status: driver.status,
      busId: driver.busId || '',
    });
    setErrors({});
    setShowModal(true);
  }

  function validate() {
    const e = {};
    if (!form.name.trim()) e.name = 'Name is required';
    if (!form.phone.trim()) e.phone = 'Phone number is required';
    if (!form.licenseNumber.trim()) e.licenseNumber = 'License number is required';
    return e;
  }

  async function handleSave() {
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        phone: form.phone.trim(),
        licenseNumber: form.licenseNumber.trim(),
        status: form.status,
        busId: form.busId || null,
      };
      if (editing) {
        await updateDriver(editing.id, payload);
      } else {
        await createDriver(payload);
      }
      setShowModal(false);
      await loadData();
    } catch (err) {
      setErrors({ general: err.response?.data?.message || 'Failed to save. Please try again.' });
    } finally { setSaving(false); }
  }

  async function handleDelete(driver) {
    try {
      await deleteDriver(driver.id);
      setConfirmDelete(null);
      await loadData();
    } catch (err) {
      alert('Cannot delete: ' + (err.response?.data?.message || err.message));
    }
  }

  // Unassigned buses + the one currently assigned to this driver
  const availableBuses = buses.filter(b => !b.driver || (editing && b.id === editing.busId));

  const filtered = drivers.filter(d => {
    const q = search.toLowerCase();
    const matchSearch = !q || d.name?.toLowerCase().includes(q) ||
      d.phone?.toLowerCase().includes(q) ||
      d.licenseNumber?.toLowerCase().includes(q) ||
      d.bus?.plateNumber?.toLowerCase().includes(q);
    const matchStatus = filterStatus === 'all' || d.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const statusCounts = {
    active: drivers.filter(d => d.status === 'active').length,
    inactive: drivers.filter(d => d.status === 'inactive').length,
    suspended: drivers.filter(d => d.status === 'suspended').length,
  };

  return (
    <div className="content">
      {/* Toolbar */}
      <div className="toolbar">
        <button className="btn btn-primary" onClick={openAdd} id="add-driver-btn">+ Add Driver</button>
        {['all', 'active', 'inactive', 'suspended'].map(s => (
          <button key={s} className="btn btn-ghost"
            style={filterStatus === s ? { borderColor: s === 'active' ? 'var(--accent4)' : s === 'suspended' ? 'var(--accent3)' : 'var(--accent)', color: s === 'active' ? 'var(--accent4)' : s === 'suspended' ? 'var(--accent3)' : 'var(--accent)' } : {}}
            onClick={() => setFilterStatus(s)}>
            {s === 'all' ? `All Drivers (${drivers.length})` :
             s === 'active' ? `🟢 Active (${statusCounts.active})` :
             s === 'inactive' ? `⚪ Inactive (${statusCounts.inactive})` :
             `🔴 Suspended (${statusCounts.suspended})`}
          </button>
        ))}
        <input
          placeholder="🔍 Search name, phone, license..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ ...inputStyle, width: '240px', marginLeft: 'auto' }}
        />
      </div>

      {/* Stat Cards */}
      <div className="stats-grid" style={{ marginBottom: '20px' }}>
        {[
          { label: 'TOTAL DRIVERS', value: drivers.length, color: 'var(--accent)', icon: '👤' },
          { label: 'ACTIVE', value: statusCounts.active, color: 'var(--accent4)', icon: '🟢' },
          { label: 'UNASSIGNED', value: drivers.filter(d => !d.busId).length, color: 'var(--warn)', icon: '🚌' },
          { label: 'SUSPENDED', value: statusCounts.suspended, color: 'var(--accent3)', icon: '🚫' },
        ].map((s, i) => (
          <div className="stat-card" key={i}>
            <div className="stat-icon">{s.icon}</div>
            <div className="stat-label">{s.label}</div>
            <div className="stat-value" style={{ color: s.color, fontSize: '1.8rem' }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Driver table */}
      <div className="panel">
        <div className="panel-header">
          <div className="panel-title">👤 Driver Accounts</div>
          <span style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>
            {filtered.length} of {drivers.length} drivers
          </span>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--muted)' }}>⏳ Loading driver data...</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Driver</th>
                <th>License</th>
                <th>Phone</th>
                <th>Assigned Bus</th>
                <th>Route</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', color: 'var(--muted)', padding: '30px' }}>
                    {search ? 'No drivers match your search.' : 'No drivers added yet.'}
                  </td>
                </tr>
              )}
              {filtered.map((driver, i) => (
                <tr key={driver.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <DriverAvatar name={driver.name} index={i} />
                      <div>
                        <div style={{ fontWeight: 500, fontSize: '0.85rem' }}>{driver.name}</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--muted)', marginTop: '1px' }}>
                          ID: {driver.id.slice(-6).toUpperCase()}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span style={{
                      fontFamily: 'Syne, sans-serif', fontSize: '0.8rem',
                      color: 'var(--accent2)', letterSpacing: '0.5px',
                    }}>{driver.licenseNumber}</span>
                  </td>
                  <td style={{ color: 'var(--muted)', fontSize: '0.82rem' }}>{driver.phone}</td>
                  <td>
                    {driver.bus ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontSize: '0.9rem' }}>🚌</span>
                        <span style={{ color: 'var(--accent4)', fontFamily: 'Syne', fontWeight: 600, fontSize: '0.82rem' }}>
                          {driver.bus.plateNumber}
                        </span>
                        <span style={{ color: 'var(--muted)', fontSize: '0.72rem' }}>({driver.bus.model})</span>
                      </div>
                    ) : (
                      <span style={{
                        background: 'rgba(245,158,11,.1)', color: 'var(--warn)',
                        borderRadius: '6px', padding: '2px 8px', fontSize: '0.72rem',
                      }}>Unassigned</span>
                    )}
                  </td>
                  <td style={{ color: 'var(--muted)', fontSize: '0.82rem' }}>
                    {driver.bus?.route?.name || '—'}
                  </td>
                  <td><Pill status={driver.status} /></td>
                  <td>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button
                        className="btn btn-ghost"
                        style={{ padding: '4px 10px', fontSize: '0.72rem' }}
                        onClick={() => openEdit(driver)}
                        id={`edit-driver-${driver.id}`}
                      >✏️ Edit</button>
                      <button
                        className="btn btn-danger"
                        style={{ padding: '4px 10px', fontSize: '0.72rem' }}
                        onClick={() => setConfirmDelete(driver)}
                        id={`delete-driver-${driver.id}`}
                      >🗑</button>
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
        <Modal
          title={editing ? `✏️ Edit Driver — ${editing.name}` : '+ Add New Driver'}
          onClose={() => setShowModal(false)}
        >
          {errors.general && (
            <div style={{
              background: 'rgba(239,68,68,.1)', border: '1px solid rgba(239,68,68,.3)',
              borderRadius: '8px', padding: '10px 14px', color: 'var(--accent3)',
              fontSize: '0.82rem', marginBottom: '16px',
            }}>⚠️ {errors.general}</div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <FormField label="Full Name" error={errors.name}>
              <input
                style={inputStyle}
                placeholder="e.g. Ahmad Karimi"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                onBlur={e => e.target.style.borderColor = 'var(--border)'}
              />
            </FormField>
            <FormField label="Phone Number" error={errors.phone}>
              <input
                style={inputStyle}
                placeholder="e.g. 555-0123"
                value={form.phone}
                onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                onBlur={e => e.target.style.borderColor = 'var(--border)'}
              />
            </FormField>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <FormField label="License Number" error={errors.licenseNumber}>
              <input
                style={inputStyle}
                placeholder="e.g. LIC-2024-001"
                value={form.licenseNumber}
                onChange={e => setForm(f => ({ ...f, licenseNumber: e.target.value }))}
                onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                onBlur={e => e.target.style.borderColor = 'var(--border)'}
              />
            </FormField>
            <FormField label="Status">
              <select
                style={{ ...inputStyle, cursor: 'pointer' }}
                value={form.status}
                onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
              >
                {STATUS_OPTIONS.map(s => (
                  <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                ))}
              </select>
            </FormField>
          </div>

          <FormField label="Assign to Bus (optional)">
            <select
              style={{ ...inputStyle, cursor: 'pointer' }}
              value={form.busId}
              onChange={e => setForm(f => ({ ...f, busId: e.target.value }))}
            >
              <option value="">— No Bus Assignment —</option>
              {availableBuses.map(b => (
                <option key={b.id} value={b.id}>
                  {b.plateNumber} · {b.model} ({b.capacity} seats)
                  {b.route ? ` — ${b.route.name}` : ' — No route'}
                </option>
              ))}
            </select>
          </FormField>

          <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
            <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setShowModal(false)}>Cancel</button>
            <button
              className="btn btn-primary"
              style={{ flex: 2, opacity: saving ? 0.7 : 1 }}
              onClick={handleSave}
              disabled={saving}
              id="save-driver-btn"
            >
              {saving ? '⏳ Saving...' : editing ? '✅ Update Driver' : '👤 Add Driver'}
            </button>
          </div>
        </Modal>
      )}

      {/* Delete Confirm */}
      {confirmDelete && (
        <Modal title="⚠️ Confirm Remove Driver" onClose={() => setConfirmDelete(null)}>
          <p style={{ color: 'var(--muted)', fontSize: '0.88rem', marginBottom: '20px', lineHeight: '1.6' }}>
            Are you sure you want to remove <strong style={{ color: 'var(--text)' }}>{confirmDelete.name}</strong> from the system?
            This action cannot be undone.
          </p>
          {confirmDelete.bus && (
            <div style={{
              background: 'rgba(245,158,11,.08)', border: '1px solid rgba(245,158,11,.2)',
              borderRadius: '8px', padding: '10px 14px', color: 'var(--warn)',
              fontSize: '0.82rem', marginBottom: '16px',
            }}>
              ⚠️ This driver is currently assigned to bus <strong>{confirmDelete.bus.plateNumber}</strong>.
              Removing them will leave the bus without a driver.
            </div>
          )}
          <div style={{ display: 'flex', gap: '10px' }}>
            <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setConfirmDelete(null)}>Cancel</button>
            <button className="btn btn-danger" style={{ flex: 1 }} onClick={() => handleDelete(confirmDelete)}>
              🗑 Remove Driver
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
