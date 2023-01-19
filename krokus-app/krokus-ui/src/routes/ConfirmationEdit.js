import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import ListGroup from 'react-bootstrap/ListGroup';
import { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import RemovablePicture from '../components/RemovablePicture';
import { apiService } from '../services/api';
import { useNavigate, useParams } from 'react-router-dom'
import Stack from 'react-bootstrap/Stack';
import PanelHeader from '../components/PanelHeader';
export default function ObservationSearch() {
    const [confirmed, setConfirmed] = useState('');
    const [description, setDescription] = useState('');
    const [observationDate, setObservationDate] = useState(new Date());
    const [oldPictures, setOldPictures] = useState([]);
    const [deletedPictures, setDeletedPictures] = useState([]);
    const [files, setFiles] = useState([]);
    const [observationId, setObservationId] = useState(null);
    const navigate = useNavigate();
    const { id } = useParams();
    const areOldPictures = oldPictures.length > 0;
    useEffect(() => {
        apiService.getConfirmation(id)
            .then(confirmation => {
                setState(confirmation);
            });
    }, [id]);

    function setState(confirmation) {
        setObservationId(confirmation.observationId.toString());
        setConfirmed(confirmation.isConfirmed ? 'yes' : 'no');
        setObservationDate(new Date(confirmation.dateTime));
        setDescription(confirmation.description);
        setOldPictures(confirmation.pictures);
    }

    function handleConfirmedChange(e) {
        if (e.target.checked) {
            setConfirmed(e.target.value);
        }
    }
    async function handleSubmit(e) {
        e.preventDefault();
        const confirmation = {
            id: id,
            observationId: parseInt(observationId),
            isConfirmed: confirmed === 'yes',
            dateTime: observationDate.toISOString(),
            description: description,
        }
        await apiService.putConfirmation(confirmation);
        if (files.length > 0) {
            await apiService.postPictures(id, files);
        }
        const deletePromises = deletedPictures.map(picture => apiService.deletePicture(picture.id));
        await Promise.all(deletePromises);
        navigate(`/map/observations/${observationId}`);
    }
    function handleDescriptionChange(e) {
        setDescription(e.target.value);
    }
    function handlePicturesChange(e) {
        setFiles(Array.from(e.target.files));
    }
    function handlePictureDelete(deletedPicture) {
        const newDeletedPictures = deletedPictures.concat([deletedPicture]);
        setDeletedPictures(newDeletedPictures);
        const updatedOldPictures = oldPictures.filter(p => p.id !== deletedPicture.id);
        setOldPictures(updatedOldPictures);
    }
    function handleCancel() {
        navigate(`/map/observations/${observationId}`);
    }
    const removablePictures = oldPictures.map(picture => <RemovablePicture key={picture.id} picture={picture} onDelete={handlePictureDelete} />);
    return (
        <div>
            <PanelHeader>Edytuj potwierdzenie</PanelHeader>
            <Form onSubmit={handleSubmit} action="#">
                <div className="mb-3">
                    <Form.Check type="radio" name="radioIsConfirmed" id="radioIsConfirmedYes" value="yes" label="Też widziałem obiekt" checked={confirmed === 'yes'} onChange={handleConfirmedChange} />
                    <Form.Check type="radio" name="radioIsConfirmed" id="radioIsConfirmedNo" value="no" label="Nie widziałem obiektu" checked={confirmed === 'no'} onChange={handleConfirmedChange} />
                </div>
                <Form.Group className="mb-3" controlId="observationDate">
                    <Form.Label>Data {confirmed === 'no' && 'próby'} obserwacji</Form.Label>
                    <DatePicker
                        selected={observationDate}
                        onChange={(date) => setObservationDate(date)}
                        timeInputLabel="Godzina:"
                        dateFormat="dd.MM.yyyy HH:mm"
                        showTimeInput
                        locale="pl"
                        className="form-control"
                    />
                </Form.Group>

                <Form.Group className="mb-3" controlId="formObservationDescription">
                    <Form.Label>Opis</Form.Label>
                    <Form.Control as="textarea" rows={4} value={description} onChange={handleDescriptionChange} />
                </Form.Group>
                {areOldPictures && 
                    <div>
                        <h3>Zdjęcia</h3>
                        <ListGroup>
                            {removablePictures}
                        </ListGroup>
                    </div>
                }
                <Form.Group controlId="formPictures" className="mb-3">
                    <Form.Label>Dodaj zdjęcia</Form.Label>
                    <Form.Control type="file" multiple onChange={handlePicturesChange} />
                </Form.Group>
                <Stack direction="horizontal" gap={2}>
                    <Button variant="secondary" type="button" onClick={handleCancel}>
                        Anuluj
                    </Button>
                    <Button variant="primary" type="submit" className="ms-auto">
                        Zapisz
                    </Button>
                </Stack>
            </Form>
        </div>

    );
}