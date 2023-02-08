import { useEffect, useContext, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvent, Circle, Polygon, Rectangle } from 'react-leaflet';
import L from 'leaflet';
import { MapContext } from '../services/contexts';
import { padMeters } from '../services/utils';
/**
 * The right panel where the Leaflet map is placed.
 */
export default function MapPanel({ observations, onObservationClick}) {
    const { setMap, subpage } = useContext(MapContext);
    function handleMarkerClick(observationId, e) {
        onObservationClick(observationId, e);
    }
    const observationsVisible = subpage !== 'observationAdd' && subpage !== 'observationEdit';
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
            {observationsVisible && markers}
            {observationsVisible && polygons}
            <SelectedPointMarker />
            <SelectedPolygon />
            <MapResizer observations={observations} />
            <MapZoomer />
            <SelectedPlace />
        </MapContainer>    
    );
}

/**
 * Component which rescales the map when the bounds change.
 */
function MapResizer({ observations }) {
    const map = useMap();
    useEffect(() => {
        if (observations.length > 0) {
            const bounds = getBounds(observations);
            map.fitBounds(bounds);
        }
    }, [observations]);
}

/**
 * Component which zooms the focused observation
 */
function MapZoomer() {
    const map = useMap();
    const { focusedObservation } = useContext(MapContext);
    useEffect(() => {
        if (focusedObservation) {
            const zoom = Math.max(map.getZoom(), 16);
            map.setView(focusedObservation.location, zoom);
        }
    }, [focusedObservation]);
}


function getBounds(observations) {
    const points = observations.map(o => o.location);
    return getBbox(points);
}

function getBbox(points) {
    const minN = points.reduce((currentMin, point) => Math.min(currentMin, point[0]), Infinity);
    const minE = points.reduce((currentMin, point) => Math.min(currentMin, point[1]), Infinity);
    const maxN = points.reduce((currentMin, point) => Math.max(currentMin, point[0]), -Infinity);
    const maxE = points.reduce((currentMin, point) => Math.max(currentMin, point[1]), -Infinity);
    return [[minN, minE], [maxN, maxE]];
}

/**
 * Component which marks the selected point.
 */
function SelectedPointMarker() {
    const { selectedPoint, setSelectedPoint, isPointSelection, setPointSelection,
        selectedPointDistance, locationType, addLocationType, setAddLocationType, subpage } = useContext(MapContext);
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
    const pointMarkerVisible =
        ((subpage === 'observationSearch' && locationType === 'distance')
        || (subpage === 'observationAdd' && addLocationType === 'point')
        || (subpage === 'observationEdit' && addLocationType === 'point'))
        && selectedPointFloat.every(c => !isNaN(c));
    const isCircleVisible = !isNaN(radius) && (subpage === 'observationSearch' && locationType === 'distance');
    return (pointMarkerVisible &&
        <>
        {isCircleVisible && <Circle center={selectedPoint} pathOptions={{ fillColor: 'fuchsia', color: 'fuchsia' }} radius={radius} />}
            <Marker position={selectedPoint} key="selectedPoint"></Marker>
        </>);
}

function deepParseFloat(val) {
    if (Array.isArray(val))
        return val.map(deepParseFloat);
    else
        return parseFloat(val);
}

function filterNanPoints(points) {
    return points.filter(point => point.every(coord => !isNaN(coord)));
}

function filterEmptyPoints(points) {
    return points.filter(point => point.some(coord => coord.trim() !== ''));
}

/**
 * Component which shows the selected polygon.
 */
function SelectedPolygon() {
    const { selectedPolygon, setSelectedPolygon, isPolygonSelection, setPolygonSelection, subpage, addLocationType } = useContext(MapContext);
    const selectedPolygonFloat = useMemo(() => filterNanPoints(deepParseFloat(selectedPolygon)), [selectedPolygon]);
    const map = useMapEvent('click', e => {
        if (isPolygonSelection) {
            const latlng = e.latlng;
            const newPoint = [latlng.lat.toFixed(6), latlng.lng.toFixed(6)];
            const filteredPolygon = filterEmptyPoints(selectedPolygon);
            const newPolygon = filteredPolygon.concat([newPoint]);
            setSelectedPolygon(newPolygon);
        }
    });
    useEffect(() => {
        if (isPolygonSelection) {
            L.DomUtil.addClass(map._container, 'cursor-crosshair');
        }
        else {
            L.DomUtil.removeClass(map._container, 'cursor-crosshair');
        }
    }, [isPolygonSelection]);
    const polygonVisible = (subpage === 'observationAdd' && addLocationType === 'polygon')
        || (subpage === 'observationEdit' && addLocationType === 'polygon');
    const polygon = 
        <Polygon pathOptions={{ fillColor: 'blue', color: 'blue' }} positions={selectedPolygonFloat} key="selectedPolygon" />;
    return polygonVisible && polygon;

}

/**
 * Component which shows the boundaries of the selected place (e.g. town).
 */
function SelectedPlace() {
    const map = useMap();
    const { selectedPlace, locationType, subpage, selectedPointDistance } = useContext(MapContext);
    const visible = selectedPlace && locationType === 'place' && (subpage === 'placeSearch' || subpage === 'observationSearch');
    useEffect(() => {
        if (!visible) {
            return;
        }
        else if (selectedPlace.leaflet.type === 'Point') {
            map.setView(selectedPlace.leaflet.coordinates, 13);
        }
        else {
            const bounds = getBbox(selectedPlace.leaflet.coordinates);
            map.fitBounds(bounds);
        }
    }, [selectedPlace]);

    let el;
    const pathOptions = { fillColor: 'fuchsia', color: 'fuchsia' };
    if (!visible) {
        el = null;
    }
    else if (subpage === 'placeSearch') {
        if (selectedPlace.leaflet.type === 'Point') {
            el = <Marker position={selectedPlace.leaflet.coordinates} key="selectedPlacePoint"></Marker>
        }
        else {
            el = <Polygon pathOptions={pathOptions} positions={selectedPlace.leaflet.coordinates} key="selectedPlacePolygon" />;
        }
    }
    else if (subpage === 'observationSearch') {
        const distance = selectedPointDistance * 1000;
        if (selectedPlace.leaflet.type === 'Point') {
            const latlng = L.latLng(selectedPlace.leaflet.coordinates);
            const bounds = latlng.toBounds(2 * distance);
            el = <Rectangle bounds={bounds} pathOptions={pathOptions} />
        }
        else {
            const bbox = selectedPlace.boundingbox;
            const bounds = L.latLngBounds(L.latLng(bbox[0], bbox[2]), L.latLng(bbox[1], bbox[3]));
            const extendedBounds = padMeters(bounds, distance);
            el = <Rectangle bounds={extendedBounds} pathOptions={pathOptions} />
        }

    }
    return el;
}