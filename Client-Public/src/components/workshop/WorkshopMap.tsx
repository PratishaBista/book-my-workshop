import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// @ts-ignore
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
// @ts-ignore
import markerIcon from 'leaflet/dist/images/marker-icon.png';
// @ts-ignore
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: markerIcon2x,
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
});

interface WorkshopMapProps {
    latitude?: number;
    longitude?: number;
    address: string;
    locationName?: string;
}

const WorkshopMap: React.FC<WorkshopMapProps> = ({ latitude, longitude, address, locationName }) => {
    const defaultCenter: [number, number] = [27.7172, 85.3240];
    const position: [number, number] = latitude && longitude
        ? [latitude, longitude]
        : defaultCenter;

    return (
        <div className="w-full h-full rounded-2xl overflow-hidden shadow-inner ring-1 ring-black/5">
            <MapContainer
                center={position}
                zoom={15}
                scrollWheelZoom={false}
                style={{ height: '100%', width: '100%' }}
            >
                <TileLayer
                    url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                />
                <Marker position={position}>
                    <Popup>
                        <div className="p-1">
                            <p className="font-serif font-bold text-deep-purple m-0">{locationName || "Workshop Location"}</p>
                            <p className="text-xs text-gray-500 m-0 mt-1">{address}</p>
                        </div>
                    </Popup>
                </Marker>
            </MapContainer>
        </div>
    );
};

export default WorkshopMap;
