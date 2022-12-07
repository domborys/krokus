import Container from 'react-bootstrap/Container';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom'
import { apiService } from '../services/api';
import { UserContext } from '../services/contexts';
export default function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [errorText, setErrorText] = useState(null);
    const { currentUser, setCurrentUser } = useContext(UserContext);
    const navigate = useNavigate();

    function handleUserChange(e) {
        setUsername(e.target.value);
    }

    function handlePasswordChange(e) {
        setPassword(e.target.value);
    }

    async function handleSubmit(e) {
        e.preventDefault();
        const credentials = {
            username,
            password,
        }
        console.log(credentials);
        try {
            await apiService.authenticate(credentials);
            const user = await apiService.getCurrentUser();
            setCurrentUser(user);
            navigate(-1);
        }
        catch (error) {
            console.log(error);
            setErrorText('Błąd');
        }
    }

    const errorMessage =
        <div className="text-danger">
            Nieprawidłowa nazwa użytkownika lub hasło.
        </div>;

    return (
        <Container className="login-container mt-5">
            <Form onSubmit={handleSubmit } action="#">
                <Form.Group className="mb-3" controlId="formUsername">
                    <Form.Label>Użytkownik</Form.Label>
                    <Form.Control type="text" value={username} onChange={handleUserChange} />
                </Form.Group>
                <Form.Group className="mb-3" controlId="formPassword">
                    <Form.Label>Hasło</Form.Label>
                    <Form.Control type="password" value={password} onChange={handlePasswordChange} />
                </Form.Group>
                <Button variant="primary" type="submit">
                    Zaloguj
                </Button>
                {errorText !== null && errorMessage}
            </Form>
        </Container>
    );
}