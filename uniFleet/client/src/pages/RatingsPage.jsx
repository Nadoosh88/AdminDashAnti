
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, 
  ResponsiveContainer, Tooltip
} from 'recharts';
import { getRatingsAnalytics, getRatingComments } from '../services/api';

// --- CONSTANTS & MOCK DATA ---
const CATEGORIES = [
  { key: 'Driving Quality', color: '#10b981' },
  { key: 'Conduct',         color: '#3b82f6' },
  { key: 'Speed & Safety',  color: '#f59e0b' },
  { key: 'Punctuality',     color: '#8b5cf6' },
  { key: 'Helpfulness',     color: '#06b6d4' }
];

const MOCK_DRIVERS = [
  {
    id: 'khalid',
    name: 'Khalid Amin',
    busNumber: 'B-204',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Khalid',
    stats: {
      'Driving Quality': 4.8,
      'Conduct': 4.5,
      'Speed & Safety': 4.2,
      'Punctuality': 0.0, // Scenario: low punctuality
      'Helpfulness': 4.9
    },
    comments: [
      { id: 1, student: 'Sami J.', score: 5, comment: 'Driver was very helpful with my bags!', time: '2h ago', trip: 'Trip #104' },
      { id: 2, student: 'Laila R.', score: 4, comment: 'Smooth driving, but arrived very late.', time: '5h ago', trip: 'Trip #102' },
      { id: 3, student: 'Ahmed T.', score: 5, comment: 'Professional conduct during the trip.', time: '1d ago', trip: 'Trip #098' }
    ]
  },
  {
    id: 'fleet',
    name: 'Full Fleet Average',
    busNumber: 'N/A',
    avatar: null,
    stats: {
      'Driving Quality': 4.2,
      'Conduct': 4.1,
      'Speed & Safety': 3.9,
      'Punctuality': 4.4,
      'Helpfulness': 3.8
    },
    comments: [
      { id: 101, student: 'Lina M.', score: 5, comment: 'Fleet is improving! Most drivers are very safe.', time: '1h ago', trip: 'Trip #205', tripDetails: { busId: 'B-205', driver: 'Ahmed Ali', date: '2026-04-20', time: '08:30 AM', from: 'Main Gate', to: 'IT Department' } },
      { id: 102, student: 'Zaid K.', score: 4, comment: 'Punctuality is better this week.', time: '4h ago', trip: 'Trip #198', tripDetails: { busId: 'B-198', driver: 'Yusuf S.', date: '2026-04-20', time: '10:15 AM', from: 'Engineering', to: 'Main Gate' } }
    ]
  },
  {
    id: 'sami',
    name: 'Sami Mohammed',
    busNumber: 'B-112',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sami',
    stats: {
      'Driving Quality': 4.7,
      'Conduct': 4.8,
      'Speed & Safety': 4.5,
      'Punctuality': 4.6,
      'Helpfulness': 4.2
    },
    comments: [
      { id: 4, student: 'Omar F.', score: 5, comment: 'Excellent driver, very punctual.', time: '1h ago', trip: 'Trip #115', tripDetails: { busId: 'B-112', driver: 'Sami Mohammed', date: '2026-04-20', time: '09:00 AM', from: 'Main Gate', to: 'JUST Campus' } }
    ]
  }
];

