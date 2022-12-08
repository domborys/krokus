import { useState } from 'react';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Badge from 'react-bootstrap/Badge';
import CloseButton from 'react-bootstrap/CloseButton';

export default function TagInput({ initialTags = [], label, onTagsChange = () => { } }) {
    const [tags, setTags] = useState(initialTags);
    const [typedTag, setTypedTag] = useState('');
    function handleTypedTagChange(e) {
        setTypedTag(e.target.value);
    }
    function addTag(e) {
        const cleanedTag = cleanTag(typedTag);
        if (!tags.includes(cleanedTag)) {
            const newTags = tags.concat(cleanedTag);
            setTags(newTags);
            setTypedTag('');
            console.log(newTags);
            onTagsChange(newTags);
        }
    }
    function removeTag(removedTag, e) {
        const newTags = tags.filter(tag => tag !== removedTag);
        setTags(newTags);
        onTagsChange(newTags);
    }
    const tagElements = tags.map(tag =>
        <Badge bg="secondary" key={tag} className="me-1 align-middle">
            {tag}
            <CloseButton variant="white" aria-label="Remove tag" onClick={e => removeTag(tag, e) } className="ms-2" />
        </Badge>
    );
    return (
        <Form.Group className="mb-3" controlId="formTags">
            <Form.Label>{label}</Form.Label>
            <div>
                {tagElements}
            </div>
            <div className="d-flex mt-2">
                <Form.Control type="text" value={typedTag} onChange={handleTypedTagChange} className="flex-fill" />
                <Button type="Button" onClick={addTag} className="ms-2">Dodaj</Button>
            </div>
        </Form.Group>    
    );
}

function cleanTag(tag) {
    return tag.toLowerCase().trim();
}