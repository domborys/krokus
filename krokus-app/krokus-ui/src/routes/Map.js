import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import MapPanel from './MapPanel';
import ObservationSearch from './ObservationSearch';
import ObservationList from './ObservationList';
import Observation from './Observation';
import ObservationAdd from './ObservationAdd';
import ObservationEdit from './ObservationEdit';
import ConfirmationAdd from './ConfirmationAdd';
import ConfirmationEdit from './ConfirmationEdit';
import PlaceSearch from './PlaceSearch';
import { Route, Routes, useNavigate, useMatch, useLocation, useParams } from 'react-router-dom'
import { useState, useMemo } from 'react';
import { apiService } from '../services/api';
import routeData from '../services/routeData';
import { MapContext } from '../services/contexts';
import L from 'leaflet';
export default function Map() {
    const obs = { items: [{ id: 1, title: 'aaaa', location: [50.132162, 18.556524] }, { id: 2, title: 'bbbb', location: [50.220957, 19.161552] }, { id: 3, title: 'ccc', location: [50.451696, 18.935892] }] };
    const obs2 = [{ title: 'krowa', location: [52.132162, 17.556524] }];
    const obs3 = { items: [] };
    const [title, setTitle] = useState('');
    const [tags, setTags] = useState([]);
    const [observations, setObservations] = useState(obs3);
    const [selectedPoint, setSelectedPoint] = useState(['', '']);
    const [selectedPointDistance, setSelectedPointDistance] = useState('');
    const [isPointSelection, setPointSelection] = useState(false);
    const [selectedPolygon, setSelectedPolygon] = useState([]);
    const [isPolygonSelection, setPolygonSelection] = useState(false);
    const [locationType, setLocationType] = useState('anywhere');
    const [addLocationType, setAddLocationType] = useState('point');
    const [focusedObservationId, setFocusedObservationId] = useState(null);
    const [placeName, setPlaceName] = useState('');
    const [prevSearchParams, setPrevSearchParams] = useState({});
    const navigate = useNavigate();
    const [map, setMap] = useState(null);
    const location = useLocation();
    const [selectedPlace, setSelectedPlace] = useState(null);
    const subpage = useMemo(() => routeData.findRouteName(location.pathname), [location]);
    const focusedObservation = useMemo(
        () => observations.items.find(obs => obs.id === focusedObservationId) ?? null,
        [focusedObservationId]);
    function boundsToParams(bounds) {
        return {
            xmin: bounds.getWest().toFixed(6),
            xmax: bounds.getEast().toFixed(6),
            ymin: bounds.getSouth().toFixed(6),
            ymax: bounds.getNorth().toFixed(6),
        };
    }
    async function searchObservations(subParams) {
        const params = { ...subParams };
        if (locationType === 'visible') {
            const bounds = map.getBounds();
            Object.assign(params, boundsToParams(bounds));
        }
        else if (locationType === 'distance') {
            params.xcenter = selectedPoint[1];
            params.ycenter = selectedPoint[0];
            params.distance = selectedPointDistance * 1000;
        }
        else if (locationType === 'place') {
            if (selectedPlace) {
                if (selectedPlace.leaflet.type === 'Point') {
                    const latlng = L.latLng(selectedPlace.leaflet.coordinates);
                    const bounds = latlng.toBounds(10000);
                    Object.assign(params, boundsToParams(bounds));
                }
                else {
                    const bbox = selectedPlace.boundingbox;
                    const bounds = L.latLngBounds(L.latLng(bbox[0], bbox[2]), L.latLng(bbox[1], bbox[3]));
                    Object.assign(params, boundsToParams(bounds));
                }
            }
        }
        setPrevSearchParams(params);
        const result = await apiService.getObservations(params);
        setObservations(result);
        console.log(result);
        navigate('/map/results');
    }

    async function reloadObservations() {
        const result = await apiService.getObservations(prevSearchParams);
        setObservations(result);
        console.log(result);
    } 

    function handleObservationClick(observationId) {
        const id = parseInt(observationId);
        navigate(`/map/observations/${id}`);
    }

    return (
        <Container fluid className="full-height-container">
            <MapContext.Provider value={{
                title, setTitle, tags, setTags,
                selectedPoint, setSelectedPoint, isPointSelection, setPointSelection, selectedPointDistance, setSelectedPointDistance,
                locationType, setLocationType, addLocationType, setAddLocationType, setMap, selectedPolygon, setSelectedPolygon, isPolygonSelection, setPolygonSelection, subpage,
                focusedObservationId, setFocusedObservationId, focusedObservation, placeName, setPlaceName, selectedPlace, setSelectedPlace, reloadObservations
            }}>
                <Row className="full-height">
                    <Col xs={3} className="full-height border-end" style={{ overflow: 'auto' }} >

                        <Routes>
                            <Route index element={<ObservationSearch onSubmit={searchObservations} />} />
                            <Route path="results" element={<ObservationList observations={observations} />} />
                            <Route path="observations-add" element={<ObservationAdd />} />
                            <Route path="observations/:id" element={<Observation />} />
                            <Route path="observations-edit/:id" element={<ObservationEdit />} />
                            <Route path="confirmations-add" element={<ConfirmationAdd />} />
                            <Route path="confirmations-edit/:id" element={<ConfirmationEdit />} />
                            <Route path="place-search" element={<PlaceSearch />} />
                        </Routes>
                    </Col>
                    <Col className={`full-height p-0 ${isPointSelection ? 'shadow-inside' : ''}`}>
                        <MapPanel observations={observations.items} onObservationClick={handleObservationClick} />
                    </Col>
                </Row>
            </MapContext.Provider>
        </Container>
    );
}