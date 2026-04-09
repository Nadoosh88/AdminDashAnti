import React, { useState } from 'react';
import StatCard from '../components/StatCard';
import LiveMap from '../components/LiveMap';
import Pill from '../components/Pill';
import { useSocket } from '../hooks/useSocket';

export default function LiveMapPage() {
  const [busPositions, setBusPositions] = useState([]);

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
          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="btn btn-ghost" style={{ fontSize: '0.78rem', padding: '6px 12px' }}>Filter Route</button>
            <button className="btn btn-primary" style={{ fontSize: '0.78rem', padding: '6px 12px' }}>Track Bus</button>
          </div>
        </div>
        <LiveMap buses={busPositions} height="480px" />

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
