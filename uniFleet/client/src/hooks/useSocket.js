
import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3001';

export function useSocket(handlers = {}) {
  const socketRef = useRef(null);

  useEffect(() => {
    socketRef.current = io(SOCKET_URL);

    if (handlers.onBusLocation)
      socketRef.current.on('bus:location', handlers.onBusLocation);
    if (handlers.onAlertNew)
      socketRef.current.on('alert:new', handlers.onAlertNew);
    if (handlers.onAlertResolved)
      socketRef.current.on('alert:resolved', handlers.onAlertResolved);
    if (handlers.onParcelUpdated)
      socketRef.current.on('parcel:updated', handlers.onParcelUpdated);

    return () => socketRef.current.disconnect();
  }, []);

  return socketRef;
}
