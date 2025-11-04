import { MapContainer, TileLayer, Marker, Polygon } from 'react-leaflet';
import L from 'leaflet';

const pinIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  shadowSize: [41, 41]
});

type Bounds = [number, number][];

const position = [-16.02732808231693, -57.794222997558634]

export function FarmMap({
  center = [-16.02732808231693, -57.794222997558634],
  zoom = 12,
  bounds,
}: {
  center?: [number, number];
  zoom?: number;
  bounds?: Bounds;
}) {
  return (
    <div className="h-[360px] rounded-lg overflow-hidden border border-slate-200">
      <MapContainer center={center as any} zoom={zoom} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap"
        />
        <Marker position={position} icon={pinIcon} />
        
      </MapContainer>
    </div>
  );
}
