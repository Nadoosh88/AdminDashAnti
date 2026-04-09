import React from 'react';

export default function StatCard({ icon, label, value, trend, trendDown, delay = 0 }) {
  return (
    <div className="stat-card" style={{ animationDelay: `${delay}ms` }}>
      <div className="stat-icon">{icon}</div>
      <div className="stat-label">{label}</div>
      <div className="stat-value">{value ?? '—'}</div>
      {trend && <div className={`stat-trend${trendDown ? ' down' : ''}`}>{trend}</div>}
    </div>
  );
}
