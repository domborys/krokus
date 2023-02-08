import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import { useState } from 'react';
import { apiService } from '../services/api';
/**
 * Modal for setting user's role.
 */
export default function RoleChangeModal({ user, show, onHide = () => { } }) {
    const [role, setRole] = useState(user?.role);
    const [prevRole, setPrevRole] = useState(user?.role);

    if (user && user.role !== prevRole) {
        setPrevRole(user.role);
        setRole(user.role);
    }

    function handleRoleChange(e) {
        setRole(e.currentTarget.value);
    }

    function handleClose() {
        setRole(user?.role);
        onHide();
    }

    async function handleSave() {
        await apiService.putUserRole(user.id, role);
        onHide();
    }

    return (
        <Modal show={show} onHide={handleClose}>
            <Modal.Header closeButton>
                <Modal.Title>Zmiana roli</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form.Select aria-label="Wybierz rolę użytkownika" value={role} onChange={handleRoleChange}>
                    <option value="User">Użytkownik</option>
                    <option value="Moderator">Moderator</option>
                    <option value="Admin">Administrator</option>
                </Form.Select>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={handleClose}>
                    Anuluj
                </Button>
                <Button variant="primary" onClick={handleSave}>
                    Zapisz
                </Button>
            </Modal.Footer>
        </Modal>);
}