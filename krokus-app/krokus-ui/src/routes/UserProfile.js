import Container from 'react-bootstrap/Container';
import Button from 'react-bootstrap/Button';
import Alert from 'react-bootstrap/Alert';
import ListGroup from 'react-bootstrap/ListGroup';
import ObservationPaginatedList from '../components/ObservationPaginatedList';
import ConfirmationPaginatedList from '../components/ConfirmationPaginatedList';
import RoleChangeModal from '../components/RoleChangeModal';
import { useState, useEffect, useMemo, useContext } from 'react';
import { useParams, Link } from 'react-router-dom'
import { apiService } from '../services/api';
import { UserContext } from '../services/contexts';
import { rolePrettyName } from '../services/utils';
export default function UserProfile() {
    const { currentUser } = useContext(UserContext);
    const [user, setUser] = useState(null);
    const [isRoleChange, setRoleChange] = useState(false);
    const { id } = useParams();

    async function getUser() {
        const newUser = await apiService.getUser(id);
        setUser(newUser);
    }

    useEffect(() => {
        getUser();
        
    }, [id]);

    const observationParams = useMemo(() => ({ userId: id }), [id]);

    function handleRoleChangeClick() {
        setRoleChange(true);
    }

    async function handleModalHide() {
        setRoleChange(false);
        await getUser();
    }

    const contentSuccess = user && <>
        <h2>{user.username}</h2>
        <div>Rola: {rolePrettyName(user.role)}</div>
        {currentUser.role === 'Admin' && <Button type="button" onClick={handleRoleChangeClick}>Ustaw rolę</Button>}
        <h3>Obserwacje</h3>
        <ObservationPaginatedList params={observationParams} />
        <h3>Potwierdzenia</h3>
        <ConfirmationPaginatedList params={observationParams} />
    </>
    return (
        <Container className="mt-5">
            {contentSuccess}
            <RoleChangeModal user={user} show={isRoleChange} onHide={handleModalHide} />
        </Container>
    );
}