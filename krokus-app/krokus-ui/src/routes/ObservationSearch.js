import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import { useState, useContext } from 'react';
import Collapse from 'react-bootstrap/Collapse';
import TagInput from '../components/TagInput';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Card from 'react-bootstrap/Card';
import { MapContext } from '../services/contexts';
export default function ObservationSearch({onSubmit}) {
    const [title, setTitle] = useState('');
    const [tags, setTags] = useState([]);
    //const [locationType, setLocationType] = useState(null);
    const { selectedPoint, setSelectedPoint, setPointSelection, selectedPointDistance, setSelectedPointDistance, locationType, setLocationType } = useContext(MapContext);

    const isLocationDistance = locationType === 'distance';
    function handleTitleChange(e) {
        setTitle(e.target.value);
    }
    function handleTagsChange(newTags) {
        setTags(newTags);
    }
    function handleLocationTypeChange(e) {
        if (e.target.checked) {
            setLocationType(e.target.value);
        }
    }
    function handleSelectedPointChange(e, coordIndex) {
        const newPoint = [...selectedPoint];
        newPoint[coordIndex] = e.target.value;
        setSelectedPoint(newPoint);
    }
    function handleDistanceChange(e) {
        setSelectedPointDistance(e.target.value);
    }
    function handleAddFromMapClick(e) {
        setPointSelection(true);
    }
    function handleSubmit(e) {
        e.preventDefault();
        const params = {};
        if (title.trim() !== '') {
            params.title = title.trim();
        }
        if (tags.length > 0) {
            params.tag = tags;
        }
        onSubmit(params);
        
    }
    function formatCoord(coord) {
        return coord?.toFixed(6);
    }
    return (
        <div>
            <h2>Szukaj obserwacji</h2>
            <Form onSubmit={handleSubmit} action="#">
                <Form.Group className="mb-3" controlId="formObservationTitle">
                    <Form.Label>Tytuł</Form.Label>
                    <Form.Control type="text" value={title} onChange={handleTitleChange} />
                </Form.Group>
                <TagInput label="Tagi" onTagsChange={handleTagsChange} />
                <div>Miejsce</div>
                <div>
                    <Form.Check type="radio" name="radioLocation" id="radioLocationAnywhere" value="anywhere" label="Gdziekolwiek" onChange={handleLocationTypeChange} />
                    <Form.Check type="radio" name="radioLocation" id="radioLocationVisible" value="visible" label="Widoczny obszar" onChange={handleLocationTypeChange} />
                    <Form.Check type="radio" name="radioLocation" id="radioLocationDistance" value="distance" label="W okolicy punktu" onChange={handleLocationTypeChange } />
                </div>
                <Collapse in={isLocationDistance}>
                    <div>
                        <Card className="mt-3 mb-3">
                            <Card.Header>Parametry</Card.Header>
                            <Card.Body>
                                <Button variant="primary" type="button" className="mb-2" onClick={handleAddFromMapClick}>Dodaj z mapy</Button>
                                <Row>
                                    <Col>
                                        <Form.Group className="mb-3" controlId="formPointN">
                                            <Form.Label >Współrzędna N</Form.Label>
                                            <Form.Control type="text" value={selectedPoint[0]} onChange={e => handleSelectedPointChange(e, 0)} />
                                        </Form.Group>
                                    </Col>
                                    <Col>
                                        <Form.Group className="mb-3" controlId="formPointE">
                                            <Form.Label>Współrzędna E</Form.Label>
                                            <Form.Control type="text" value={selectedPoint[1]} onChange={e => handleSelectedPointChange(e, 1)} />
                                        </Form.Group>
                                    </Col>
                                </Row>
                                <Form.Group className="mb-3" controlId="formDistance">
                                    <Form.Label>Odległość (km)</Form.Label>
                                    <Form.Control type="text" value={selectedPointDistance} onChange={handleDistanceChange} />
                                </Form.Group>
                            </Card.Body>
                        </Card>
                        
                    </div>
                </Collapse>
                <Button variant="primary" type="submit">
                    Szukaj
                </Button>
            </Form>
        </div>
        
    );
}