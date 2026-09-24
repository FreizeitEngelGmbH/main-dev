import { useState, useEffect, useCallback } from "react";

interface GeoPosition {
  latitude: number;
  longitude: number;
}

interface UseGeolocationResult {
  position: GeoPosition | null;
  loading: boolean;
  error: string | null;
  requestLocation: () => void;
  denied: boolean;
}

export function useGeolocation(): UseGeolocationResult {
  const [position, setPosition] = useState<GeoPosition | null>(() => {
    const cached = sessionStorage.getItem('user_geolocation');
    if (cached) {
      try { return JSON.parse(cached); } catch { return null; }
    }
    return null;
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [denied, setDenied] = useState(false);

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setError("Standortermittlung wird von deinem Browser nicht unterstützt.");
      return;
    }

    setLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const geo = { latitude: pos.coords.latitude, longitude: pos.coords.longitude };
        setPosition(geo);
        setLoading(false);
        setDenied(false);
        sessionStorage.setItem('user_geolocation', JSON.stringify(geo));
      },
      (err) => {
        setLoading(false);
        if (err.code === err.PERMISSION_DENIED) {
          setDenied(true);
          setError("Standortzugriff wurde verweigert.");
        } else if (err.code === err.POSITION_UNAVAILABLE) {
          setError("Standort konnte nicht ermittelt werden.");
        } else {
          setError("Zeitüberschreitung bei der Standortermittlung.");
        }
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 }
    );
  }, []);

  return { position, loading, error, requestLocation, denied };
}
