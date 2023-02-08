import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Collapse from 'react-bootstrap/Collapse';
import Card from 'react-bootstrap/Card';
import Stack from 'react-bootstrap/Stack';
import PanelHeader from '../components/PanelHeader';
import PolygonPointInputs from '../components/PolygonPointInputs';
import { useState, useContext, useEffect } from 'react';
import TagInput from '../components/TagInput';
import { MapContext } from '../services/contexts';
import DatePicker from 'react-datepicker';
import { UserContext } from '../services/contexts';
import { deepParseFloat, deepIsNaN } from '../services/utils';
import { apiService } from '../services/api';
import { useNavigate } from 'react-router-dom';

/**
 * Left panel for adding a new observation.
 */
export default function ObservationSearch() {
    const [title, setTitle] = useState('');
    const [tags, setTags] = useState([]);
    const [description, setDescription] = useState('');
    const { selectedPoint, setSelectedPoint, setPointSelection, selectedPolygon, setSelectedPolygon,
        addLocationType, setAddLocationType, setPolygonSelection, displayCreatedObservation } = useContext(MapContext);
    const [observationDate, setObservationDate] = useState(new Date());
    const [files, setFiles] = useState([]);
    const [validated, setValidated] = useState(false);
    const { currentUser } = useContext(UserContext);
    const navigate = useNavigate();

    const titleValid = title.trim() !== '';
    const locationValid = isLocationValid();

    useEffect(() => clearSharedState(), []);

    function isLocationValid() {
        if (addLocationType === 'point') {
            const location = deepParseFloat(selectedPoint);
            return !deepIsNaN(location);
        }
        else if (addLocationType === 'polygon') {
            const boundary = deepParseFloat(selectedPolygon);
            return !deepIsNaN(boundary) && selectedPolygon.length >= 3;
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

    function validate() {
        setValidated(true);
        return titleValid && locationValid;
    }

    async function handleSubmit(e) {
        e.preventDefault();
        if (!validate()) {
            return;
        }
        const observation = {
            title: title,
            userId: currentUser.id,
            tags: tags.map(tag => ({name:tag}))
        };
        if (addLocationType === 'point') {
            observation.location = deepParseFloat(selectedPoint);
        }
        else if (addLocationType === 'polygon') {
            observation.boundary = deepParseFloat(selectedPolygon);
        }
        const confirmation = {
            isConfirmed: true,
            dateTime: observationDate.toISOString(),
            description:description
        }
        observation.confirmations = [confirmation];
        const savedObservation = await apiService.postObservation(observation);
        const confirmationId = savedObservation.confirmations[0].id;
        if (files.length > 0) {
            await apiService.postPictures(confirmationId, files);
        }
        displayCreatedObservation(savedObservation);
        navigate(`/map/observations/${savedObservation.id}`);
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
    function handleClearPolygonPointClick(){
        setSelectedPolygon([]);
        setPolygonSelection(true);
    }
    function handleDescriptionChange(e) {
        setDescription(e.target.value);
    }
    function handlePicturesChange(e) {
        setFiles(Array.from(e.target.files));
    }
    const invalidLocationInfo = <div className="text-danger">Proszę podać poprawną lokalizację obserwacji.</div>;
    const polygonInputs = selectedPolygon.map((point, index) => <PolygonPointInputs pointIndex={index} key={index} />);
    return (
        <div>
            <PanelHeader>Dodaj obserwację</PanelHeader>
            <Form onSubmit={handleSubmit} action="#">
                <Form.Group className="mb-3" controlId="formObservationTitle">
                    <Form.Label>Tytuł</Form.Label>
                    <Form.Control type="text" isInvalid={validated && !titleValid} value={title} onChange={handleTitleChange} />
                    <Form.Control.Feedback type="invalid">Proszę podać tytu.ł</Form.Control.Feedback>
                </Form.Group>
                <TagInput label="Tagi" onTagsChange={handleTagsChange} />
                <div>Położenie</div>
                <div>
                    <Form.Check type="radio" name="radioLocationType" id="radioLocationTypePoint" value="point" label="Punkt" checked={addLocationType === 'point'} onChange={handleLocationTypeChange} />
                    <Form.Check type="radio" name="radioLocationType" id="radioLocationTypePolygon" value="polygon" label="Obszar" checked={addLocationType === 'polygon'} onChange={handleLocationTypeChange} />
                </div>
                <Collapse in={addLocationType === 'point'}>
                    <div>
                        <Card className="mt-3 mb-3" border={validated && !locationValid && 'danger'}>
                            <Card.Header>Lokalizacja</Card.Header>
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
                            </Card.Body>
                        </Card>
                        {validated && !locationValid && invalidLocationInfo}
                    </div>
                </Collapse>
                <Collapse in={addLocationType === 'polygon'}>
                    <div>
                        <Card className="mt-3 mb-3" border={validated && !locationValid && 'danger'}>
                            <Card.Header>Lokalizacja</Card.Header>
                            <Card.Body>
                                {polygonInputs}
                                <Stack direction="horizontal" className="mt-2">
                                    <Button variant="danger" type="button" onClick={handleClearPolygonPointClick}>Wyczyść</Button>
                                    <Button variant="primary" type="button" className="ms-auto" onClick={handleAddPolygonPointClick}>Dodaj punkt</Button>
                                </Stack>
                                
                            </Card.Body>
                        </Card>
                        {validated && !locationValid && invalidLocationInfo}
                    </div>
                </Collapse>
                <Form.Group className="mb-3" controlId="observationDate">
                    <Form.Label>Data obserwacji</Form.Label>
                    <DatePicker
                        selected={observationDate}
                        onChange={(date) => setObservationDate(date)}
                        timeInputLabel="Godzina:"
                        dateFormat="dd.MM.yyyy HH:mm"
                        showTimeInput
                        locale="pl"
                        className="form-control"
                        />
                </Form.Group>

                <Form.Group className="mb-3" controlId="formObservationDescription">
                    <Form.Label>Opis</Form.Label>
                    <Form.Control as="textarea" rows={4} value={description} onChange={handleDescriptionChange} />
                </Form.Group>
                <Form.Group controlId="formPictures" className="mb-3">
                    <Form.Label>Zdjęcia</Form.Label>
                    <Form.Control type="file" multiple onChange={handlePicturesChange} />
                </Form.Group>
                <Stack direction="horizontal" className="justify-content-end my-3">
                    <Button variant="primary" type="submit">
                        Dodaj
                    </Button>
                </Stack>
            </Form>
        </div>

    );
}
/*
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
        <InputGroup>
            <Form.Control id={`polygonPoint${pointIndex}N`} type="text" value={selectedPolygon[pointIndex][0]} onChange={e => handlePolygonPointChange(e, 0)} placeholder="N" aria-label={`Punkt ${pointIndex+1} współrzędna N`} />
            <Form.Control id={`polygonPoint${pointIndex}E`} type="text" value={selectedPolygon[pointIndex][1]} onChange={e => handlePolygonPointChange(e, 1)} placeholder="E" aria-label={`Punkt ${pointIndex + 1} współrzędna N`} />
        </InputGroup>
    );
}*/