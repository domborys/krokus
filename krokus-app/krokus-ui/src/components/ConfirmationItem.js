import ListGroup from 'react-bootstrap/ListGroup';
import PictureTiles from './PictureTiles';
import Dropdown from 'react-bootstrap/Dropdown';
import { useState, useContext } from 'react';
import { apiService } from '../services/api';
import ConfirmDelete from '../components/ConfirmDelete';
import { Link } from "react-router-dom";
import { UserContext } from '../services/contexts';
import { formatDatetime } from '../services/utils';

/**
 * A single confirmation item.
 */
export default function ConfirmationItem({ confirmation, onConfirmationDeleted = () => { } }) {
    const { currentUser } = useContext(UserContext);
    const [isConfirmationDelete, setConfirmationDelete] = useState(false);
    const arePictures = confirmation.pictures.length > 0;
    const canEdit = currentUser && confirmation && (currentUser.id === confirmation.userId || currentUser.role === 'Admin' || currentUser.role === 'Moderator');
    function handleDeleteClick() {
        setConfirmationDelete(true);
    }
    async function handleDeleteConfirm() {
        await apiService.deleteConfirmation(confirmation.id);
        setConfirmationDelete(false);
        onConfirmationDeleted(confirmation.id);
    }
    function handleDeleteCancel() {
        setConfirmationDelete(false);
    }
    return (
        <ListGroup.Item>
            <ConfirmDelete show={isConfirmationDelete} onDelete={handleDeleteConfirm} onCancel={handleDeleteCancel}>
                Czy na pewno chcesz usunąć potwierdzenie <b>{confirmation.title}?</b>
            </ConfirmDelete>
            <div className="d-flex mb-2">
                <div>
                    <div className="fw-bold">{confirmation.username}</div>
                    <div className={`${confirmation.isConfirmed ? 'text-success' : 'text-danger'}`}>
                        {confirmation.isConfirmed ? 'Potwierdzam' : 'Nie potwierdzam'}
                    </div>
                </div>
                <div className="ms-auto">{formatDatetime(confirmation.dateTime)}</div>
                {canEdit && 
                    <Dropdown className="ms-2">
                        <Dropdown.Toggle variant="outline-secondary" size="sm" aria-label="Opcje">

                        </Dropdown.Toggle>

                        <Dropdown.Menu>
                            <Dropdown.Item as={Link} to={`/map/confirmations-edit/${confirmation.id}`}>Edytuj</Dropdown.Item>
                            <Dropdown.Item onClick={handleDeleteClick}>Usuń</Dropdown.Item>
                        </Dropdown.Menu>
                    </Dropdown>
                }
            </div>
         
            <p>{confirmation.description}</p>
            {arePictures && <PictureTiles pictures={confirmation.pictures} /> }
        </ListGroup.Item>
    );
}