import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import MapPanel from './MapPanel';
import ObservationSearch from './ObservationSearch';
import ObservationList from './ObservationList';
import Observation from './Observation';
import { Route, Routes, useNavigate } from 'react-router-dom'
import { useState } from 'react';
import { apiService } from '../services/api';
import { MapContext } from '../services/contexts';
export default function Map() {
    const obs = { items: [{ id: 1, title: 'aaaa', location: [50.132162, 18.556524] }, { id: 2, title: 'bbbb', location: [50.220957, 19.161552] }, { id: 3, title: 'ccc', location: [50.451696, 18.935892] }] };
    const obs2 = [{ title: 'krowa', location: [52.132162, 17.556524] }];
    const obs3 = { items: [] };
    const [observations, setObservations] = useState(obs3);
    const [selectedPoint, setSelectedPoint] = useState(['', '']);
    const [selectedPointDistance, setSelectedPointDistance] = useState('');
    const [isPointSelection, setPointSelection] = useState(false);
    const [locationType, setLocationType] = useState('anywhere');
    const navigate = useNavigate();
    const [map, setMap] = useState(null);

    async function searchObservations(subParams) {
        const params = { ...subParams };
        if (locationType === 'visible') {
            const bounds = map.getBounds();
            params.xmin = bounds.getWest().toFixed(6);
            params.xmax = bounds.getEast().toFixed(6);
            params.ymin = bounds.getSouth().toFixed(6);
            params.ymax = bounds.getNorth().toFixed(6);
        }
        else if (locationType === 'distance') {
            params.xcenter = selectedPoint[1];
            params.ycenter = selectedPoint[0];
            params.distance = selectedPointDistance*1000;
        }
        const result = await apiService.getObservations(params);
        setObservations(result);
        console.log(result);
        navigate('/map/results');
    }

    function handleObservationClick(observationId) {
        const id = parseInt(observationId);
        navigate(`/map/observations/${id}`);
    }

    return (
        <Container fluid className="full-height-container">
            <MapContext.Provider value={{ selectedPoint, setSelectedPoint, isPointSelection, setPointSelection, selectedPointDistance, setSelectedPointDistance, locationType, setLocationType, setMap }}>
                <Row className="full-height">
                    <Col xs={3} className="full-height border-end" style={{ overflow: 'auto' }} >

                        <Routes>
                            <Route index element={<ObservationSearch onSubmit={searchObservations} />} />
                            <Route path="results" element={<ObservationList observations={observations} />} />
                            <Route path="observations/:id" element={<Observation />} />
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