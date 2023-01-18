import ListGroup from 'react-bootstrap/ListGroup';
import CloseButton from 'react-bootstrap/CloseButton';
import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContext } from '../services/contexts';
import PanelHeader from '../components/PanelHeader';
export default function ObservationList({ observations }) {
    const navigate = useNavigate();
    const { setFocusedObservationId } = useContext(MapContext);

    function handleObservationClick(observationId) {
        const id = parseInt(observationId);
        setFocusedObservationId(id);
        navigate(`/map/observations/${id}`);
    }

    const items = observations.items.map(obs =>
        <ListGroup.Item action key={obs.id} onClick={e => handleObservationClick(obs.id, e)}>
            {obs.title}
        </ListGroup.Item>
    );
    return (
        <>
            <PanelHeader>Wyniki</PanelHeader>
            <ListGroup>
                {items}
            </ListGroup>   
        </>
         
    );
}