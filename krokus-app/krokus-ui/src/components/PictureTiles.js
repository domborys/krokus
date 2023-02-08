import Row from 'react-bootstrap/Row';
import Container from 'react-bootstrap/Container';
import PictureTile from './PictureTile';

/**
 * A container for picture tiles attached to a confirmation.
 */
export default function PictureTiles({ pictures }) {
    const tiles = pictures.map(picture => <PictureTile key={picture.id} picture={picture} />)
    return (
        <Container fluid>
            <Row xs={2}>
                {tiles}
            </Row>
        </Container>
        
    );
}