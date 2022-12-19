import { useEffect, useContext, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvent, Circle, Polygon } from 'react-leaflet';
import L from 'leaflet';
import { MapContext } from '../services/contexts';
export default function MapPanel({ observations, onObservationClick}) {
    const { setMap } = useContext(MapContext);
    function handleMarkerClick(observationId, e) {
        onObservationClick(observationId, e);
    }
    const markers = observations.map(observation =>
        <Marker position={observation.location} key={observation.id}
            eventHandlers={{
                click: e => handleMarkerClick(observation.id, e),
            }}>
            <Popup>
                {observation.title}
            </Popup>
        </Marker>
    );
    console.log(observations.filter(observation => observation.boundary));
    const polygons = observations.filter(observation => observation.boundary).map(observation => 
        <Polygon pathOptions={{ fillColor: 'blue', color:'blue' }} positions={observation.boundary} key={observation.id}
            eventHandlers={{
                click: e => handleMarkerClick(observation.id, e),
            }}
        />
    )


    return (
        <MapContainer className="full-height" center={[50.288964, 18.678178]} zoom={13} ref={setMap }>
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {markers}
            {polygons}
            <SelectedPointMarker />
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

function SelectedPointMarker() {
    const { selectedPoint, setSelectedPoint, isPointSelection, setPointSelection, selectedPointDistance, locationType } = useContext(MapContext);
    const isLocationDistance = locationType === 'distance';
    const selectedPointFloat = useMemo(() => selectedPoint.map(parseFloat), [selectedPoint]);
    const radius = useMemo(() => parseFloat(selectedPointDistance) * 1000, [selectedPointDistance]);
    const map = useMapEvent('click', e => {
        if (isPointSelection) {
            const latlng = e.latlng;
            setSelectedPoint([latlng.lat.toFixed(6), latlng.lng.toFixed(6)]);
            setPointSelection(false);
        }
    });
    useEffect(() => {
        if (isPointSelection) {
            L.DomUtil.addClass(map._container, 'cursor-crosshair');
        }
        else {
            L.DomUtil.removeClass(map._container, 'cursor-crosshair');
        }
    }, [isPointSelection]);
    const pointMarkerVisible = isLocationDistance && selectedPointFloat.every(c => !isNaN(c));
    return (pointMarkerVisible &&
        <>
            {!isNaN(radius) && <Circle center={selectedPoint} pathOptions={{ fillColor: 'blue' }} radius={radius} />}
            <Marker position={selectedPoint} key="selectedPoint"></Marker>
        </>);
}