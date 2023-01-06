import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import ListGroup from 'react-bootstrap/ListGroup';
import PictureTile from './PictureTile';
import Button from 'react-bootstrap/Button';
export default function RemovablePicture({ picture, onDelete }) {
    function handlePictureDelete() {
        onDelete(picture)
    }
    return (
        <ListGroup.Item>
            <Row xs={2}>
                <PictureTile picture={picture} />
                <Col className="h-100">
                    <Button type="button" variant="danger" onClick={handlePictureDelete}>&ndash;</Button>
                </Col>
            </Row>
        </ListGroup.Item>
    );
}