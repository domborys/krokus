import ListGroup from 'react-bootstrap/ListGroup';
import Stack from 'react-bootstrap/Stack';
import Dropdown from 'react-bootstrap/Dropdown';
import { useState, useEffect, useContext } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { apiService } from '../services/api';
import ConfirmationPaginatedList from '../components/ConfirmationPaginatedList';
import ConfirmationItem from '../components/ConfirmationItem';
import ConfirmDelete from '../components/ConfirmDelete';
import PanelHeader from '../components/PanelHeader';
import Badge from 'react-bootstrap/Badge';
import { Link } from "react-router-dom";
import Button from 'react-bootstrap/Button';
import { UserContext } from '../services/contexts';

/**
 * Left panel showing a single observation and its confirmations.
 */
export default function Observation() {
    const navigate = useNavigate();
    const [observation, setObservation] = useState(null);
    const [confirmations, setConfirmations] = useState(null);
    const { id } = useParams();
    const { currentUser } = useContext(UserContext);
    const [isObservationDelete, setObservationDelete] = useState(false);
    const canEdit = currentUser && observation && (currentUser.id === observation.userId || currentUser.role === 'Admin' || currentUser.role === 'Moderator');

    useEffect(() => {
        apiService.getObservation(id)
            .then(observation => {
                setObservation(observation);
            });
        getConfirmations(1);
    }, [id]);

    async function getConfirmations(page = 1) {
        const params = {
            observationId: id,
            pageIndex: page,
        }
        const confirmations = await apiService.getConfirmations(params);
        setConfirmations(confirmations);
    }
    
    function handleDeleteObservationClick() {
        setObservationDelete(true);
    }
    async function handleDeleteConfirm() {
        await apiService.deleteObservation(observation.id);
        setObservationDelete(false);
        navigate('/map');
    }
    function handleDeleteCancel() {
        setObservationDelete(false);
    }
    function handleConfirmationDeleted(confirmationId) {
        const newConfirmations = confirmations.filter(c => c.id !== confirmationId);
        setConfirmations(newConfirmations);
    }
    const tags = observation && observation.tags.map(tag => <Badge bg="secondary" key={tag.name} className="me-1 p-2">{tag.name}</Badge>);
    const confirmationItems = confirmations && confirmations.items.map(conf => <ConfirmationItem key={conf.id} confirmation={conf} onConfirmationDeleted={handleConfirmationDeleted} />)
    return (observation &&
        <>
        <PanelHeader>{observation.title}</PanelHeader>
        <Stack direction="horizontal" className="flex-wrap">
            <div className="flex-fill">
                <div>
                    <h2 className="h6 mb-0">Współrzędne</h2>
                    <div>{observation.location[0].toFixed(6)}, {observation.location[1].toFixed(6)}</div>
                </div>
                <div className="mt-2 mb-3">
                    {tags}
                </div>
            </div>
            <div>
                {canEdit &&
                    <Dropdown>
                        <Dropdown.Toggle variant="outline-secondary">
                            Opcje
                        </Dropdown.Toggle>
                        <Dropdown.Menu>
                            <Dropdown.Item as={Link} to={`/map/observations-edit/${observation.id}`}>Edytuj</Dropdown.Item>
                            <Dropdown.Item onClick={handleDeleteObservationClick}>Usuń</Dropdown.Item>
                        </Dropdown.Menu>
                    </Dropdown>
                }
                <ConfirmDelete show={isObservationDelete} onDelete={handleDeleteConfirm} onCancel={handleDeleteCancel}>
                    Czy na pewno chcesz usunąć obserwację <b>{observation.title}?</b>
                </ConfirmDelete>
            </div>
        </Stack>
        
            
            <div className="border-top">
            <h2 className="h5 mt-2 mb-0">Potwierdzenia</h2>
            <Stack direction="horizontal" className="my-3">
                <Button type="button" as={Link} to={`/map/confirmations-add?observationId=${observation.id}`}>
                    Dodaj potwierdzenie
                </Button>
            </Stack>

            <ConfirmationPaginatedList confirmations={confirmations} onPageChange={getConfirmations} />
            </div>
            
        </>

    );
}