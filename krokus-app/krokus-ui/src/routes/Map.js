import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import { useState } from 'react';

export default function Map() {
    const [observations, setObservations] = useState([]);

    return (
        <Container fluid className="full-height-container">
            <Row className="full-height">
                <Col xs={3} className="full-height border-end">
                    aaaaa
                </Col>
                <Col className="full-height p-0 ">
                    <MapContainer className="full-height" center={[51.505, -0.09]} zoom={13}>
                        <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        <Marker position={[51.505, -0.09]}>
                            <Popup>
                                A pretty CSS3 popup. <br /> Easily customizable.
                            </Popup>
                        </Marker>
                    </MapContainer>
                </Col>
            </Row>
        </Container>
    );
}