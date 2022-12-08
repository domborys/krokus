import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import { useState } from 'react';
import Badge from 'react-bootstrap/Badge';
import TagInput from '../components/TagInput';

export default function ObservationSearch({onSubmit}) {
    const [title, setTitle] = useState('');
    const [tags, setTags] = useState([]);

    function handleTitleChange(e) {
        setTitle(e.target.value);
    }
    function handleTagsChange(newTags) {
        setTags(newTags);
    }
    function handleSubmit(e) {
        e.preventDefault();
        const params = {
            title,
            tags,
        };
        onSubmit(params);
        
    }
    return (
        <div>
            <h2>Szukaj obserwacji</h2>
            <Form onSubmit={handleSubmit} action="#">
                <Form.Group className="mb-3" controlId="formObservationTitle">
                    <Form.Label>Tytuł</Form.Label>
                    <Form.Control type="text" value={title} onChange={handleTitleChange} />
                </Form.Group>
                <TagInput label="Tagi" onTagsChange={handleTagsChange} />
                <Button variant="primary" type="submit">
                    Szukaj
                </Button>
            </Form>
        </div>
        
    );
}