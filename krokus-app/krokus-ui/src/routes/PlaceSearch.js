import ListGroup from 'react-bootstrap/ListGroup';
import Alert from 'react-bootstrap/Alert';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';
import CloseButton from 'react-bootstrap/CloseButton';
import { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContext } from '../services/contexts';
import { apiService } from '../services/api';
export default function PlaceSearch() {
    const navigate = useNavigate();
    const { selectedPlace, setSelectedPlace, placeName, setPlaceName } = useContext(MapContext);
    const [places, setPlaces] = useState([]);
    const [errorMessage, setErrorMessage] = useState('');
    useEffect(() => {
        loadPlaces()
    }, [])

    async function loadPlaces() {
        try {
            const places = await apiService.getPlace(placeName);
            setPlaces(places);
            setErrorMessage('');
        }
        catch (e) {
            console.error(e);
            setErrorMessage('Wystąpił błąd podczas pobierania miejscowości');
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

    function handleCloseButtonClick(e) {
        navigate('/map');
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
            <div className="d-flex align-items-center mt-2 mb-2 border-bottom">
                <h2>Znalezione miejscowości</h2>
                <CloseButton aria-label="Zamknij wyniki" onClick={handleCloseButtonClick} className="ms-auto" />
            </div>
            <InputGroup className="mb-3">
                <Form.Control id="formPlaceName" value={placeName} onChange={handlePlaceNameChange} aria-label="Miejscowość" />
                <Button variant="primary" onClick={handlePlaceSearchClick}>
                    Szukaj
                </Button>
            </InputGroup>
            {errorMessage && <Alert variant="danger">errorMessage</Alert>}
            <ListGroup>
                {items}
            </ListGroup>
            <Button variant="primary" onClick={handleSelectClick}>
                Wybierz
            </Button>
        </>

    );
}