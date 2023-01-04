import ListGroup from 'react-bootstrap/ListGroup';
import CloseButton from 'react-bootstrap/CloseButton';
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { apiService } from '../services/api';
import ConfirmationItem from '../components/ConfirmationItem';
import Badge from 'react-bootstrap/Badge';
import { Link } from "react-router-dom";
import Button from 'react-bootstrap/Button';
export default function Observation() {
    const navigate = useNavigate();
    const [observation, setObservation] = useState(null);
    const [confirmations, setConfirmations] = useState(null);
    const { id } = useParams();

    useEffect(() => {
        apiService.getObservation(id)
            .then(observation => {
                setObservation(observation);
            });
        apiService.getConfirmationsOfObservation(id)
            .then(confirmations => {
                console.log(confirmations);
                setConfirmations(confirmations);
            })
    }, [id]);

    function handleCloseButtonClick(e) {
        navigate('/map/results');
    }
    const tags = observation && observation.tags.map(tag => <Badge bg="secondary" key={tag.name} className="me-1">{tag.name}</Badge>);
    const confirmationItems = confirmations && confirmations.items.map(conf => <ConfirmationItem key={conf.id} confirmation={conf } />)
    return (observation &&
        <>
            <div className="d-flex align-items-center mt-2 mb-2 border-bottom">
                <h2>{observation.title}</h2>
                <CloseButton aria-label="Zamknij obserwację" onClick={handleCloseButtonClick} className="ms-auto" />
            </div>
            <div>
                <h5>Współrzędne</h5>
            <div>N: {observation.location[0].toFixed(6)}, E: {observation.location[1].toFixed(6)}</div>
            </div>
            <div>
                <h5>Tagi</h5>
                <div>{tags}</div>
            </div>
            <div>
            <h5>Potwierdzenia</h5>
            <Button type="button" as={Link} to={`/map/confirmations-add?observationId=${observation.id}`}>
                Dodaj
            </Button>
                <ListGroup>
                    {confirmationItems}
                </ListGroup>
            </div>
            
        </>

    );
}