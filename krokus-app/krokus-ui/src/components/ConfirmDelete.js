import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';

/**
 * Modal for confirming deleting something.
 */
export default function ConfirmDelete({ show, children, onDelete = () => { }, onCancel = () => { } }) {
    function handleClose() {
        onCancel();
    }
    function handleDelete() {
        onDelete();
    }
    return (
        <Modal show={show} onHide={handleClose}>
            <Modal.Header closeButton>
                <Modal.Title>Potwierdzenie</Modal.Title>
            </Modal.Header>
            <Modal.Body>{children}</Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={handleClose}>
                    Anuluj
                </Button>
                <Button variant="danger" onClick={handleDelete}>
                    Usuń
                </Button>
            </Modal.Footer>
        </Modal>    
    );
}