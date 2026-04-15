import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

function makeBusIcon(isEmergency, isTracked, isVisible) {
  if (!isVisible) {
    return L.divIcon({ className: '', html: '<div style="display:none;"></div>', iconSize: [0,0] });
  }

  const color = isEmergency ? '#ef4444' : '#10b981';
  let animation = isEmergency ? 'pulse-alert' : 'pulse-bus';
  if (isTracked) animation = 'pulse-tracked';
  
  const size = isTracked ? 20 : 14;
  const offset = size / 2;
  const border = isTracked ? '3px solid #fff' : '2px solid #fff';
  
  return L.divIcon({
    className: '',
    html: `<div style="
      width:${size}px;height:${size}px;border-radius:50%;
      background:${color};border:${border};
      box-shadow:0 0 10px ${color};
      animation:${animation} 2s infinite;
      transition:all 0.4s ease;
    "></div>`,
    iconSize: [size, size],
    iconAnchor: [offset, offset],
  });
}

export default function LiveMap({ buses = [], height = '430px', trackedBusId = null, activeRoute = null }) {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markersRef = useRef({});
  const polylineRef = useRef(null);

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
    
    // Polyline drawing & zoom logic
    if (polylineRef.current) {
      polylineRef.current.remove();
      polylineRef.current = null;
    }

    if (activeRoute) {
      // Mock solid route path
      const routePathCoords = [
        [31.9539, 35.9106],
        [31.9560, 35.9220],
        [31.9680, 35.9150],
        [31.9800, 35.9400]
      ];
      polylineRef.current = L.polyline(routePathCoords, { color: '#3b82f6', weight: 5, opacity: 0.8 }).addTo(mapInstance.current);
      mapInstance.current.fitBounds(polylineRef.current.getBounds(), { padding: [50, 50], maxZoom: 15 });
    } else if (trackedBusId) {
      // Find tracked bus for dotted path
      const bus = buses.find(b => b.busId === trackedBusId || b.plateNumber === trackedBusId);
      if (bus && bus.lat) {
        const historyPath = [
          [bus.lat - 0.008, bus.lng - 0.008],
          [bus.lat - 0.003, bus.lng - 0.001],
          [bus.lat, bus.lng]
        ];
        polylineRef.current = L.polyline(historyPath, { color: '#10b981', weight: 4, dashArray: '10, 10', opacity: 0.8 }).addTo(mapInstance.current);
        mapInstance.current.setView([bus.lat, bus.lng], 16, { animate: true, duration: 1.5 });
      }
    } else {
      mapInstance.current.setView([31.9539, 35.9106], 12, { animate: true });
    }

    buses.forEach((bus) => {
      // Visibility Filtering
      let isVisible = true;
      if (activeRoute) {
        // Mock matching logic if real routeId is missing
        const rId = bus.routeId || (String(bus.busId).includes('1') ? 'Route 10A' : 'University Express');
        if (rId !== activeRoute) isVisible = false;
      }
      if (trackedBusId) {
        if (bus.busId !== trackedBusId && bus.plateNumber !== trackedBusId) isVisible = false;
      }

      const isEmergency = bus.status === 'fault' || bus.status === 'emergency';
      const isTracked = trackedBusId && (bus.busId === trackedBusId || bus.plateNumber === trackedBusId);
      const icon = makeBusIcon(isEmergency, isTracked, isVisible);
      const label = bus.plateNumber || bus.busId || 'Bus';
      
      if (markersRef.current[bus.busId]) {
        markersRef.current[bus.busId].setLatLng([bus.lat, bus.lng]);
        markersRef.current[bus.busId].setIcon(icon);
      } else if (isVisible) {
        const marker = L.marker([bus.lat, bus.lng], { icon })
          .bindTooltip(`🚌 ${label}${bus.driverName ? ` · ${bus.driverName}` : ''}`, {
            permanent: false, direction: 'top', offset: [0, -10],
          })
          .addTo(mapInstance.current);
        markersRef.current[bus.busId] = marker;
      }
    });
  }, [buses, trackedBusId, activeRoute]);

  return (
    <div style={{ position: 'relative' }}>
      <style>{`
        .leaflet-tile-pane {
          filter: ${trackedBusId ? 'brightness(0.3) grayscale(0.5)' : 'brightness(1) grayscale(0)'};
          transition: filter 0.8s ease;
        }
        @keyframes pulse-bus {
          0%, 100% { box-shadow: 0 0 6px #10b981; }
          50% { box-shadow: 0 0 16px #10b981, 0 0 30px #10b981; }
        }
        @keyframes pulse-alert {
          0%, 100% { box-shadow: 0 0 8px #ef4444; }
          50% { box-shadow: 0 0 20px #ef4444, 0 0 40px #ef4444; }
        }
        @keyframes pulse-tracked {
          0%, 100% { box-shadow: 0 0 0px 4px rgba(59,130,246,0.6), 0 0 12px #3b82f6; transform: scale(1); }
          50% { box-shadow: 0 0 0px 8px rgba(59,130,246,0.3), 0 0 24px #3b82f6; transform: scale(1.1); }
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
