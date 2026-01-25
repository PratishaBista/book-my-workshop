import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Search } from 'lucide-react';

import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

interface MapPickerProps {
    lat?: number;
    lng?: number;
    onChange: (lat: number, lng: number, address?: string) => void;
}

const LocationMarker = ({ lat, lng, onChange }: MapPickerProps) => {
    const [position, setPosition] = useState<L.LatLng | null>(
        lat && lng ? L.latLng(lat, lng) : null
    );

    const map = useMapEvents({
        click(e) {
            setPosition(e.latlng);
            onChange(e.latlng.lat, e.latlng.lng);
            map.flyTo(e.latlng, map.getZoom());
        },
    });

    useEffect(() => {
        if (lat && lng) {
            const newPos = L.latLng(lat, lng);
            setPosition(newPos);
        }
    }, [lat, lng]);

    return position === null ? null : (
        <Marker position={position} />
    );
};

const ChangeView = ({ center }: { center: [number, number] }) => {
    const map = useMap();
    useEffect(() => {
        map.setView(center, map.getZoom());
    }, [center]);
    return null;
};

export const MapPicker: React.FC<MapPickerProps> = ({ lat, lng, onChange }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const defaultCenter: [number, number] = [27.7172, 85.3240]; // Kathmandu center
    const center: [number, number] = lat && lng ? [lat, lng] : defaultCenter;

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchQuery.trim()) return;

        setIsSearching(true);
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}`
            );
            const data = await response.json();
            if (data && data.length > 0) {
                const { lat: newLat, lon: newLng, display_name } = data[0];
                onChange(parseFloat(newLat), parseFloat(newLng), display_name);
            }
        } catch (error) {
            console.error('Search error:', error);
        } finally {
            setIsSearching(false);
        }
    };

    return (
        <div className="flex flex-col gap-3">
            <form onSubmit={handleSearch} className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-orange transition-colors">
                    {isSearching ? (
                        <div className="w-4 h-4 border-2 border-primary-orange border-t-transparent rounded-full animate-spin" />
                    ) : (
                        <Search size={18} />
                    )}
                </div>
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search for a location (e.g. Kathmandu Durbar Square)..."
                    className="w-full bg-white border border-gray-100 rounded-2xl py-3 pl-12 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary-orange/20 shadow-sm transition-all"
                />
            </form>

            <div className="h-[300px] w-full rounded-[2rem] overflow-hidden border border-gray-100 shadow-inner group transition-all">
                <MapContainer
                    center={center}
                    zoom={15}
                    scrollWheelZoom={false}
                    style={{ height: '100%', width: '100%' }}
                >
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <ChangeView center={center} />
                    <LocationMarker lat={lat} lng={lng} onChange={onChange} />
                </MapContainer>
            </div>
        </div>
    );
};