export default function RatingsPage() {
  const [activeDriver, setActiveDriver] = useState(MOCK_DRIVERS[1]); 
  const [searchQuery, setSearchQuery] = useState('');
  const [isExportModalOpen, setExportModalOpen] = useState(false);
  const [exportStage, setExportStage] = useState('idle'); 
  const [exportConfig, setExportConfig] = useState({ scope: 'driver', format: 'pdf' });
  const [period, setPeriod] = useState('overall');
  const [toastMessage, setToastMessage] = useState(null);
  const [selectedTrip, setSelectedTrip] = useState(null);

  const chartData = useMemo(() => {
    return CATEGORIES.map(cat => ({
      subject: cat.key,
      A: activeDriver.stats[cat.key],
      fullMark: 5
    }));
  }, [activeDriver]);

  const handleSearchKeyPress = (e) => {
    if (e.key === 'Enter') {
      const q = searchQuery.toLowerCase();
      const found = MOCK_DRIVERS.find(d => d.name.toLowerCase().includes(q));
      if (found) {
        setActiveDriver(found);
      } else if (q === '') {
        setActiveDriver(MOCK_DRIVERS[1]);
      }
    }
  };

  const getProgressColor = (val) => {
    if (val >= 4.5) return '#10b981';
    if (val >= 3.0) return '#f59e0b';
    return '#ef4444';
  };

  const triggerExport = () => {
    setExportStage('generating');
    
    // Simulate generation time
    setTimeout(() => {
      // Create Report Content
      let content = `JUST BUS FLEET PERFORMANCE REPORT\n`;
      content += `Date: ${new Date().toLocaleDateString()}\n`;
      content += `Scope: ${exportConfig.scope === 'driver' ? activeDriver.name : 'Entire Fleet'}\n`;
      content += `Format: ${exportConfig.format.toUpperCase()}\n`;
      content += `-------------------------------------------\n`;
      
      if (exportConfig.scope === 'driver') {
        content += `Driver: ${activeDriver.name}\n`;
        content += `Bus Number: ${activeDriver.busNumber}\n`;
        Object.entries(activeDriver.stats).forEach(([cat, score]) => {
          content += `${cat}: ${score}/5.0\n`;
        });
      } else {
        MOCK_DRIVERS.forEach(d => {
          content += `\nDriver: ${d.name}\n`;
          Object.entries(d.stats).forEach(([cat, score]) => {
            content += `- ${cat}: ${score}/5.0\n`;
          });
        });
      }

      // Trigger Download
      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Performance_Report_${exportConfig.scope}_${new Date().getTime()}.${exportConfig.format === 'pdf' ? 'txt' : 'csv'}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setExportStage('success');
      setToastMessage('Report downloaded successfully');
      
      setTimeout(() => {
        setExportModalOpen(false);
        setExportStage('idle');
        setToastMessage(null);
      }, 2000);
    }, 1500);
  };

  const dynamicInsights = useMemo(() => {
    const scores = Object.entries(activeDriver.stats);
    scores.sort((a, b) => a[1] - b[1]);
    const lowest = scores[0];

    let advice = "Consistent performance";
    if (lowest[1] < 4.0) {
      switch (lowest[0]) {
        case 'Punctuality': advice = "Schedule training recommended for this driver"; break;
        case 'Speed & Safety': advice = "Speed safety briefing required"; break;
        case 'Helpfulness': advice = "Service quality workshop suggested"; break;
        case 'Conduct': advice = "Professional conduct review suggested"; break;
        case 'Driving Quality': advice = "Technical driving assessment recommended"; break;
        default: advice = "Performance review suggested";
      }
    }
    return { category: lowest[0], advice };
  }, [activeDriver]);

  return (
    <div className="content">
      {toastMessage && (
        <div style={{
          position: 'fixed', top: '24px', right: '24px', background: 'var(--accent4)', color: '#0b0f1a',
          padding: '12px 24px', borderRadius: '12px', fontWeight: 700, zIndex: 1000,
          boxShadow: '0 8px 30px rgba(16, 185, 129, 0.3)', animation: 'slideInRight 0.3s'
        }}>
          ✅ {toastMessage}
        </div>
      )}

      {isExportModalOpen && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 500
        }}>
          <div style={{
            background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '24px',
            padding: '32px', width: '400px', boxShadow: '0 20px 50px rgba(0,0,0,0.5)'
          }}>
            <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, marginBottom: '20px' }}>Export Analytics Report</h3>
            
            <div style={{ marginBottom: '24px' }}>
              <p style={{ fontSize: '0.8rem', color: 'var(--muted)', marginBottom: '12px' }}>SELECT SCOPE</p>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button 
                  onClick={() => setExportConfig(prev => ({ ...prev, scope: 'driver' }))}
                  style={{ 
                    flex: 1, padding: '10px', borderRadius: '12px', cursor: 'pointer',
                    border: exportConfig.scope === 'driver' ? '1px solid var(--accent)' : '1px solid var(--border)', 
                    background: exportConfig.scope === 'driver' ? 'rgba(59,130,246,0.1)' : 'var(--surface2)', 
                    color: exportConfig.scope === 'driver' ? 'var(--accent)' : 'var(--muted)', 
                    fontSize: '0.8rem', fontWeight: 600, transition: '0.2s'
                  }}
                >
                  Current Driver
                </button>
                <button 
                  onClick={() => setExportConfig(prev => ({ ...prev, scope: 'fleet' }))}
                  style={{ 
                    flex: 1, padding: '10px', borderRadius: '12px', cursor: 'pointer',
                    border: exportConfig.scope === 'fleet' ? '1px solid var(--accent)' : '1px solid var(--border)', 
                    background: exportConfig.scope === 'fleet' ? 'rgba(59,130,246,0.1)' : 'var(--surface2)', 
                    color: exportConfig.scope === 'fleet' ? 'var(--accent)' : 'var(--muted)', 
                    fontSize: '0.8rem', fontWeight: 600, transition: '0.2s'
                  }}
                >
                  Entire Fleet
                </button>
              </div>
            </div>

            <div style={{ marginBottom: '32px' }}>
              <p style={{ fontSize: '0.8rem', color: 'var(--muted)', marginBottom: '12px' }}>FORMAT</p>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button 
                  onClick={() => setExportConfig(prev => ({ ...prev, format: 'pdf' }))}
                  style={{ 
                    flex: 1, padding: '10px', borderRadius: '12px', cursor: 'pointer',
                    border: exportConfig.format === 'pdf' ? '1px solid var(--accent)' : '1px solid var(--border)', 
                    background: exportConfig.format === 'pdf' ? 'rgba(59,130,246,0.1)' : 'var(--surface2)', 
                    color: exportConfig.format === 'pdf' ? 'var(--accent)' : 'var(--text)', 
                    fontSize: '0.8rem', fontWeight: 600, transition: '0.2s'
                  }}
                >
                  📄 PDF Format
                </button>
                <button 
                   onClick={() => setExportConfig(prev => ({ ...prev, format: 'excel' }))}
                   style={{ 
                    flex: 1, padding: '10px', borderRadius: '12px', cursor: 'pointer',
                    border: exportConfig.format === 'excel' ? '1px solid var(--accent)' : '1px solid var(--border)', 
                    background: exportConfig.format === 'excel' ? 'rgba(59,130,246,0.1)' : 'var(--surface2)', 
                    color: exportConfig.format === 'excel' ? 'var(--accent)' : 'var(--text)', 
                    fontSize: '0.8rem', fontWeight: 600, transition: '0.2s'
                  }}
                >
                  📊 Excel Sheet
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={() => setExportModalOpen(false)} style={{ flex: 1, padding: '12px', borderRadius: '12px', background: 'transparent', border: '1px solid var(--border)', color: 'var(--muted)', cursor: 'pointer' }}>Cancel</button>
              <button 
                onClick={triggerExport}
                disabled={exportStage === 'generating'}
                style={{ 
                  flex: 1, padding: '12px', borderRadius: '12px', background: 'var(--accent)', border: 'none', color: '#fff', 
                  fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
                }}
              >
                {exportStage === 'generating' ? (
                  <>
                    <span className="spinner" style={{ width: '14px', height: '14px', border: '2px solid #fff', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }}></span>
                    Generating...
                  </>
                ) : 'Confirm & Export'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- HEADER --- */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '1.8rem', marginBottom: '4px', background: 'linear-gradient(to right, #3b82f6, #818cf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Rating Analytics
          </h1>
          <p style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>Visualizing driver performance and student feedback for JUST Bus.</p>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)', fontSize: '0.9rem' }}>🔍</span>
            <input 
              type="text" 
              placeholder="Search driver (e.g. Khalid)..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleSearchKeyPress}
              style={{
                background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: '12px',
                padding: '10px 16px 10px 40px', fontSize: '0.85rem', color: 'var(--text)', width: '240px', outline: 'none', transition: 'all 0.3s'
              }}
            />
          </div>
          
          <button 
            onClick={() => setExportModalOpen(true)}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--accent)', color: '#fff', 
              borderRadius: '12px', padding: '0 20px', fontSize: '0.85rem', fontWeight: 700, border: 'none', cursor: 'pointer'
            }}
          >
            <span>📄</span> Export Analytics Report
          </button>
        </div>
      </div>

      <div style={{ marginBottom: '20px', fontSize: '0.9rem', opacity: activeDriver.id !== 'fleet' ? 1 : 0, transition: 'opacity 0.3s' }}>
        Displaying individual metrics for <strong style={{ color: 'var(--accent)' }}>{activeDriver.name}</strong>
      </div>

      {/* --- MAIN GRID --- */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '24px' }}>
        
        <div style={{ display: 'grid', gridTemplateRows: 'auto 1fr', gap: '24px' }}>
          
          {/* Radar Chart Card */}
          <div style={{ 
            background: 'rgba(23, 26, 31, 0.6)', borderRadius: '24px', border: '1px solid var(--border)', 
            padding: '32px', position: 'relative', overflow: 'hidden', backdropFilter: 'blur(10px)',
            boxShadow: '0 4px 20px rgba(0,0,0,0.15)', transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)'
          }}>
            {activeDriver.id !== 'fleet' && (
              <div style={{
                position: 'absolute', top: '24px', right: '24px', background: 'var(--surface2)', 
                border: '1px solid var(--border)', borderRadius: '16px', padding: '12px', 
                display: 'flex', alignItems: 'center', gap: '12px', animation: 'fadeIn 0.5s'
              }}>
                <img src={activeDriver.avatar} alt={activeDriver.name} style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--surface)' }} />
                <div>
                  <p style={{ fontSize: '0.85rem', fontWeight: 800 }}>{activeDriver.name}</p>
                  <p style={{ fontSize: '0.7rem', color: 'var(--accent)' }}>Bus: {activeDriver.busNumber}</p>
                </div>
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', marginBottom: '10px' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, fontFamily: 'Syne, sans-serif', color: 'var(--text)' }}>
                {activeDriver.name} Performance Overview
              </h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>Based on {period.replace('last', 'last ')} data</p>
            </div>

            <div style={{ height: '320px', width: '100%', position: 'relative' }}>
               <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
                  <PolarGrid stroke="rgba(255,255,255,0.08)" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--muted)', fontSize: 10, fontWeight: 500 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 5]} tick={false} axisLine={false} />
                  <Radar
                    name={activeDriver.name}
                    dataKey="A"
                    stroke="var(--accent)"
                    strokeWidth={2}
                    fill="var(--accent)"
                    fillOpacity={0.3}
                  />
                  <Tooltip 
                    contentStyle={{ background: 'var(--surface2)', border: 'none', borderRadius: '8px', color: 'var(--text)' }}
                    itemStyle={{ color: 'var(--accent)' }}
                  />
                </RadarChart>
              </ResponsiveContainer>
              <div style={{ 
                position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                width: '180px', height: '180px', background: 'radial-gradient(circle, rgba(59, 130, 246, 0.1) 0%, transparent 70%)',
                pointerEvents: 'none', zIndex: -1
              }} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
            {CATEGORIES.map(cat => {
              const val = activeDriver.stats[cat.key];
              return (
                <div key={cat.key} style={{ background: 'var(--surface)', borderRadius: '16px', border: '1px solid var(--border)', padding: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--muted)', fontWeight: 500 }}>{cat.key}</span>
                    <span style={{ fontSize: '0.85rem', fontWeight: 800, color: getProgressColor(val) }}>{val.toFixed(1)}</span>
                  </div>
                  <div style={{ height: '6px', background: 'var(--surface2)', borderRadius: '10px', overflow: 'hidden' }}>
                    <div style={{ width: `${(val / 5) * 100}%`, height: '100%', background: getProgressColor(val), transition: 'width 1s cubic-bezier(0.4, 0, 0.2, 1)' }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          <div style={{ background: 'var(--surface)', borderRadius: '24px', border: '1px solid var(--border)', padding: '28px', flex: 1, display: 'flex', flexDirection: 'column' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, fontFamily: 'Syne, sans-serif', marginBottom: '24px' }}>Latest Student Testimonials</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', flex: 1 }}>
              {activeDriver.comments.length === 0 ? (
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '12px', color: 'var(--muted)', padding: '40px 0' }}>
                  <span style={{ fontSize: '2rem', opacity: 0.2 }}>⚠️</span>
                  <p style={{ fontSize: '0.85rem', textAlign: 'center' }}>No recent feedback received.<br/>Driver performance is stable.</p>
                </div>
              ) : (
                activeDriver.comments.map(c => (
                  <div key={c.id} style={{ background: 'var(--surface2)', borderRadius: '16px', padding: '16px', border: '1px solid rgba(255,255,255,0.03)', animation: 'slideInUp 0.4s' }}>
                    <p style={{ fontSize: '0.82rem', color: 'var(--text)', marginBottom: '12px', fontStyle: 'italic', lineHeight: '1.4' }}>"{c.comment}"</p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: 'var(--accent2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.6rem', fontWeight: 900, color: '#fff' }}>{c.student.charAt(0)}</div>
                        <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>{c.student}</span>
                      </div>
                      <button 
                        onClick={() => setSelectedTrip({ ...c.tripDetails, student: c.student })}
                        style={{ background: 'rgba(59, 130, 246, 0.1)', border: 'none', borderRadius: '6px', padding: '4px 8px', color: 'var(--accent)', fontSize: '0.7rem', fontWeight: 600, cursor: 'pointer' }}
                      >
                        View Trip →
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}>
            <div style={{ background: 'var(--surface)', borderRadius: '24px', border: '1px solid var(--border)', padding: '24px' }}>
              <h4 style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '16px', color: 'var(--accent4)', display: 'flex', alignItems: 'center', gap: '8px' }}>🏆 Top Rated Drivers</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {MOCK_DRIVERS.filter(d => d.id !== 'fleet').sort((a,b) => b.stats['Driving Quality'] - a.stats['Driving Quality']).slice(0, 3).map((d, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>{d.name}</span>
                    <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--accent4)' }}>
                      {(Object.values(d.stats).reduce((a,b)=>a+b,0)/5).toFixed(1)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ background: 'var(--surface)', borderRadius: '24px', border: '1px solid var(--border)', padding: '24px' }}>
              <h4 style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '16px', color: 'var(--accent3)', display: 'flex', alignItems: 'center', gap: '8px' }}>⚠️ Areas for Improvement</h4>
              <div style={{ fontSize: '0.8rem', color: 'var(--muted)', background: 'var(--surface2)', padding: '12px', borderRadius: '12px', border: '1px solid rgba(239, 68, 68, 0.1)' }}>
                <strong style={{ color: 'var(--accent3)', display: 'block', marginBottom: '4px' }}>{dynamicInsights.category} Alert</strong>
                {dynamicInsights.advice}
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Trip Details Modal */}
      {selectedTrip && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(5px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div style={{
            background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '24px',
            padding: '28px', width: '380px', boxShadow: '0 20px 50px rgba(0,0,0,0.5)', animation: 'fadeIn 0.3s'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontFamily: 'Syne, sans-serif', fontSize: '1.1rem', fontWeight: 800 }}>Trip Details</h3>
              <button 
                onClick={() => setSelectedTrip(null)}
                style={{ background: 'var(--surface2)', border: 'none', borderRadius: '50%', width: '28px', height: '28px', color: 'var(--text)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >✕</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
                <span style={{ color: 'var(--muted)', fontSize: '0.8rem' }}>BUS ID</span>
                <span style={{ fontWeight: 700, color: 'var(--accent)' }}>{selectedTrip.busId}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
                <span style={{ color: 'var(--muted)', fontSize: '0.8rem' }}>Driver Name</span>
                <span style={{ fontWeight: 600 }}>{selectedTrip.driver}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
                <span style={{ color: 'var(--muted)', fontSize: '0.8rem' }}>Date & Time</span>
                <span style={{ fontSize: '0.85rem' }}>{selectedTrip.date} | {selectedTrip.time}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', background: 'var(--surface2)', padding: '12px', borderRadius: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent4)' }}></div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>From:</span>
                  <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>{selectedTrip.from}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent)' }}></div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>To:</span>
                  <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>{selectedTrip.to}</span>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '10px' }}>
                <div style={{ width: '4px', height: '24px', background: 'var(--accent)', borderRadius: '2px' }}></div>
                <p style={{ fontSize: '0.72rem', color: 'var(--muted)' }}>Student Participant:<br/><strong style={{ color: 'var(--text)' }}>{selectedTrip.student}</strong></p>
              </div>
            </div>

            <button 
              onClick={() => setSelectedTrip(null)}
              style={{ 
                width: '100%', marginTop: '24px', padding: '12px', borderRadius: '12px', 
                background: 'var(--accent)', border: 'none', color: '#fff', fontWeight: 700, 
                cursor: 'pointer' 
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideInRight { from { opacity: 0; transform: translateX(50px); } to { opacity: 1; transform: translateX(0); } }
      `}} />
    </div>
  );
}
