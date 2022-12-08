import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import MapPanel from './MapPanel';
import ObservationSearch from './ObservationSearch';
import ObservationList from './ObservationList';
import { Outlet, Route, Routes, useNavigate } from 'react-router-dom'
import { useState } from 'react';
import { apiService } from '../services/api';

export default function Map() {
    const obs = { items: [{ id: 1, title: 'aaaa', location: [50.132162, 18.556524] }, { id: 2, title: 'bbbb', location: [50.220957, 19.161552] }, { id: 3, title: 'ccc', location: [50.451696, 18.935892] }] };
    const obs2 = [{ title: 'krowa', location: [52.132162, 17.556524] }];
    const obs3 = { items: [] };
    const [observations, setObservations] = useState(obs3);
    const navigate = useNavigate();

    async function searchObservations(params) {
        const result = await apiService.getObservations(params);
        setObservations(result);
        console.log(result);
        navigate('results');
    }

    return (
        <Container fluid className="full-height-container">
            <Row className="full-height">
                <Col xs={3} className="full-height border-end">
                    
                    <Routes>
                        <Route index element={<ObservationSearch onSubmit={searchObservations} />} />
                        <Route path="results" element={<ObservationList observations={observations} />} />
                    </Routes>
                    
                </Col>
                <Col className="full-height p-0 ">
                    <MapPanel observations={observations.items } />
                </Col>
            </Row>
        </Container>
    );
}