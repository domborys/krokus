import ListGroup from 'react-bootstrap/ListGroup';
import CloseButton from 'react-bootstrap/CloseButton';
import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContext } from '../services/contexts';
import PanelHeader from '../components/PanelHeader';
import ObservationPaginatedList from '../components/ObservationPaginatedList';

/**
 * A list of observations with clickable items.
 */
export default function ObservationList({ observations }) {
    const navigate = useNavigate();
    const { setFocusedObservationId, reloadObservations } = useContext(MapContext);

    function handleObservationClick(observationId) {
        const id = parseInt(observationId);
        setFocusedObservationId(id);
    }

    return (
        <>
            <PanelHeader>Wyniki</PanelHeader>
            <ObservationPaginatedList observations={observations} onPageChange={reloadObservations} onObservationClick={handleObservationClick} />
        </>
         
    );
}