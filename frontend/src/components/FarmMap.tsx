import { MapContainer, TileLayer, Marker, Polygon, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { useState } from 'react';

// Fix for missing leaflet types
const pinIcon = new (L.Icon as any)({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  shadowSize: [41, 41]
});

// Default position
const defaultPosition: [number, number] = [-16.027225012421138, -57.794277743409786];

function MapEvents({ editMode, onMapClick }: { editMode: boolean; onMapClick: (pos: [number, number]) => void }) {
  useMapEvents({
    click(e: any) {
      if (editMode) {
        onMapClick([e.latlng.lat, e.latlng.lng]);
      }
    },
  });
  return null;
}

export function FarmMap({
  boundary = [],
  editMode = false,
  onAddPoint,
}: {
  boundary?: [number, number][];
  editMode?: boolean;
  onAddPoint?: (pos: [number, number]) => void;
}) {
  return (
    <div className="h-[360px] rounded-lg overflow-hidden border border-slate-200 relative group">
      <MapContainer
        center={defaultPosition}
        zoom={15}
        style={{ height: '100%', width: '100%' }}
        {...({} as any)}
      >
        <TileLayer
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          attribution="Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community"
          {...({} as any)}
        />
        <Marker
          position={defaultPosition}
          icon={pinIcon as any}
        />
        {boundary.length > 0 && (
          <Polygon
            positions={boundary}
            pathOptions={{ color: 'yellow', fillColor: 'yellow', fillOpacity: 0.2, weight: 3 }}
          />
        )}
        {boundary.map((pos, idx) => (
          editMode && <Marker key={idx} position={pos} icon={pinIcon as any} opacity={0.5} {...({} as any)} />
        ))}
        <MapEvents editMode={editMode} onMapClick={onAddPoint || (() => { })} />
      </MapContainer>

      {editMode && (
        <div className="absolute bottom-4 left-4 right-4 bg-black/70 backdrop-blur-sm p-3 rounded-lg shadow-lg text-white text-sm text-center z-[1000]">
          Clique no mapa para adicionar pontos à divisa da fazenda.
        </div>
      )}
    </div>
  );
}
