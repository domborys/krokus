import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Collapse from 'react-bootstrap/Collapse';
import { useState, useContext, useEffect } from 'react';
import TagInput from '../components/TagInput';
import { MapContext } from '../services/contexts';
import { UserContext } from '../services/contexts';
import { deepParseFloat, deepToString } from '../services/utils';
import { apiService } from '../services/api';
import { useNavigate, useParams } from 'react-router-dom'
export default function ObservationEdit() {
    const { id } = useParams();
    const [title, setTitle] = useState('');
    const [tags, setTags] = useState([]);
    const { selectedPoint, setSelectedPoint, setPointSelection, selectedPolygon, setSelectedPolygon, addLocationType, setAddLocationType, setPolygonSelection, reloadObservations } = useContext(MapContext);
    //const { currentUser } = useContext(UserContext);
    const navigate = useNavigate();

    useEffect(() => clearSharedState(), []);
    useEffect(() => {
        apiService.getObservation(id)
            .then(observation => {
                setState(observation);
            });
    }, []);

    function setState(observation) {
        console.log('observation', observation);
        setTitle(observation.title);
        setTags(observation.tags.map(tag => tag.name));
        setPointSelection(false);
        setPolygonSelection(false);
        if (observation.boundary) {
            setAddLocationType('polygon');
            setSelectedPoint(['','']);
            setSelectedPolygon(deepToString(observation.boundary));
        }
        else {
            setAddLocationType('point');
            setSelectedPoint(deepToString(observation.location));
            setSelectedPolygon([]);
        }
    }
    function clearSharedState() {
        setSelectedPoint(['', '']);
        setPointSelection(false);
        setPolygonSelection(false);
        setSelectedPolygon([]);
        setAddLocationType('point');
    }
    function handleTitleChange(e) {
        setTitle(e.target.value);
    }
    function handleTagsChange(newTags) {
        setTags(newTags);
    }
    function handleLocationTypeChange(e) {
        if (e.target.checked) {
            setAddLocationType(e.target.value);
        }
    }
    async function handleSubmit(e) {
        e.preventDefault();
        const observation = {
            id: id,
            title: title,
            tags: tags.map(tag => ({ name: tag }))
        };
        if (addLocationType === 'point') {
            observation.location = deepParseFloat(selectedPoint);
        }
        else if (addLocationType === 'polygon') {
            observation.boundary = deepParseFloat(selectedPolygon);
        }
        await apiService.putObservation(observation);
        await reloadObservations();
        navigate(`/map/observations/${id}`);
    }
    function handleAddFromMapClick(e) {
        setPointSelection(true);
    }
    function handleSelectedPointChange(e, coordIndex) {
        const newPoint = [...selectedPoint];
        newPoint[coordIndex] = e.target.value;
        setSelectedPoint(newPoint);
    }
    function handleAddPolygonPointClick() {
        const newPolygon = [...selectedPolygon, ['', '']];
        setSelectedPolygon(newPolygon);
        setPolygonSelection(true);
    }
    
    const polygonInputs = selectedPolygon.map((point, index) => <PolygonPointInputs pointIndex={index} key={index} />);
    return (
        <div>
            <h2>Edytuj obserwację</h2>
            <Form onSubmit={handleSubmit} action="#">
                <Form.Group className="mb-3" controlId="formObservationTitle">
                    <Form.Label>Tytuł</Form.Label>
                    <Form.Control type="text" value={title} onChange={handleTitleChange} />
                </Form.Group>
                <TagInput label="Tagi" initialTags={tags} onTagsChange={handleTagsChange} />
                <div>Położenie</div>
                <div>
                    <Form.Check type="radio" name="radioLocationType" id="radioLocationTypePoint" value="point" label="Punkt" checked={addLocationType === 'point'} onChange={handleLocationTypeChange} />
                    <Form.Check type="radio" name="radioLocationType" id="radioLocationTypePolygon" value="polygon" label="Obszar" checked={addLocationType === 'polygon'} onChange={handleLocationTypeChange} />
                </div>
                <Collapse in={addLocationType === 'point'}>
                    <div>
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
                    </div>
                </Collapse>
                <Collapse in={addLocationType === 'polygon'}>
                    <div>
                        {polygonInputs}
                        <Button variant="primary" type="button" className="mb-2" onClick={handleAddPolygonPointClick}>Dodaj punkt</Button>
                    </div>
                </Collapse>
                <Button variant="primary" type="submit">
                    Zapisz
                </Button>
            </Form>
        </div>

    );
}

function PolygonPointInputs({ pointIndex }) {
    const { selectedPolygon, setSelectedPolygon } = useContext(MapContext);

    function handlePolygonPointChange(e, coordIndex) {
        const newPolygon = [...selectedPolygon];
        const newPoint = [...selectedPolygon[pointIndex]];
        newPoint[coordIndex] = e.target.value;
        newPolygon[pointIndex] = newPoint;
        setSelectedPolygon(newPolygon);
    }
    return (
        <Row>
            <Col>
                <Form.Group className="mb-3" controlId={`polygonPoint${pointIndex}N`}>
                    <Form.Label >N</Form.Label>
                    <Form.Control type="text" value={selectedPolygon[pointIndex][0]} onChange={e => handlePolygonPointChange(e, 0)} />
                </Form.Group>
            </Col>
            <Col>
                <Form.Group className="mb-3" controlId={`polygonPoint${pointIndex}E`}>
                    <Form.Label>E</Form.Label>
                    <Form.Control type="text" value={selectedPolygon[pointIndex][1]} onChange={e => handlePolygonPointChange(e, 1)} />
                </Form.Group>
            </Col>
        </Row>
    );
}