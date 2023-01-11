import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Collapse from 'react-bootstrap/Collapse';
import InputGroup from 'react-bootstrap/InputGroup';
import { useState, useContext, useEffect } from 'react';
import TagInput from '../components/TagInput';
import { MapContext } from '../services/contexts';
import DatePicker from 'react-datepicker';
import { UserContext } from '../services/contexts';
import { deepParseFloat } from '../services/utils';
import { apiService } from '../services/api';
import { useNavigate} from 'react-router-dom'
export default function ObservationSearch() {
    const [title, setTitle] = useState('');
    const [tags, setTags] = useState([]);
    const [description, setDescription] = useState('');
    const { selectedPoint, setSelectedPoint, setPointSelection, selectedPolygon, setSelectedPolygon, addLocationType, setAddLocationType, setPolygonSelection } = useContext(MapContext);
    const [observationDate, setObservationDate] = useState(new Date());
    const [files, setFiles] = useState([]);
    const { currentUser } = useContext(UserContext);
    const navigate = useNavigate();

    useEffect(() => clearSharedState(), []);

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
        //console.log('savedObservation',savedObservation);
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
    function handleDescriptionChange(e) {
        setDescription(e.target.value);
    }
    function handlePicturesChange(e) {
        setFiles(Array.from(e.target.files));
    }
    const polygonInputs = selectedPolygon.map((point, index) => <PolygonPointInputs pointIndex={index} key={index} />);
    return (
        <div>
            <h2>Dodaj obserwację</h2>
            <Form onSubmit={handleSubmit} action="#">
                <Form.Group className="mb-3" controlId="formObservationTitle">
                    <Form.Label>Tytuł</Form.Label>
                    <Form.Control type="text" value={title} onChange={handleTitleChange} />
                </Form.Group>
                <TagInput label="Tagi" onTagsChange={handleTagsChange} />
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

                
                <div>Data obserwacji</div>
                <DatePicker
                    selected={observationDate}
                    onChange={(date) => setObservationDate(date)}
                    timeInputLabel="Godzina:"
                    dateFormat="dd.MM.yyyy HH:mm"
                    showTimeInput
                    locale="pl"
                    className="form-control"
                />

                <Form.Group className="mb-3" controlId="formObservationDescription">
                    <Form.Label>Opis</Form.Label>
                    <Form.Control as="textarea" rows={4} value={description} onChange={handleDescriptionChange} />
                </Form.Group>
                <Form.Group controlId="formPictures" className="mb-3">
                    <Form.Label>Zdjęcia</Form.Label>
                    <Form.Control type="file" multiple onChange={handlePicturesChange} />
                </Form.Group>
                <Button variant="primary" type="submit">
                    Dodaj
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

    function handlePolygonPointRemove() {
        const newPolygon = selectedPolygon.filter((el, i) => i !== pointIndex);
        setSelectedPolygon(newPolygon);
    }
    return (
        <InputGroup>
            <Form.Control id={`polygonPoint${pointIndex}N`} type="text" value={selectedPolygon[pointIndex][0]} onChange={e => handlePolygonPointChange(e, 0)} placeholder="N" aria-label={`Punkt ${pointIndex+1} współrzędna N`} />
            <Form.Control id={`polygonPoint${pointIndex}E`} type="text" value={selectedPolygon[pointIndex][1]} onChange={e => handlePolygonPointChange(e, 1)} placeholder="E" aria-label={`Punkt ${pointIndex + 1} współrzędna N`} />
            <Button type="button" variant="danger" onClick={handlePolygonPointRemove}>&ndash;</Button>
        </InputGroup>
    );
}