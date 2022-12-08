import ListGroup from 'react-bootstrap/ListGroup';
import CloseButton from 'react-bootstrap/CloseButton';
import { useNavigate } from 'react-router-dom';
export default function ObservationList({ observations }) {
    const navigate = useNavigate();
    const items = observations.items.map(obs => 
        <ListGroup.Item key={obs.id}>
            {obs.title}
        </ListGroup.Item>
    );
    function handleCloseButtonClick(e) {
        navigate('/map');
    }
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