import ListGroup from 'react-bootstrap/ListGroup';
import PictureTiles from './PictureTiles';
export default function ConfirmationItem({ confirmation }) {
    const arePictures = confirmation.pictures.length > 0;
    return (
        <ListGroup.Item>
            <div className="border-bottom d-flex">
                <div className={`${confirmation.isConfirmed ? 'text-success' : 'text-danger'}`}>
                    {confirmation.isConfirmed ? 'Potwierdzam' : 'Nie potwierdzam'}
                </div>
                <div className="ms-auto">{confirmation.dateTime}</div>
            </div>
            <div>{confirmation.username}</div>
            <p>{confirmation.description}</p>
            {arePictures && <PictureTiles pictures={confirmation.pictures} /> }
        </ListGroup.Item>
    );
}