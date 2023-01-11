import Container from 'react-bootstrap/Container';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';
import { useState } from 'react';
import UserPaginatedList from '../components/UserPaginatedList';
export default function UserProfile() {
    const [username, setUsername] = useState('');
    const [searchParams, setSearchParams] = useState({});

    async function searchUsers() {
        const params = {};
        if (username.trim() !== '') {
            params.username = username;
        }
        setSearchParams(params);
    }

    function handleUsernameChange(e) {
        setUsername(e.target.value);
    }

    return (
        <Container className="mt-5">
            <h2>Szukaj użytkownika</h2>
            <Form.Label htmlFor="formUsername">Nazwa użytkownika</Form.Label>
            <InputGroup className="mb-3">
                <Form.Control id="formUsername" value={username} onChange={handleUsernameChange} />
                <Button variant="primary" onClick={searchUsers}>
                    Szukaj
                </Button>
            </InputGroup>
            <UserPaginatedList params={searchParams} />
        </Container>
    );
}