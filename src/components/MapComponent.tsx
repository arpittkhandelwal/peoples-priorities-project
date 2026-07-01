'use client';

import { MapContainer, TileLayer, Marker, Popup, CircleMarker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useEffect } from 'react';

// Fix for default marker icon in leaflet + next.js
const icon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

type MapProps = {
  clusters: any[];
  onClusterClick: (cluster: any) => void;
};

export default function MapComponent({ clusters, onClusterClick }: MapProps) {
  // Jaipur center coordinates
  const center: [number, number] = [26.9124, 75.7873];

  const getCategoryColor = (category: string) => {
    switch(category) {
      case 'education': return '#3b82f6'; // blue
      case 'health': return '#ef4444'; // red
      case 'water_and_sanitation': return '#06b6d4'; // cyan
      case 'roads_and_transport': return '#f59e0b'; // amber
      case 'electricity': return '#eab308'; // yellow
      default: return '#6b7280'; // gray
    }
  };

  return (
    <div className="h-full w-full rounded-xl overflow-hidden shadow-lg border border-gray-200">
      <MapContainer center={center} zoom={11} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {clusters.map((cluster) => {
          if (!cluster.clusters?.centroid_location) return null;
          
          const lat = cluster.clusters.centroid_location.lat;
          const lng = cluster.clusters.centroid_location.lng;
          
          return (
            <CircleMarker
              key={cluster.id}
              center={[lat, lng]}
              radius={Math.min(25, 10 + (cluster.clusters.submission_count * 2))}
              pathOptions={{ 
                fillColor: getCategoryColor(cluster.clusters.category),
                color: 'white',
                weight: 2,
                fillOpacity: 0.7
              }}
              eventHandlers={{
                click: () => onClusterClick(cluster)
              }}
            >
              <Popup>
                <div className="font-sans">
                  <h3 className="font-bold text-sm mb-1">{cluster.clusters.theme}</h3>
                  <p className="text-xs text-gray-600 mb-2">
                    {cluster.clusters.submission_count} submissions
                  </p>
                  <button 
                    onClick={() => onClusterClick(cluster)}
                    className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded"
                  >
                    View Details
                  </button>
                </div>
              </Popup>
            </CircleMarker>
          );
        })}
      </MapContainer>
    </div>
  );
}
