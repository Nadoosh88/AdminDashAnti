
import React, { useState } from 'react';

export default function StopList({ stops, onChange }) {
  const [newStopName, setNewStopName] = useState('');

  const addStop = () => {
    if (!newStopName.trim()) return;
    const newStop = {
      name: newStopName.trim(),
      order: stops.length + 1,
      lat: 0,
      lng: 0,
    };
    onChange([...stops, newStop]);
    setNewStopName('');
  };

  const removeStop = (index) => {
    const updated = stops.filter((_, i) => i !== index).map((s, i) => ({ ...s, order: i + 1 }));
    onChange(updated);
  };

  const moveStop = (index, direction) => {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= stops.length) return;
    const updated = [...stops];
    const temp = updated[index];
    updated[index] = updated[newIndex];
    updated[newIndex] = temp;
    // Update order
    const reordered = updated.map((s, i) => ({ ...s, order: i + 1 }));
    onChange(reordered);
  };

  return (
    <div style={{ marginTop: '14px' }}>
      <label style={{ display: 'block', fontSize: '0.72rem', color: 'var(--muted)', marginBottom: '6px', letterSpacing: '0.5px' }}>ROUTE STOPS</label>
      <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
        <input
          style={{
            flex: 1, background: 'var(--surface2)', border: '1px solid var(--border)',
            borderRadius: '8px', padding: '9px 12px', color: 'var(--text)',
            fontFamily: 'DM Sans, sans-serif', fontSize: '0.85rem', outline: 'none'
          }}
          placeholder="New stop name..."
          value={newStopName}
          onChange={(e) => setNewStopName(e.target.value)}
        />
        <button
          className="btn btn-primary"
          style={{ padding: '4px 14px' }}
          onClick={addStop}
        >
          Add
        </button>
      </div>
      <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
        {stops.map((stop, index) => (
          <div key={index} style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            background: 'var(--surface2)', padding: '6px 10px',
            borderRadius: '6px', marginBottom: '6px', border: '1px solid var(--border)'
          }}>
            <span style={{ color: 'var(--accent)', fontWeight: 'bold', minWidth: '20px' }}>{stop.order}.</span>
            <span style={{ flex: 1, fontSize: '0.82rem' }}>{stop.name}</span>
            <div style={{ display: 'flex', gap: '4px' }}>
              <button disabled={index === 0} onClick={() => moveStop(index, -1)} style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer' }}>↑</button>
              <button disabled={index === stops.length - 1} onClick={() => moveStop(index, 1)} style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer' }}>↓</button>
              <button onClick={() => removeStop(index)} style={{ background: 'none', border: 'none', color: 'var(--accent3)', cursor: 'pointer', padding: '0 4px' }}>✕</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
