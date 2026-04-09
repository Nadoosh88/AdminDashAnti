
import React, { useState, useEffect } from 'react';
import { getRatingsAnalytics, getRatingComments } from '../services/api';

const CATEGORIES = [
  { key: 'Driving Quality', color: '#10b981' },
  { key: 'Conduct',         color: '#3b82f6' },
  { key: 'Speed & Safety',  color: '#f59e0b' },
  { key: 'Punctuality',     color: '#8b5cf6' },
  { key: 'Helpfulness',     color: '#06b6d4' }
];

function RadarChart({ data }) {
  const size = 300;
  const center = size / 2;
  const radius = center * 0.8;
  const levels = 5;

  const getCoordinates = (index, value) => {
    const angle = (Math.PI * 2 * index) / CATEGORIES.length - Math.PI / 2;
    const r = (value / 5) * radius;
    return {
      x: center + r * Math.cos(angle),
      y: center + r * Math.sin(angle)
    };
  };

  const points = CATEGORIES.map((cat, i) => {
    const val = data[cat.key] || 0;
    const { x, y } = getCoordinates(i, val);
    return `${x},${y}`;
  }).join(' ');

  return (
    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
      <svg width={size} height={size} style={{ overflow: 'visible' }}>
        {/* Background Polygons */}
        {[...Array(levels)].map((_, l) => {
          const levelRadius = (radius / levels) * (l + 1);
          const polyPoints = CATEGORIES.map((_, i) => {
            const angle = (Math.PI * 2 * i) / CATEGORIES.length - Math.PI / 2;
            return `${center + levelRadius * Math.cos(angle)},${center + levelRadius * Math.sin(angle)}`;
          }).join(' ');
          return <polygon key={l} points={polyPoints} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />;
        })}

        {/* Axis Lines */}
        {CATEGORIES.map((cat, i) => {
          const { x, y } = getCoordinates(i, 5);
          return <line key={i} x1={center} y1={center} x2={x} y2={y} stroke="rgba(255,255,255,0.08)" strokeWidth="1" />;
        })}

        {/* Axis Labels */}
        {CATEGORIES.map((cat, i) => {
          const { x, y } = getCoordinates(i, 5.8);
          return (
            <text key={i} x={x} y={y} fill="var(--muted)" fontSize="9" textAnchor="middle" dominantBaseline="middle">
              {cat.key.split(' ')[0]}
            </text>
          );
        })}

        {/* Data Polygon */}
        <polygon points={points} fill="rgba(6, 182, 212, 0.2)" stroke="var(--accent)" strokeWidth="2" strokeLinejoin="round" />
        
        {/* Data Points */}
        {CATEGORIES.map((cat, i) => {
          const val = data[cat.key] || 0;
          const { x, y } = getCoordinates(i, val);
          return <circle key={i} cx={x} cy={y} r="3" fill="var(--accent)" />;
        })}
      </svg>
    </div>
  );
}

export default function RatingsPage() {
  const [analytics, setAnalytics] = useState({});
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [anaRes, comRes] = await Promise.all([getRatingsAnalytics(), getRatingComments()]);
      setAnalytics(anaRes.data);
      setComments(comRes.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  const renderStars = (score) => {
    return '★'.repeat(Math.round(score)) + '☆'.repeat(5 - Math.round(score));
  };

  return (
    <div className="content">
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '1.6rem', marginBottom: '4px' }}>Ratings Analytics</h1>
        <p style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>Driver performance and student feedback</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '24px', alignItems: 'start' }}>
        
        {/* Left: Analytics breakdown */}
        <div style={{ 
          background: 'rgba(15, 23, 42, 0.4)', borderRadius: '16px', border: '1px solid var(--border)', padding: '24px' 
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
            <span style={{ fontSize: '0.9rem' }}>📊</span>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, fontFamily: 'Syne, sans-serif' }}>Rating Breakdown by Category</h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '40px' }}>
            {CATEGORIES.map(cat => {
              const val = analytics[cat.key] || 0;
              return (
                <div key={cat.key} style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ width: '120px', fontSize: '0.8rem', color: 'var(--muted)' }}>{cat.key}</div>
                  <div style={{ flex: 1, height: '6px', background: 'var(--surface2)', borderRadius: '10px', overflow: 'hidden' }}>
                    <div style={{ width: `${(val / 5) * 100}%`, height: '100%', background: cat.color, transition: 'width 0.8s ease' }} />
                  </div>
                  <div style={{ width: '30px', fontSize: '0.8rem', fontWeight: 700, textAlign: 'right' }}>{val.toFixed(1)}</div>
                </div>
              );
            })}
          </div>

          <RadarChart data={analytics} />
        </div>

        {/* Right: Comments Feed */}
        <div style={{ 
          background: 'rgba(15, 23, 42, 0.4)', borderRadius: '16px', border: '1px solid var(--border)', padding: '24px' 
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
            <span style={{ fontSize: '0.9rem' }}>💬</span>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, fontFamily: 'Syne, sans-serif' }}>Student Feedback</h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {comments.length === 0 && (
              <div style={{ textAlign: 'center', padding: '40px', color: 'var(--muted)', fontSize: '0.85rem' }}>No comments recorded yet.</div>
            )}
            {comments.map(c => (
              <div key={c.id} style={{
                background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '16px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <div style={{ color: '#f59e0b', fontSize: '0.9rem', letterSpacing: '1px' }}>{renderStars(c.score)}</div>
                  <div style={{ fontSize: '0.65rem', color: 'var(--muted)', textTransform: 'uppercase' }}>
                    {c.driver?.name} • {new Date(c.createdAt).toLocaleDateString()}
                  </div>
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text)', marginBottom: '10px', fontStyle: 'italic' }}>
                  "{c.comment}"
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderTop: '0.5px solid rgba(255,255,255,0.05)', paddingTop: '8px' }}>
                  <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.55rem', fontWeight: 900 }}>
                    {c.student?.name?.charAt(0) || 'S'}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--muted)' }}>
                    <span style={{ color: 'var(--text)', fontWeight: 600 }}>{c.student?.name || 'Anonymous'}</span>
                    {' • '}
                    {c.category}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
