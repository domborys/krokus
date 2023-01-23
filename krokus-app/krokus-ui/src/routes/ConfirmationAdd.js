import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Stack from 'react-bootstrap/Stack';
import PanelHeader from '../components/PanelHeader';
import { useState, useContext} from 'react';
import DatePicker from 'react-datepicker';
import { UserContext } from '../services/contexts';
import { apiService } from '../services/api';
import { useNavigate, useSearchParams } from 'react-router-dom'
export default function ObservationSearch() {
    const [confirmed, setConfirmed] = useState('yes');
    const [description, setDescription] = useState('');
    const [observationDate, setObservationDate] = useState(new Date());
    const [files, setFiles] = useState([]);
    const { currentUser } = useContext(UserContext);
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();

    function handleConfirmedChange(e) {
        if (e.target.checked) {
            setConfirmed(e.target.value);
        }
    }
    async function handleSubmit(e) {
        e.preventDefault();
        const observationId = parseInt(searchParams.get('observationId'));
        const confirmation = {
            observationId,
            isConfirmed: confirmed === 'yes',
            dateTime: observationDate.toISOString(),
            description: description,
            userId: currentUser.id
        }
        const savedConfirmation = await apiService.postConfirmation(confirmation);
        if (files.length > 0) {
            await apiService.postPictures(savedConfirmation.id, files);
        }
        navigate(`/map/observations/${observationId}`);
    }
    function handleDescriptionChange(e) {
        setDescription(e.target.value);
    }
    function handlePicturesChange(e) {
        setFiles(Array.from(e.target.files));
    }
    function handleCancel() {
        navigate(-1);
    }
    return (
        <div>
            <PanelHeader>Dodaj potwierdzenie</PanelHeader>
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
                <Form.Group controlId="formPictures" className="mb-3">
                    <Form.Label>Zdjęcia</Form.Label>
                    <Form.Control type="file" multiple onChange={handlePicturesChange} />
                </Form.Group>
                <Stack direction="horizontal">
                    <Button variant="secondary" type="button" onClick={handleCancel}>
                        Anuluj
                    </Button>
                    <Button variant="primary" type="submit" className="ms-auto">
                        Dodaj
                    </Button>
                </Stack>
            </Form>
        </div>

    );
}