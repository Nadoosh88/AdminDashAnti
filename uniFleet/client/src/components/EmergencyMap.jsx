
import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const SECURITY_POINT = [32.4960, 35.9890];
const HOSPITAL_POINT = [32.4920, 35.9950];

const IDLE_BUSES = [
  { id: 'B-04', pos: [32.4980, 35.9950], dist: '0.8km', eta: '3m' },
  { id: 'B-09', pos: [32.4900, 35.9850], dist: '1.2km', eta: '5m' }
];

export default function EmergencyMap({ incidents = [], height = '300px', mode = 'normal' }) {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markersRef = useRef([]);
  const ripplesRef = useRef([]);
  const routesRef = useRef([]);
  const backupRefs = useRef([]);

  useEffect(() => {
    if (mapInstance.current) return;

    mapInstance.current = L.map(mapRef.current, {
      center: [32.4948, 35.9912],
      zoom: 14,
      zoomControl: false,
      attributionControl: false
    });

    L.tileLayer('http://{s}.google.com/vt?lyrs=y&x={x}&y={y}&z={z}', {
      maxZoom: 20,
      subdomains: ['mt0', 'mt1', 'mt2', 'mt3']
    }).addTo(mapInstance.current);
  }, []);

  useEffect(() => {
    if (!mapInstance.current) return;

    // Cleanup previous
    markersRef.current.forEach(m => m.remove());
    ripplesRef.current.forEach(m => m.remove());
    routesRef.current.forEach(r => r.remove());
    backupRefs.current.forEach(m => m.remove());
    markersRef.current = [];
    ripplesRef.current = [];
    routesRef.current = [];
    backupRefs.current = [];

    if (incidents.length === 0) {
      mapInstance.current.setView([32.4948, 35.9912], 14, { animate: true });
      return;
    }

    const bounds = L.latLngBounds(incidents.map(i => [i.lat, i.lng]));

    incidents.forEach(incident => {
      const { lat, lng, severity, vehicleId } = incident;
      const pos = [lat, lng];

      // Red Ripple Effect
      const rippleIcon = L.divIcon({
        className: 'ripple-container',
        html: '<div class="ripple"></div><div class="ripple ripple-2"></div>',
        iconSize: [60, 60],
        iconAnchor: [30, 30]
      });
      const ripple = L.marker(pos, { icon: rippleIcon }).addTo(mapInstance.current);
      ripplesRef.current.push(ripple);

      // Main Marker
      const mainIcon = L.divIcon({
        className: 'emergency-marker',
        html: `
          <div style="
            width: 24px; height: 24px; background: ${severity === 'Critical' ? '#ef4444' : '#f59e0b'}; 
            border: 3px solid white; border-radius: 50%; box-shadow: 0 0 15px rgba(239, 68, 68, 0.8);
            display: flex; align-items: center; justify-content: center; color: white; font-size: 14px;
          ">🚨</div>
        `,
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      });
      const marker = L.marker(pos, { icon: mainIcon }).addTo(mapInstance.current);
      markersRef.current.push(marker);

      // Dotted Route to nearest help
      const target = severity === 'Critical' ? SECURITY_POINT : HOSPITAL_POINT;
      const route = L.polyline([pos, target], {
        color: severity === 'Critical' ? '#ef4444' : '#f59e0b',
        weight: 3, dashArray: '8, 8', opacity: 0.8
      }).addTo(mapInstance.current);
      routesRef.current.push(route);
    });

    // Handle View (Single vs Multi)
    if (incidents.length === 1) {
      mapInstance.current.setView([incidents[0].lat, incidents[0].lng], 16, { animate: true });
    } else {
      mapInstance.current.fitBounds(bounds, { padding: [50, 50], animate: true });
    }

    // Backup Buses (only show in emergency view)
    if (mode === 'emergency') {
        IDLE_BUSES.forEach(bus => {
            const backupIcon = L.divIcon({
              className: 'backup-marker',
              html: `<div style="width:12px; height:12px; background:#3b82f6; border:2px solid #fff; border-radius:50%;"></div>`,
              iconSize: [12, 12]
            });
            const m = L.marker(bus.pos, { icon: backupIcon })
              .bindTooltip(`Bus ${bus.id} - ${bus.eta}`, { permanent: true, direction: 'bottom', className: 'map-tooltip' })
              .addTo(mapInstance.current);
            backupRefs.current.push(m);
        });
    }

  }, [incidents, mode]);

  return (
    <div style={{ position: 'relative', overflow: 'hidden', borderRadius: '16px', border: '1px solid var(--border)' }}>
      <style>{`
        .ripple-container { display: flex; align-items: center; justify-content: center; }
        .ripple { position: absolute; width: 20px; height: 20px; border: 2px solid #ef4444; border-radius: 50%; animation: ripple-pulse 2s infinite ease-out; opacity: 0; }
        .ripple-2 { animation-delay: 1s; }
        @keyframes ripple-pulse { 0% { transform: scale(1); opacity: 0.8; } 100% { transform: scale(4); opacity: 0; } }
        .emergency-marker { z-index: 1000 !important; animation: marker-pulse 1s infinite alternate; }
        @keyframes marker-pulse { from { transform: scale(1); } to { transform: scale(1.15); } }
        .map-tooltip { background: rgba(23,26,31,0.9) !important; border: 1px solid var(--border) !important; color: #fff !important; font-size: 0.7rem !important; }
      `}</style>
      <div ref={mapRef} style={{ height }} />
      
      <div style={{
        position: 'absolute', top: '12px', left: '12px', zIndex: 500,
        background: 'rgba(11, 15, 26, 0.8)', backdropFilter: 'blur(8px)',
        padding: '8px 16px', borderRadius: '12px', border: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', gap: '8px'
      }}>
        <div style={{ width: '8px', height: '8px', background: incidents.length > 0 ? '#ef4444' : '#10b981', borderRadius: '50%', animation: incidents.length > 0 ? 'blink 1s infinite' : 'none' }}></div>
        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#fff' }}>
          {mode === 'emergency' ? 'ENHANCED EMERGENCY VIEW' : 'INCIDENT MONITORING ACTIVE'}
        </span>
      </div>
    </div>
  );
}
