
import { useState, useEffect } from 'react';

export function useAuth() {
  const [token, setToken] = useState(localStorage.getItem('unifleet_token'));

  useEffect(() => {
    const handleStorageChange = () => {
      setToken(localStorage.getItem('unifleet_token'));
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return { token, setToken };
}
