import Col from 'react-bootstrap/Col';
import { apiService } from '../services/api';
import { useState } from 'react';
import Modal from 'react-bootstrap/Modal';

/**
 * A single tile with a picture which may be enlarged.
 */
export default function PictureTiles({ picture }) {
    const pictureUrl = apiService.getPictureUrl(picture.id);
    const [isEnlarged, setEnlarged] = useState(false);
    function enlargePicture() {
        setEnlarged(true);
    }
    function handleClose() {
        setEnlarged(false);
    }
    return (
        <Col className="p-1">
            <button type="button" className="tile-picture-button ratio ratio-1x1">
                <img src={pictureUrl} className="tile-picture" onClick={enlargePicture} />
            </button>
            <Modal show={isEnlarged} onHide={handleClose} centered size="lg" fullscreen="md-down">
                <Modal.Header closeButton></Modal.Header>
                <Modal.Body className="text-center">
                    <img src={pictureUrl} className="enlarged-picture" />
                </Modal.Body>
            </Modal>
        </Col>
    );
} 