import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
export default function MapPanel({ observations }) {

    const markers = observations.map(observation =>
        <Marker position={observation.location} key={observation.id}>
            <Popup>
                {observation.title}
            </Popup>
        </Marker>
    );

    return (
        <MapContainer className="full-height" center={[50.288964, 18.678178]} zoom={13}>
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {markers}
            <MapResizer observations={observations} />
        </MapContainer>    
    );
}

function MapResizer({ observations }) {
    const map = useMap();
    useEffect(() => {
        if (observations.length > 0) {
            const bounds = getBounds(observations);
            map.fitBounds(bounds);
        }
    }, [observations]);
}

function getBounds(observations) {
    const points = observations.map(o => o.location);
    const minN = points.reduce((currentMin, point) => Math.min(currentMin, point[0]), Infinity);
    const minE = points.reduce((currentMin, point) => Math.min(currentMin, point[1]), Infinity);
    const maxN = points.reduce((currentMin, point) => Math.max(currentMin, point[0]), -Infinity);
    const maxE = points.reduce((currentMin, point) => Math.max(currentMin, point[1]), -Infinity);
    return [[minN, minE], [maxN, maxE]];
}