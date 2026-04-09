
import React, { useState, useEffect } from 'react';
import { getRewardRules, updateRewardRules, getLeaderboard } from '../services/api';

const MEDALS = {
  1: '🥇',
  2: '🥈',
  3: '🥉'
};

export default function RewardsPage() {
  const [rules, setRules] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [rulesRes, boardRes] = await Promise.all([getRewardRules(), getLeaderboard()]);
      setRules(rulesRes.data);
      setLeaderboard(boardRes.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  const handleRuleChange = (id, newPoints) => {
    setRules(prev => prev.map(r => r.id === id ? { ...r, points: parseInt(newPoints) || 0 } : r));
  };

  async function handleSave() {
    setSaving(true);
    setMessage(null);
    try {
      await updateRewardRules(rules);
      setMessage({ type: 'success', text: '✅ Configuration saved successfully!' });
      setTimeout(() => setMessage(null), 3000);
    } catch (e) {
      setMessage({ type: 'error', text: '❌ Failed to save configuration.' });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="content">
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '1.6rem', marginBottom: '4px' }}>Rewards Configuration</h1>
        <p style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>Configure points and redemption rules</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '24px', alignItems: 'start' }}>
        
        {/* Left: Configuration */}
        <div style={{ 
          background: 'rgba(15, 23, 42, 0.4)', 
          borderRadius: '16px', border: '1px solid var(--border)', 
          padding: '24px' 
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
            <span style={{ fontSize: '0.9rem' }}>⭐</span>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, fontFamily: 'Syne, sans-serif' }}>Reward Rules Configuration</h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
            {rules.map(rule => (
              <div key={rule.id} style={{
                background: 'var(--surface2)', borderRadius: '12px', border: '1px solid var(--border)',
                padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between'
              }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text)', fontWeight: 500 }}>{rule.label}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input 
                    type="number" 
                    value={rule.points}
                    onChange={e => handleRuleChange(rule.id, e.target.value)}
                    style={{
                      background: 'none', border: 'none', borderBottom: '1px solid var(--border)',
                      color: 'var(--accent)', fontWeight: 800, width: '50px', textAlign: 'right',
                      fontSize: '0.9rem', outline: 'none'
                    }}
                  />
                  <span style={{ color: 'var(--accent)', fontWeight: 800, fontSize: '0.9rem' }}>pts</span>
                </div>
              </div>
            ))}
          </div>

          <button 
            className="btn btn-primary" 
            style={{ width: '100%', height: '48px', fontWeight: 700, letterSpacing: '0.5px' }}
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? '⏳ Saving...' : 'Save Configuration'}
          </button>
          
          {message && (
            <div style={{ 
              marginTop: '16px', textAlign: 'center', fontSize: '0.82rem', 
              color: message.type === 'success' ? 'var(--accent2)' : 'var(--accent3)' 
            }}>
              {message.text}
            </div>
          )}
        </div>

        {/* Right: Leaderboard */}
        <div style={{ 
          background: 'rgba(15, 23, 42, 0.4)', 
          borderRadius: '16px', border: '1px solid var(--border)', 
          padding: '24px' 
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
            <span style={{ fontSize: '0.9rem' }}>📊</span>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, fontFamily: 'Syne, sans-serif' }}>Top Students by Points</h3>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--muted)' }}>⏳ Calculating rankings...</div>
          ) : (
            <table style={{ background: 'none', border: 'none' }}>
              <thead style={{ borderBottom: '1px solid var(--border)' }}>
                <tr>
                  <th style={{ fontSize: '0.65rem', textTransform: 'uppercase', color: 'var(--muted)', padding: '12px 8px' }}>Rank</th>
                  <th style={{ fontSize: '0.65rem', textTransform: 'uppercase', color: 'var(--muted)', padding: '12px 8px' }}>Student</th>
                  <th style={{ fontSize: '0.65rem', textTransform: 'uppercase', color: 'var(--muted)', padding: '12px 8px' }}>Points</th>
                  <th style={{ fontSize: '0.65rem', textTransform: 'uppercase', color: 'var(--muted)', padding: '12px 8px' }}>Free Rides</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.length === 0 && (
                  <tr>
                    <td colSpan={4} style={{ textAlign: 'center', color: 'var(--muted)', padding: '30px' }}>No stats available yet.</td>
                  </tr>
                )}
                {leaderboard.map((student, idx) => (
                  <tr key={student.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                    <td style={{ padding: '16px 8px', fontSize: '0.82rem' }}>
                      {MEDALS[idx + 1] || idx + 1}
                    </td>
                    <td style={{ padding: '16px 8px', fontSize: '0.82rem', fontWeight: 600 }}>
                      {student.name}
                    </td>
                    <td style={{ padding: '16px 8px', fontSize: '0.82rem', color: 'var(--accent2)', fontWeight: 700 }}>
                      {student.points?.total || 0} pts
                    </td>
                    <td style={{ padding: '16px 8px', fontSize: '0.82rem', fontWeight: 800 }}>
                      {student.points?.freeRides || 0}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

      </div>
    </div>
  );
}
