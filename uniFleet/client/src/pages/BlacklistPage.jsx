
import React, { useState, useEffect } from 'react';
import Pill from '../components/Pill';
import { getStudents, blacklistStudent, liftBlacklist } from '../services/api';

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

const inputStyle = {
  width: '100%', background: 'var(--surface2)', border: '1px solid var(--border)',
  borderRadius: '8px', padding: '10px 14px', color: 'var(--text)',
  fontFamily: 'DM Sans, sans-serif', fontSize: '0.85rem', outline: 'none',
  transition: 'border-color 0.2s', marginTop: '6px'
};

export default function BlacklistPage() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [targetStudent, setTargetStudent] = useState(null);
  const [reason, setReason] = useState('');
  const [until, setUntil] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    setLoading(true);
    try {
      const res = await getStudents();
      setStudents(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  function openBlacklist(student) {
    setTargetStudent(student);
    setReason('');
    setUntil('');
    setShowModal(true);
  }

  async function handleBlacklist() {
    if (!reason.trim()) return;
    setSaving(true);
    try {
      await blacklistStudent(targetStudent.id, { reason, until });
      setShowModal(false);
      await loadData();
    } catch (e) {
      alert('Failed to blacklist student.');
    } finally {
      setSaving(false);
    }
  }

  async function handleLift(id) {
    if (!window.confirm('Are you sure you want to restore access for this student?')) return;
    try {
      await liftBlacklist(id);
      await loadData();
    } catch (e) {
      alert('Failed to lift blacklist.');
    }
  }

  const filtered = students.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.universityId.toLowerCase().includes(search.toLowerCase()) ||
    s.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="content">
      <div className="toolbar">
        <input
          placeholder="🔍 Search by ID, name or email..."
          className="search-input"
          style={{ ...inputStyle, width: '350px', marginTop: 0 }}
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      <div className="panel">
        <div className="panel-header">
          <div className="panel-title">⤷ Student Security Directory</div>
          <span style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>{students.length} students registered</span>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px', color: 'var(--muted)' }}>⏳ Syncing with student database...</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>University ID</th>
                <th>Full Name & Email</th>
                <th>Account Status</th>
                <th>Incident Context</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', color: 'var(--muted)', padding: '30px' }}>
                    No student matching your search criteria.
                  </td>
                </tr>
              )}
              {filtered.map(student => (
                <tr key={student.id} style={{ opacity: student.status === 'blacklisted' ? 0.7 : 1 }}>
                  <td style={{ color: 'var(--accent)', fontWeight: 700, fontFamily: 'Syne, sans-serif' }}>
                    {student.universityId}
                  </td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{student.name}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--muted)' }}>{student.email}</div>
                  </td>
                  <td><Pill status={student.status} /></td>
                  <td style={{ maxWidth: '300px' }}>
                    {student.status === 'blacklisted' ? (
                      <div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--accent3)', fontWeight: 600 }}>⚠️ {student.blacklistedReason}</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--muted)', marginTop: '2px' }}>
                          Suspended until: {student.blacklistedUntil ? new Date(student.blacklistedUntil).toLocaleDateString() : 'INDIVIDUAL REVIEW'}
                        </div>
                      </div>
                    ) : (
                      <span style={{ color: 'var(--muted)', fontSize: '0.75rem' }}>No active incidents</span>
                    )}
                  </td>
                  <td>
                    {student.status === 'blacklisted' ? (
                      <button
                        className="btn btn-ghost"
                        style={{ color: 'var(--accent2)', fontSize: '0.75rem', padding: '5px 12px' }}
                        onClick={() => handleLift(student.id)}
                      >
                        Restore Access
                      </button>
                    ) : (
                      <button
                        className="btn btn-danger"
                        style={{ fontSize: '0.75rem', padding: '5px 12px' }}
                        onClick={() => openBlacklist(student)}
                      >
                        🚨 Block Access
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <Modal title={`👮 Account Suspension — ${targetStudent?.name}`} onClose={() => setShowModal(false)}>
          <div style={{ marginBottom: '18px' }}>
            <label style={{ display: 'block', fontSize: '0.72rem', color: 'var(--muted)', letterSpacing: '0.5px' }}>REASON FOR BLACKLIST</label>
            <textarea
              style={{ ...inputStyle, minHeight: '80px', fontFamily: 'inherit' }}
              placeholder="Detailed reason for security block..."
              value={reason}
              onChange={e => setReason(e.target.value)}
            />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '0.72rem', color: 'var(--muted)', letterSpacing: '0.5px' }}>SUSPENSION EXPIRES (OPTIONAL)</label>
            <input
              type="date"
              style={inputStyle}
              value={until}
              onChange={e => setUntil(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setShowModal(false)}>Cancel</button>
            <button
              className="btn btn-danger"
              style={{ flex: 1 }}
              onClick={handleBlacklist}
              disabled={saving}
            >
              {saving ? '⏳ Processing...' : '🚨 Confirm Blacklist'}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
