import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

function makeBusIcon(isEmergency) {
  const color = isEmergency ? '#ef4444' : '#10b981';
  const animation = isEmergency ? 'pulse-alert' : 'pulse-bus';
  return L.divIcon({
    className: '',
    html: `<div style="
      width:14px;height:14px;border-radius:50%;
      background:${color};border:2px solid #fff;
      box-shadow:0 0 10px ${color};
      animation:${animation} 2s infinite;
    "></div>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
  });
}

export default function LiveMap({ buses = [], height = '430px' }) {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markersRef = useRef({});

  useEffect(() => {
    if (mapInstance.current) return;
    mapInstance.current = L.map(mapRef.current, {
      center: [31.9539, 35.9106],
      zoom: 12,
      zoomControl: true,
    });
    L.tileLayer('http://{s}.google.com/vt?lyrs=m&x={x}&y={y}&z={z}', {
      maxZoom: 20,
      subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
      attribution: 'Map data ©2026 Google'
    }).addTo(mapInstance.current);
  }, []);

  useEffect(() => {
    if (!mapInstance.current) return;
    buses.forEach((bus) => {
      const isEmergency = bus.status === 'fault' || bus.status === 'emergency';
      const icon = makeBusIcon(isEmergency);
      const label = bus.plateNumber || bus.busId || 'Bus';
      if (markersRef.current[bus.busId]) {
        markersRef.current[bus.busId].setLatLng([bus.lat, bus.lng]);
        markersRef.current[bus.busId].setIcon(icon);
      } else {
        const marker = L.marker([bus.lat, bus.lng], { icon })
          .bindTooltip(`🚌 ${label}${bus.driverName ? ` · ${bus.driverName}` : ''}`, {
            permanent: false, direction: 'top', offset: [0, -10],
          })
          .addTo(mapInstance.current);
        markersRef.current[bus.busId] = marker;
      }
    });
  }, [buses]);

  return (
    <div style={{ position: 'relative' }}>
      <style>{`
        @keyframes pulse-bus {
          0%, 100% { box-shadow: 0 0 6px #10b981; }
          50% { box-shadow: 0 0 16px #10b981, 0 0 30px #10b981; }
        }
        @keyframes pulse-alert {
          0%, 100% { box-shadow: 0 0 8px #ef4444; }
          50% { box-shadow: 0 0 20px #ef4444, 0 0 40px #ef4444; }
        }
        .leaflet-container { background: #1a1f2e !important; }
      `}</style>
      <div ref={mapRef} style={{ height, borderRadius: '10px', zIndex: 0 }} />
      {/* Legend */}
      <div style={{
        position: 'absolute', bottom: '16px', left: '10px', zIndex: 999,
        background: 'rgba(23,26,31,.9)', border: '1px solid var(--border)',
        borderRadius: '8px', padding: '8px 12px', fontSize: '0.7rem',
        backdropFilter: 'blur(6px)', pointerEvents: 'none',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }} />
          Active Bus
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ef4444' }} />
          Emergency
        </div>
      </div>
    </div>
  );
}
