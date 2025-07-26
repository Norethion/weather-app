import { useState } from 'react';
import { useTranslation } from 'react-i18next';

interface GeolocationState {
  latitude: number | null;
  longitude: number | null;
  error: string | null;
  loading: boolean;
}

export const useGeolocation = () => {
  const { t } = useTranslation();
  const [state, setState] = useState<GeolocationState>({
    latitude: null,
    longitude: null,
    error: null,
    loading: false,
  });

  const fetchLocationByIP = async () => {

    try {
      const response = await fetch('https://ip-api.com/json');
      const data = await response.json();
      
      if (data && data.status === 'success') {
        setState({
          latitude: data.lat,
          longitude: data.lon,
          error: null,
          loading: false,
        });
      } else {
        setState(prev => ({
          ...prev,
          loading: false,
          error: t('ipLocationError') || 'IP tabanlı konum alınamadı.',
        }));
      }
    } catch (e) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: t('ipLocationError') || 'IP tabanlı konum alınamadı.',
      }));
    }
  };

  const getCurrentPosition = () => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    if (!navigator.geolocation) {

      fetchLocationByIP();
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {

        setState({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          error: null,
          loading: false,
        });
      },
      (error) => {

        let errorMessage = t('locationError');
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = t('locationPermissionDenied');
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = t('locationUnavailable');
            break;
          case error.TIMEOUT:
            errorMessage = t('locationTimeout');
            break;
        }
        setState(prev => ({
          ...prev,
          loading: false,
          error: errorMessage,
        }));
        // Hata durumunda IP fallback
        setTimeout(() => {
          fetchLocationByIP();
        }, 3000);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 600000, // 10 dakika
      }
    );
  };

  return { ...state, getCurrentPosition };
};
