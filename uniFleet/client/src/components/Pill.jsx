import React from 'react';

export default function Pill({ status }) {
  const map = {
    active: 'active',
    inactive: 'inactive',
    pending: 'pending',
    'en-route': 'en-route',
    'en route': 'en-route',
    blacklisted: 'blacklisted',
    emergency: 'emergency',
    fault: 'inactive',
    good: 'active',
    resolved: 'active',
  };
  const cls = map[status?.toLowerCase()] || 'pending';
  return <span className={`pill ${cls}`}>{status}</span>;
}
