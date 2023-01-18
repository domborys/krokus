import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import { useState, useContext } from 'react';
import Collapse from 'react-bootstrap/Collapse';
import TagInput from '../components/TagInput';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Card from 'react-bootstrap/Card';
import CloseButton from 'react-bootstrap/CloseButton';
import InputGroup from 'react-bootstrap/InputGroup';
import Stack from 'react-bootstrap/Stack';
import { MapContext } from '../services/contexts';
import DistanceRange from '../components/DistanceRange';
import { useNavigate } from 'react-router-dom'
export default function ObservationSearch({onSubmit}) {
    const { title, setTitle, tags, setTags, selectedPoint, setSelectedPoint, setPointSelection, selectedPointDistance, setSelectedPointDistance,
        locationType, setLocationType, placeName, setPlaceName, selectedPlace, setSelectedPlace, } = useContext(MapContext);
    const navigate = useNavigate();
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
    function handleDistanceChange2(newValue) {
        setSelectedPointDistance(newValue);
    }
    function handleAddFromMapClick(e) {
        setPointSelection(true);
    }
    function handlePlaceNameChange(e) {
        setPlaceName(e.target.value);
    }
    function handlePlaceSearchClick() {
        navigate(`/map/place-search`);
    }
    function handlePlaceDeleteClick() {
        setSelectedPlace(null);
    }
    async function handleSubmit(e) {
        e.preventDefault();
        const params = {};
        if (title.trim() !== '') {
            params.title = title.trim();
        }
        if (tags.length > 0) {
            params.tag = tags;
        }
        await onSubmit(params);
        setSelectedPlace(null);
    }
    
    return (
        <div>
            <h1 className="h2 my-3">Szukaj obserwacji</h1>
            <Form onSubmit={handleSubmit} action="#">
                <Form.Group className="mb-3" controlId="formObservationTitle">
                    <Form.Label>Tytuł</Form.Label>
                    <Form.Control type="text" value={title} onChange={handleTitleChange} />
                </Form.Group>
                <TagInput label="Tagi" initialTags={tags} onTagsChange={handleTagsChange} />
                <h2 className="h6 mt-4 mb-2">Miejsce</h2>
                <div>
                    <Form.Check type="radio" name="radioLocation" id="radioLocationAnywhere" value="anywhere" label="Gdziekolwiek" checked={locationType ==='anywhere'} onChange={handleLocationTypeChange} />
                    <Form.Check type="radio" name="radioLocation" id="radioLocationVisible" value="visible" label="Widoczny obszar" checked={locationType === 'visible'} onChange={handleLocationTypeChange} />
                    <Form.Check type="radio" name="radioLocation" id="radioLocationDistance" value="distance" label="W okolicy punktu" checked={locationType === 'distance'} onChange={handleLocationTypeChange} />
                    <Form.Check type="radio" name="radioLocation" id="radioLocationPlace" value="place" label="W pobliżu miejscowości" checked={locationType === 'place'} onChange={handleLocationTypeChange} />
                </div>
                <Collapse in={isLocationDistance}>
                    <div>
                        <Card className="mt-3 mb-3">
                            <Card.Header>Punkt i odległość</Card.Header>
                            <Card.Body>
                                <h3 className="h6">Punkt</h3>
                                <Button variant="primary" type="button" className="mb-2" onClick={handleAddFromMapClick}>Dodaj z mapy</Button>
                                <Row>
                                    <Col>
                                        <Form.Group className="mb-3" controlId="formPointN">
                                            <Form.Label className="mb-1">Współrzędna N</Form.Label>
                                            <Form.Control type="text" value={selectedPoint[0]} onChange={e => handleSelectedPointChange(e, 0)} />
                                        </Form.Group>
                                    </Col>
                                    <Col>
                                        <Form.Group className="mb-3" controlId="formPointE">
                                            <Form.Label className="mb-1">Współrzędna E</Form.Label>
                                            <Form.Control type="text" value={selectedPoint[1]} onChange={e => handleSelectedPointChange(e, 1)} />
                                        </Form.Group>
                                    </Col>
                                </Row>
                                <Form.Group className="mb-3" controlId="formDistance">
                                    <Form.Label className="fw-b">Odległość</Form.Label>
                                    {/* <Form.Control type="text" value={selectedPointDistance} onChange={handleDistanceChange} /> */}
                                    <DistanceRange value={selectedPointDistance} onChange={handleDistanceChange2} />
                                </Form.Group>
                            </Card.Body>
                        </Card>
                        
                    </div>
                </Collapse>
                <Collapse in={locationType === 'place'}>
                    <div>
                        <Form.Label htmlFor="selectedPlaceName">Nazwa miejscowości</Form.Label>
                        <InputGroup>
                            <Form.Control id="selectedPlaceName" value={selectedPlace ? selectedPlace.display_name : ''} readOnly className="bg-light" />
                            <Button variant="primary" onClick={handlePlaceSearchClick}>
                                Szukaj
                            </Button>
                        </InputGroup>
                    {false && selectedPlace &&
                        <>
                            <Card className="d-flex flex-row align-items-center mt-3 mb-3 p-2">
                                <div className="flex-fill">
                                    {selectedPlace.display_name}
                                </div>
                                <CloseButton aria-label="Usuń miejscowość" onClick={handlePlaceDeleteClick} className="ms-2" />
                            </Card>
                        </>
                    }
                    {false && !selectedPlace &&
                        <>
                            <Form.Label htmlFor="formPlaceName">Miejscowość</Form.Label>
                            <InputGroup className="mb-3">
                                <Form.Control id="formPlaceName" value={placeName} onChange={handlePlaceNameChange} />
                                <Button variant="primary" onClick={handlePlaceSearchClick}>
                                    Szukaj
                                </Button>
                            </InputGroup>
                        </>
                    }
                    </div>
                </Collapse>
                <Stack direction="horizontal" className="justify-content-end my-3">
                    <Button variant="primary" type="submit">
                        Szukaj obserwacji
                    </Button>
                </Stack>
            </Form>
        </div>
        
    );
}