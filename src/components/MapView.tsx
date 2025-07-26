import React, { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useTranslation } from 'react-i18next';
import 'leaflet/dist/leaflet.css';
import 'leaflet.heat';

// Leaflet marker icon fix
L.Icon.Default.mergeOptions({
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

export interface CityMarker {
  name: string;
  lat: number;
  lon: number;
}

export interface MapViewProps {
  userLocation?: { lat: number; lon: number };
  selectedCity?: CityMarker;
  favoriteCities?: CityMarker[];
  airQualityPoints?: { lat: number; lon: number; value: number }[];
  onMapClick?: (lat: number, lon: number) => void;
  onAddToFavorites?: (city: CityMarker) => void;
  onRemoveFromFavorites?: (cityName: string) => void;
  onCenterOnUser?: () => void;
  onCenterOnSelected?: () => void;
}

const MapClickHandler: React.FC<{ onMapClick?: (lat: number, lon: number) => void }> = ({ onMapClick }) => {
  useMapEvents({
    click(e) {
      if (onMapClick) {
        onMapClick(e.latlng.lat, e.latlng.lng);
      }
    },
  });
  return null;
};



const MapView: React.FC<MapViewProps> = ({
  userLocation,
  selectedCity,
  favoriteCities = [],
  airQualityPoints = [],
  onMapClick,
  onAddToFavorites,
  onRemoveFromFavorites,
  onCenterOnUser,
  onCenterOnSelected,
}) => {
  const { t } = useTranslation();
  const mapRef = useRef<L.Map | null>(null);
  const [mapInstance, setMapInstance] = useState<L.Map | null>(null);

  useEffect(() => {
    if (mapRef.current && airQualityPoints.length > 0) {
      // Remove previous heat layers
      mapRef.current.eachLayer(layer => {
        if ((layer as any)._heat) {
          mapRef.current?.removeLayer(layer);
        }
      });
      // Add heatmap
      // @ts-ignore
      const heatLayer = L.heatLayer(
        airQualityPoints.map(p => [p.lat, p.lon, p.value]),
        { radius: 25, blur: 15, maxZoom: 12 }
      );
      heatLayer.addTo(mapRef.current);
    }
  }, [airQualityPoints]);

  const center = selectedCity
    ? [selectedCity.lat, selectedCity.lon]
    : userLocation
    ? [userLocation.lat, userLocation.lon]
    : [39.92, 32.85]; // Ankara default

  const isFavorite = (cityName: string) => {
    return favoriteCities.some(city => city.name === cityName);
  };

  return (
    <div className="mb-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
            {t('map')}
          </h2>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {t('mapInstructions')}
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => {
              if (onCenterOnUser) onCenterOnUser();
              if (userLocation && mapRef.current) {
                mapRef.current.setView([userLocation.lat, userLocation.lon], 12);
              }
            }}
            disabled={!userLocation}
            className="px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
            title={t('centerOnUser')}
          >
            📍 {t('centerOnUser')}
          </button>
          <button
            onClick={() => {
              if (onCenterOnSelected) onCenterOnSelected();
              if (selectedCity && mapRef.current) {
                mapRef.current.setView([selectedCity.lat, selectedCity.lon], 12);
              }
            }}
            disabled={!selectedCity}
            className="px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
            title={t('centerOnSelected')}
          >
            🎯 {t('centerOnSelected')}
          </button>
        </div>
      </div>
      <div className="relative z-10"> {/* Map container */}
        <MapContainer
          ref={mapRef}
          center={center as [number, number]}
          zoom={6}
          style={{ height: '400px', width: '100%', margin: 'auto', borderRadius: '12px' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapClickHandler onMapClick={onMapClick} />
          
          {/* Kullanıcı konumu */}
          {userLocation && (
            <Circle
              center={[userLocation.lat, userLocation.lon]}
              radius={1000}
              pathOptions={{ color: 'blue', fillColor: 'blue', fillOpacity: 0.2 }}
            >
              <Popup>
                <div className="text-center">
                  <div className="font-bold text-blue-600">{t('userLocation')}</div>
                  <div className="text-sm text-gray-600">
                    {userLocation.lat.toFixed(4)}, {userLocation.lon.toFixed(4)}
                  </div>
                </div>
              </Popup>
            </Circle>
          )}
          
          {/* Seçili şehir marker */}
          {selectedCity && (
            <Marker position={[selectedCity.lat, selectedCity.lon]}>
              <Popup>
                <div className="text-center">
                  <div className="font-bold text-green-600">{selectedCity.name}</div>
                  <div className="text-sm text-gray-600">
                    {selectedCity.lat.toFixed(4)}, {selectedCity.lon.toFixed(4)}
                  </div>
                  {onAddToFavorites && onRemoveFromFavorites && (
                    <button
                      onClick={() => {
                        if (isFavorite(selectedCity.name)) {
                          onRemoveFromFavorites(selectedCity.name);
                        } else {
                          onAddToFavorites(selectedCity);
                        }
                      }}
                      className="mt-2 px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                    >
                      {isFavorite(selectedCity.name) ? t('removeFromFavorites') : t('addToFavorites')}
                    </button>
                  )}
                </div>
              </Popup>
            </Marker>
          )}
          
          {/* Favori şehirler marker */}
          {favoriteCities.map(city => (
            <Marker 
              key={city.name} 
              position={[city.lat, city.lon]}
              icon={new L.Icon({
                iconUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDJsMy4wOSA5LjI2TDIyIDEyLjA5bC03IDYuODIgMS42MyA5LjU5TDEyIDI0bC00LjYzIDQuNUw5IDE4LjkxIDIgMTIuMDlsNi45MS0uODNMMTIgMnoiIGZpbGw9IiNmNTk1MDciLz4KPC9zdmc+',
                iconSize: [25, 25],
                iconAnchor: [12, 12],
              })}
            >
              <Popup>
                <div className="text-center">
                  <div className="font-bold text-yellow-600">⭐ {city.name}</div>
                  <div className="text-sm text-gray-600">
                    {city.lat.toFixed(4)}, {city.lon.toFixed(4)}
                  </div>
                  {onRemoveFromFavorites && (
                    <button
                      onClick={() => onRemoveFromFavorites(city.name)}
                      className="mt-2 px-3 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                    >
                      {t('removeFromFavorites')}
                    </button>
                  )}
                </div>
              </Popup>
            </Marker>
          ))}
          

        </MapContainer>
      </div>
    </div>
  );
};

export default MapView; 