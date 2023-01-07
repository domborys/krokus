import Container from 'react-bootstrap/Container';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Alert from 'react-bootstrap/Alert';
import { useState, useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom'
import { apiService } from '../services/api';
import { UserContext } from '../services/contexts';
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
        console.log(credentials);
        try {
            await apiService.authenticate(credentials);
            const user = await apiService.getCurrentUser();
            setCurrentUser(user);
            navigate('/map');
        }
        catch (error) {
            console.log(error);
            setErrorText('Błąd');
        }
    }

    const errorMessage =
        <Alert variant="danger">
            Nieprawidłowa nazwa użytkownika lub hasło.
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
                <Button variant="primary" type="submit">
                    Zaloguj
                </Button>
                {errorText !== null && errorMessage}
            </Form>
        </Container>
    );
}