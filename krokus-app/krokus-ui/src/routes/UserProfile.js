import Container from 'react-bootstrap/Container';
import Button from 'react-bootstrap/Button';
import ObservationPaginatedList from '../components/ObservationPaginatedList';
import ConfirmationPaginatedList from '../components/ConfirmationPaginatedList';
import RoleChangeModal from '../components/RoleChangeModal';
import BanChangeModal from '../components/BanChangeModal';
import { useState, useEffect, useMemo, useContext } from 'react';
import { useParams, Link } from 'react-router-dom'
import { apiService } from '../services/api';
import { UserContext } from '../services/contexts';
import { rolePrettyName, formatDatetime } from '../services/utils';
import { isBefore } from 'date-fns'

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
        <h2>{user.username}</h2>
        <div>Rola: {rolePrettyName(user.role)}</div>
        {currentUser.role === 'Admin' && <Button type="button" onClick={handleRoleChangeClick}>Ustaw rolę</Button>}
        {permanentlyBanned && <div>Zablokowany na stałe</div>}
        {tempBanned && <div>Zablokowany do {formatDatetime(bannedUntilDate)}</div>}
        {modRights && <Button type="button" onClick={handleBanClick}>{banButtonText}</Button>}
        <h3>Obserwacje</h3>
        <ObservationPaginatedList observations={observations} onPageChange={getObservationsPage} />
        <h3>Potwierdzenia</h3>
        <ConfirmationPaginatedList confirmations={confirmations} onPageChange={getConfirmationsPage} />
    </>
    return (
        <Container className="mt-5">
            {contentSuccess}
            <RoleChangeModal user={user} show={isRoleChange} onHide={handleModalHide} />
            <BanChangeModal user={user} show={isBanChange} onHide={handleBanModalHide} />
        </Container>
    );
}