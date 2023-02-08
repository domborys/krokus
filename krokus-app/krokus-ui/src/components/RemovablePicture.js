import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import ListGroup from 'react-bootstrap/ListGroup';
import PictureTile from './PictureTile';
import Button from 'react-bootstrap/Button';
/**
 * A row with a picture and delete button.
 */
export default function RemovablePicture({ picture, onDelete }) {
    function handlePictureDelete() {
        onDelete(picture)
    }
    return (
        <ListGroup.Item>
            <Row xs={2}>
                <PictureTile picture={picture} />
                <Col className="align-self-stretch d-flex justify-content-center align-items-center">
                    <Button type="button" variant="danger" onClick={handlePictureDelete}>Usuń</Button>
                </Col>
            </Row>
        </ListGroup.Item>
    );
}