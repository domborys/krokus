import Container from 'react-bootstrap/Container';
import Button from 'react-bootstrap/Button';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import ObservationPaginatedList from '../components/ObservationPaginatedList';
import ConfirmationPaginatedList from '../components/ConfirmationPaginatedList';
import RoleChangeModal from '../components/RoleChangeModal';
import BanChangeModal from '../components/BanChangeModal';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Card from 'react-bootstrap/Card';
import Stack from 'react-bootstrap/Stack';
import { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom'
import { apiService } from '../services/api';
import { UserContext } from '../services/contexts';
import { rolePrettyName, formatDatetime } from '../services/utils';
import { isBefore } from 'date-fns'

/**
 * Page showing user's profile.
 */
export default function UserProfile() {
    const { currentUser } = useContext(UserContext);
    const [user, setUser] = useState(null);
    const [isRoleChange, setRoleChange] = useState(false);
    const [isBanChange, setBanChange] = useState(false);
    const [observations, setObservations] = useState(null);
    const [confirmations, setConfirmations] = useState(null);
    const { id } = useParams();
    const permanentlyBanned = user && user.permanentlyBanned;
    const bannedUntilDate = user?.bannedUntil ? new Date(user.bannedUntil) : null;
    const tempBanned = bannedUntilDate && isBefore(new Date(), bannedUntilDate);
    const modRights = currentUser.role === 'Admin' || currentUser.role === 'Moderator';

    async function getObservationsPage(pageNumber) {
        const paramsWithPage = {
            pageIndex: pageNumber,
            userId: id,
        }
        const obs = await apiService.getObservations(paramsWithPage);
        setObservations(obs);
    }

    async function getConfirmationsPage(pageNumber) {
        const paramsWithPage = {
            pageIndex: pageNumber,
            userId: id,
        }
        const obs = await apiService.getConfirmations(paramsWithPage);
        setConfirmations(obs);
    }

    async function getUser() {
        const newUser = await apiService.getUser(id);
        setUser(newUser);
    }

    useEffect(() => {
        getUser();
        getObservationsPage(1);
        getConfirmationsPage(1);
    }, [id]);

    function handleRoleChangeClick() {
        setRoleChange(true);
    }

    async function handleModalHide() {
        setRoleChange(false);
        await getUser();
    }

    async function handleBanModalHide() {
        setBanChange(false);
        await getUser();
    }

    function handleBanClick() {
        setBanChange(true);
    }

    const banButtonText = permanentlyBanned || tempBanned ? 'Zmień blokadę' : 'Zablokuj';

    const contentSuccess = user && <>
        <h1 className="h2">{user.username}</h1>
        <Card className="my-2">
            <Card.Body>
                <Stack direction="horizontal" gap={2} className="flex-wrap">
                    <div>
                        <div><b>Rola:</b> {rolePrettyName(user.role)}</div>
                        {permanentlyBanned && <div className="text-danger">Zablokowany na stałe</div>}
                        {tempBanned && <div className="text-danger">Zablokowany do {formatDatetime(bannedUntilDate)}</div>}
                    </div>
                    <div className="ms-auto">
                        <ButtonGroup>
                            {currentUser.role === 'Admin' && <Button type="button" onClick={handleRoleChangeClick}>Ustaw rolę</Button>}
                            {modRights && <Button type="button" onClick={handleBanClick}>{banButtonText}</Button>}
                        </ButtonGroup>
                    </div>
                </Stack>
            </Card.Body>
        </Card>
        
        <Row>
            <Col md>
                <h2 className="h3 my-3">Obserwacje</h2>
                <ObservationPaginatedList observations={observations} onPageChange={getObservationsPage} />
            </Col>
            <Col md>
                <h2 className="h3 my-3">Potwierdzenia</h2>
                <ConfirmationPaginatedList confirmations={confirmations} onPageChange={getConfirmationsPage} />
            </Col>
        </Row>
    </>
    return (
        <Container className="mt-5">
            {contentSuccess}
            <RoleChangeModal user={user} show={isRoleChange} onHide={handleModalHide} />
            <BanChangeModal user={user} show={isBanChange} onHide={handleBanModalHide} />
        </Container>
    );
}