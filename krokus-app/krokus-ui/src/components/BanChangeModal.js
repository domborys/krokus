import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Collapse from 'react-bootstrap/Collapse';
import { useState } from 'react';
import { apiService } from '../services/api';
import { add } from 'date-fns'

/*
 * Modal for setting user ban.
 */
export default function BanChangeModal({ user, show, onHide = () => { } }) {
    const [banType, setBanType] = useState('unban');
    const [banDuration, setBanDuration] = useState('');
    const [validated, setValidated] = useState(false);
    const banDurationValid = banType !== 'temp' || !isNaN(parseInt(banDuration));
    function handleClose() {
        onHide();
    }

    async function handleSave() {
        if (!validate()) {
            return;
        }
        try {
            await trySaveBan();
            onHide();
        }
        catch (error) {
            console.error(error);
        }
    }

    function validate() {
        setValidated(true);
        return banDurationValid;
    }

    async function trySaveBan() {
        const banData = {
            permanentlyBanned: banType === 'perm',
            bannedUntil: getBannedUntil(),
        };
        await apiService.putUserBan(user.id, banData);
    }

    function getBannedUntil() {
        if (banType === 'temp') {
            const banDurationDays = parseInt(banDuration);
            const banEndDate = add(new Date(), { days: banDurationDays }).toISOString();
            return banEndDate;
        }
        else {
            return null;
        }
    }

    function handleBanChange(e) {
        if (e.target.checked) {
            setBanType(e.target.value);
        }
    }

    function handleBanDurationChange(e) {
        setBanDuration(e.target.value);
    }

    const banTypes = [
        { name: 'unban', displayName: 'Odblokuj' },
        { name: 'temp', displayName: 'Zablokuj na okres' },
        { name: 'perm', displayName: 'Zablokuj na stałe' },
    ];

    const banRadios = banTypes.map(({ name, displayName }) =>
        <Form.Check key={name} type="radio" id={`banType${name}`} name="banType" label={displayName} value={name} checked={banType === name} onChange={handleBanChange} />
    );

    return (
        <Modal show={show} onHide={handleClose}>
            <Modal.Header closeButton>
                <Modal.Title>Blokada użytkownika</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <div>
                    {banRadios}
                </div>
                <Collapse in={banType === 'temp'}>
                    <div>
                        <Form.Group className="mb-3" controlId="banDurationInput">
                            <Form.Label>Czas blokady w dniach</Form.Label>
                            <Form.Control type="text" value={banDuration} isInvalid={validated && !banDurationValid} onChange={handleBanDurationChange} />
                            <Form.Control.Feedback type="invalid">Czas blokady powinien być liczbą całkowitą.</Form.Control.Feedback>
                        </Form.Group>
                    </div>
                </Collapse>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={handleClose}>
                    Anuluj
                </Button>
                <Button variant="primary" onClick={handleSave}>
                    Zatwierdź
                </Button>
            </Modal.Footer>
        </Modal>);
}