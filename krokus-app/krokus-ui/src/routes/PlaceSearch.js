import ListGroup from 'react-bootstrap/ListGroup';
import Alert from 'react-bootstrap/Alert';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';
import Stack from 'react-bootstrap/Stack';
import { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContext } from '../services/contexts';
import { apiService } from '../services/api';
import PanelHeader from '../components/PanelHeader';
export default function PlaceSearch() {
    const navigate = useNavigate();
    const { selectedPlace, setSelectedPlace, placeName, setPlaceName } = useContext(MapContext);
    const [prevPlace, setPrevPlace] = useState(selectedPlace);
    const [places, setPlaces] = useState([]);
    const [errorMessage, setErrorMessage] = useState('');
    const [noPlacesFound, setNoPlacesFound] = useState(false);
    const anyPlaceSelected = selectedPlace && places.some(p => p.place_id === selectedPlace.place_id);

    async function loadPlaces() {
        try {
            const places = await apiService.getPlace(placeName);
            setPlaces(places);
            setErrorMessage('');
            const noPlaces = places.length === 0;
            setNoPlacesFound(noPlaces);
        }
        catch (e) {
            console.error(e);
            setErrorMessage('Wystąpił błąd podczas pobierania miejscowości.');
        }
    }
    function handlePlaceClick(place) {
        setSelectedPlace(place);
    }

    async function handlePlaceSearchClick(){
        await loadPlaces();
    }

    function handlePlaceNameChange(e) {
        setPlaceName(e.target.value);
    }

    function handleBackClick() {
        setSelectedPlace(prevPlace);
        navigate(-1);
    }

    function handleSelectClick(){
        navigate('/map');
    }
    const items = places.map(place =>
        <ListGroup.Item action active={selectedPlace && selectedPlace.place_id === place.place_id} key={place.place_id} onClick={e => handlePlaceClick(place, e)}>
            {place.display_name}
        </ListGroup.Item>
    );
    return (
        <>
            <PanelHeader>Wyszukiwanie miejscowości</PanelHeader>
            <Form.Label htmlFor="formPlaceName">Nazwa miejscowości</Form.Label>
            <InputGroup className="mb-3">
                <Form.Control id="formPlaceName" value={placeName} onChange={handlePlaceNameChange} aria-label="Miejscowość" />
                <Button variant="primary" onClick={handlePlaceSearchClick}>
                    Szukaj
                </Button>
            </InputGroup>
            {errorMessage && <Alert variant="danger">errorMessage</Alert>}
            {noPlacesFound && <div>Nie znaleziono miejscowości.</div> }
            <ListGroup>
                {items}
            </ListGroup>
            
                <Stack direction="horizontal" className="my-3">
                    <Button variant="secondary" onClick={handleBackClick}>
                        Powrót
                </Button>
                {anyPlaceSelected &&
                    <Button variant="primary" className="ms-auto" onClick={handleSelectClick}>
                        Wybierz
                    </Button>}
                </Stack>
            
        </>

    );
}