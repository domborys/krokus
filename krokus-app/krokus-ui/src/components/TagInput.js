import { useState, useEffect } from 'react';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Badge from 'react-bootstrap/Badge';
import CloseButton from 'react-bootstrap/CloseButton';
import InputGroup from 'react-bootstrap/InputGroup';
import ListGroup from 'react-bootstrap/ListGroup';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Popover from 'react-bootstrap/Popover';
import { apiService } from '../services/api';
const emptyTags = [];

export default function TagInput({ initialTags = emptyTags, label, onTagsChange = () => { } }) {
    const [tags, setTags] = useState(initialTags);
    const [prevTagsProp, setPrevTagsProp] = useState(initialTags);
    const [typedTag, setTypedTag] = useState('');
    const [suggestedTags, setSuggestedTags] = useState([]);
    const [suggestionsWantToShow, setSuggestionsWantToShow] = useState(false)

    const suggestionsShown = suggestionsWantToShow && suggestedTags.length > 0;
    if (initialTags !== prevTagsProp) {
        setTags(initialTags);
        setPrevTagsProp(initialTags);
    }

    useEffect(() => {
        getSuggestions(typedTag);
    }, [typedTag]);

    function handleTypedTagChange(e) {
        setTypedTag(e.target.value);
    }
    function addTag(e) {
        const cleanedTag = cleanTag(typedTag);
        if (!tags.includes(cleanedTag)) {
            const newTags = tags.concat(cleanedTag);
            setTags(newTags);
            setTypedTag('');
            onTagsChange(newTags);
        }
    }
    function addSuggestedTag(tag) {
        const cleanedTag = cleanTag(tag);
        if (!tags.includes(cleanedTag)) {
            const newTags = tags.concat(cleanedTag);
            setTags(newTags);
            setTypedTag('');
            onTagsChange(newTags);
        }
    }
    function removeTag(removedTag, e) {
        const newTags = tags.filter(tag => tag !== removedTag);
        setTags(newTags);
        onTagsChange(newTags);
    }

    function handleSuggestionsToggle(nextShow) {
        setSuggestionsWantToShow(nextShow);
    }

    async function getSuggestions(initialName) {
        const minNameLength = 3;
        if (initialName.length >= minNameLength) {
            const params = { name: initialName };
            const newSuggestions = await apiService.getTags(params);
            if (initialName === typedTag) {
                const tagNames = newSuggestions.items.map(tag => tag.name).filter(tag => !tags.includes(tag));
                setSuggestedTags(tagNames);
            }
        }
        else {
            setSuggestedTags([]);
        }
    }

    const suggestionList = suggestedTags.map(tag => <ListGroup.Item action key={tag} onClick={e => addSuggestedTag(tag)}>{tag}</ListGroup.Item>);

    const tagSuggestionsPopover = (
        <Popover id="popover-tag-list">
            <Popover.Body className="p-0" style={{ borderRadius: 'inherit' }}>
                <ListGroup variant="flush" style={{ borderRadius: 'inherit' }}>
                    {suggestionList}
                </ListGroup>
            </Popover.Body>
        </Popover>
    );

    const tagElements = tags.map(tag =>
        <Badge bg="secondary" key={tag} className="me-1 align-middle">
            <span>{tag}</span>
            <CloseButton variant="white" aria-label="Remove tag" onClick={e => removeTag(tag, e) } className="ms-2" />
        </Badge>
    );
    return (
        <Form.Group className="mb-3" controlId="formTags">
            <Form.Label>{label}</Form.Label>
            <div>
                {tagElements}
            </div>
            
            <InputGroup className="mt-1">
                <OverlayTrigger trigger="focus" placement="bottom" show={suggestionsShown} onToggle={handleSuggestionsToggle} overlay={tagSuggestionsPopover}>
                    <Form.Control value={typedTag} onChange={handleTypedTagChange} autoComplete="off" />
                </OverlayTrigger>
                <Button variant="primary" onClick={addTag}>
                    Dodaj
                </Button>
            </InputGroup>
        </Form.Group>    
    );
}

function cleanTag(tag) {
    return tag.toLowerCase().trim();
}