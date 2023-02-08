import Container from 'react-bootstrap/Container';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Alert from 'react-bootstrap/Alert';
import Stack from 'react-bootstrap/Stack';
import { useState, useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom'
import { apiService } from '../services/api';
import { UserContext } from '../services/contexts';
/**
 * Login page.
 * */
export default function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [errorText, setErrorText] = useState(null);
    const { currentUser, setCurrentUser } = useContext(UserContext);
    const navigate = useNavigate();
    const location = useLocation();

    const registerSuccess = !!location.state?.registerSuccess;
    const passwordChangeSuccess = !!location.state?.passwordChangeSuccess;
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
        try {
            await apiService.authenticate(credentials);
            const user = await apiService.getCurrentUser();
            setCurrentUser(user);
            navigate('/map');
        }
        catch (error) {
            setErrorText(error.message);
        }
    }

    const errorMessage =
        <Alert variant="danger" className="my-3">
            {errorText}
        </Alert>;
    const registerSuccessAlert =
        <Alert variant="success">
            Rejestracja zakończona pomyślnie.
        </Alert>;
    const passwordChangeSuccessAlert =
        <Alert variant="success">
            Hasło zostało zmienione.
        </Alert>;
    return (
        <Container className="login-container mt-5">
            <h1 className="h2 mb-3">Logowanie</h1>
            {registerSuccess && registerSuccessAlert}
            {passwordChangeSuccess && passwordChangeSuccessAlert}
            <Form onSubmit={handleSubmit } action="#">
                <Form.Group className="mb-3" controlId="formUsername">
                    <Form.Label>Użytkownik</Form.Label>
                    <Form.Control type="text" value={username} onChange={handleUserChange} />
                </Form.Group>
                <Form.Group className="mb-3" controlId="formPassword">
                    <Form.Label>Hasło</Form.Label>
                    <Form.Control type="password" value={password} onChange={handlePasswordChange} />
                </Form.Group>
                {errorText !== null && errorMessage}
                <Stack direction="horizontal" className="justify-content-end">
                    <Button variant="primary" type="submit">
                        Zaloguj
                    </Button>
                </Stack>
            </Form>
        </Container>
    );
}