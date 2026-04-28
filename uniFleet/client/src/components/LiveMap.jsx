import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

function makeBusIcon(isEmergency, isTracked, isVisible, routeColor = '#10b981') {
  if (!isVisible) {
    return L.divIcon({ className: '', html: '<div style="display:none;"></div>', iconSize: [0,0] });
  }

  const bgColor = isEmergency ? '#ef4444' : routeColor;
  const size = isTracked ? 20 : 16;
  const offset = size / 2;
  const border = '2px solid #000'; // black border matching the image
  
  const glow = isTracked ? `box-shadow: 0 0 0 3px rgba(255,255,255,0.8);` : '';

  return L.divIcon({
    className: '',
    html: `<div style="
      width:${size}px;height:${size}px;border-radius:50%;
      background:${bgColor};border:${border};${glow}
      transition:all 0.4s ease;
    "></div>`,
    iconSize: [size, size],
    iconAnchor: [offset, offset],
  });
}

const ROUTE_PATHS = {
  'Route 10A': [
    [31.9539, 35.9106],
    [31.9600, 35.9150],
    [31.9680, 35.9150],
    [31.9800, 35.9400]
  ],
  'Route 15': [
    [31.9539, 35.9106],
    [31.9400, 35.9200],
    [31.9300, 35.9500],
    [31.9100, 35.9800]
  ],
  'University Express': [
    [31.9539, 35.9106],
    [31.9700, 35.9350],
    [31.9850, 35.9550],
    [31.9950, 35.9750]
  ]
};

const ROUTE_COLORS = {
  'Route 10A': '#3b82f6',
  'Route 15': '#8b5cf6',
  'University Express': '#f59e0b'
};

export default function LiveMap({ buses = [], height = '430px', trackedBusId = null, activeRoute = null }) {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markersRef = useRef({});
  const pathsRef = useRef({});
  const hasSetInitialView = useRef(false);

  useEffect(() => {
    if (mapInstance.current) return;
    mapInstance.current = L.map(mapRef.current, {
      center: [31.9539, 35.9106],
      zoom: 12,
      zoomControl: true,
    });
    // Use HTTPS and mt1 subdomain for more reliable Google Maps tiles
    L.tileLayer('https://mt1.google.com/vt?lyrs=m&x={x}&y={y}&z={z}', {
      maxZoom: 20,
      subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
      attribution: 'Map data ©2026 Google'
    }).addTo(mapInstance.current);
  }, []);

  useEffect(() => {
    if (!mapInstance.current) return;
    
    // Zoom logic
    if (trackedBusId) {
      const bus = buses.find(b => String(b.busId) === String(trackedBusId) || b.plateNumber === trackedBusId);
      if (bus && bus.lat) {
        // Smoothly follow the bus if tracking is enabled
        mapInstance.current.panTo([bus.lat, bus.lng], { animate: true, duration: 1.0 });
        // Only force zoom level once when starting tracking or if zoom is too far out
        if (mapInstance.current.getZoom() < 15) {
          mapInstance.current.setZoom(16);
        }
      }
    } else if (!hasSetInitialView.current && buses.length > 0) {
      // Only set initial view once when buses first appear
      const firstBus = buses[0];
      if (firstBus && firstBus.lat) {
        mapInstance.current.setView([firstBus.lat, firstBus.lng], 13, { animate: true });
        hasSetInitialView.current = true;
      }
    }

    const currentBusIds = new Set(buses.map(b => String(b.busId)));

    buses.forEach((bus) => {
      const strBusId = String(bus.busId);
      // Visibility Filtering
      const assignedRouteName = bus.routeId || (strBusId.includes('1') ? 'Route 10A' : 'University Express');
      let isVisible = true;
      if (activeRoute) {
        if (assignedRouteName !== activeRoute) isVisible = false;
      }
      if (trackedBusId) {
        if (strBusId !== String(trackedBusId) && bus.plateNumber !== trackedBusId) isVisible = false;
      }

      const isEmergency = bus.status === 'fault' || bus.status === 'emergency';
      const isTracked = trackedBusId && (strBusId === String(trackedBusId) || bus.plateNumber === trackedBusId);
      const routeColor = ROUTE_COLORS[assignedRouteName] || '#10b981';
      const icon = makeBusIcon(isEmergency, isTracked, isVisible, routeColor);
      const label = `Bus ID: ${strBusId}`;
      
      // Marker handling
      if (!isVisible) {
        if (markersRef.current[strBusId]) {
           markersRef.current[strBusId].remove();
           delete markersRef.current[strBusId];
        }
        if (pathsRef.current[strBusId]) {
           pathsRef.current[strBusId].remove();
           delete pathsRef.current[strBusId];
        }
      } else {
        if (markersRef.current[strBusId]) {
          markersRef.current[strBusId].setLatLng([bus.lat, bus.lng]);
          markersRef.current[strBusId].setIcon(icon);
        } else {
          const marker = L.marker([bus.lat, bus.lng], { icon })
            .bindTooltip(`🚌 ${label}${bus.driverName ? ` · ${bus.driverName}` : ''}`, {
              permanent: false, direction: 'top', offset: [0, -10],
            })
            .addTo(mapInstance.current);
          markersRef.current[strBusId] = marker;
        }

        // Generate a deterministic mock path for the bus based on its ID
        const numId = parseInt(strBusId.replace(/\D/g, '')) || 100;
        const offset1 = (numId % 10) * 0.0015;
        const offset2 = (numId % 20) * 0.0015;
        
        const assignedPathCoords = [
          [bus.lat - 0.005 - offset1, bus.lng - 0.005 + offset2],
          [bus.lat - 0.002 - offset1/2, bus.lng - 0.001 + offset2/2],
          [bus.lat, bus.lng]
        ];

        if (!pathsRef.current[strBusId]) {
           const poly = L.polyline(assignedPathCoords, { 
              color: routeColor, 
              weight: isTracked ? 5 : 3, 
              opacity: isTracked ? 1.0 : 0.8 
           })
           .bindTooltip(`${label} (${assignedRouteName})`, { sticky: true, className: 'path-tooltip' })
           .addTo(mapInstance.current);
           pathsRef.current[strBusId] = poly;
        } else {
           pathsRef.current[strBusId].setLatLngs(assignedPathCoords);
           pathsRef.current[strBusId].setStyle({
              color: routeColor, 
              weight: isTracked ? 5 : 3, 
              opacity: isTracked ? 1.0 : 0.8 
           });
           pathsRef.current[strBusId].setTooltipContent(`${label} (${assignedRouteName})`);
        }
      }
    });

    // Cleanup removed buses
    Object.keys(markersRef.current).forEach(id => {
       if (!currentBusIds.has(id)) {
           markersRef.current[id].remove();
           delete markersRef.current[id];
       }
    });
    Object.keys(pathsRef.current).forEach(id => {
       if (!currentBusIds.has(id)) {
           pathsRef.current[id].remove();
           delete pathsRef.current[id];
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
