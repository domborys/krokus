import ListGroup from 'react-bootstrap/ListGroup';
import CloseButton from 'react-bootstrap/CloseButton';
import { useNavigate } from 'react-router-dom';
export default function ObservationList({ observations }) {
    const navigate = useNavigate();
    
    function handleObservationClick(observationId) {
        const id = parseInt(observationId);
        navigate(`/map/observations/${id}`);
    }
    function handleCloseButtonClick(e) {
        navigate('/map');
    }

    const items = observations.items.map(obs =>
        <ListGroup.Item action key={obs.id} onClick={e => handleObservationClick(obs.id, e)}>
            {obs.title}
        </ListGroup.Item>
    );
    return (
        <>
            <div className="d-flex align-items-center mt-2 mb-2 border-bottom">
                <h2>Wyniki</h2>
                <CloseButton aria-label="Zamknij wyniki" onClick={handleCloseButtonClick} className="ms-auto" />
            </div>
            <ListGroup>
                {items}
            </ListGroup>   
        </>
         
    );
}