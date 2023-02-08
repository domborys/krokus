import Container from 'react-bootstrap/Container';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Alert from 'react-bootstrap/Alert';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom'
import { apiService } from '../services/api';
import { isValidPassword, isValidEmail } from '../services/utils';

/**
 * A page with registration form.
 */
export default function Login() {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [repeatPassword, setRepeatPassword] = useState('');
    const [validated, setValidated] = useState(false);
    const [errorText, setErrorText] = useState(null);
    const navigate = useNavigate();

    const usernameValid = username.trim() !== '';
    const emailValid = isValidEmail(email);
    const passwordValid = isValidPassword(password);
    const repeatPasswordValid = password === repeatPassword;

    function handleUserChange(e) {
        setUsername(e.target.value);
    }

    function handleEmailChange(e) {
        setEmail(e.target.value);
    }

    function handlePasswordChange(e) {
        setPassword(e.target.value);
    }

    function handleRepeatPasswordChange(e) {
        setRepeatPassword(e.target.value);
    }

    function validate(form) {
        const valid = usernameValid && emailValid && passwordValid && repeatPasswordValid;
        setValidated(true);
        return valid;
    }

    async function handleSubmit(e) {
        e.preventDefault();
        const valid = validate(e.currentTarget);
        if (!valid) {
            setErrorText('Proszę poprawić pola formularza');
            return;
        }
        const registerData = {
            username,
            email,
            password,
        }
        try {
            await apiService.register(registerData);
            navigate('/login', {
                state: {registerSuccess: true}
            });
        }
        catch (error) {
            console.log(error);
            setErrorText('Nie udało się utworzyć konta');
        }
    }

    const errorMessage =
        <Alert variant="danger">
            {errorText}
        </Alert>;

    return (
        <Container className="register-container mt-5">
            <h2>Rejestracja</h2>
            <Form onSubmit={handleSubmit} action="#">
                <Form.Group className="mb-3" controlId="formUsername">
                    <Form.Label>Nazwa użytkownika</Form.Label>
                    <Form.Control type="text" isInvalid={validated && !usernameValid} value={username} onChange={handleUserChange} />
                    <Form.Control.Feedback type="invalid">Proszę podać nazwę użytkownika.</Form.Control.Feedback>
                </Form.Group>
                <Form.Group className="mb-3" controlId="formEmail">
                    <Form.Label>E-mail</Form.Label>
                    <Form.Control type="text" isInvalid={validated && !emailValid} value={email} onChange={handleEmailChange} />
                    <Form.Control.Feedback type="invalid">Proszę podać poprawny adres e-mail.</Form.Control.Feedback>
                </Form.Group>
                <Form.Group className="mb-3" controlId="formPassword">
                    <Form.Label>Hasło</Form.Label>
                    <Form.Control type="password" isInvalid={validated && !passwordValid} value={password} onChange={handlePasswordChange} aria-describedby="passwordHelpText" />
                    <Form.Control.Feedback type="invalid">Proszę podać poprawne hasło.</Form.Control.Feedback>
                    <Form.Text id="passwordHelpText" muted>
                        Hasło musi mieć długość co najmniej 6 znaków i zawierać dużą literę, małą literę, cyfrę oraz znak inny niż litera lub cyfra.
                    </Form.Text>
                </Form.Group>
                <Form.Group className="mb-3" controlId="formRepeatPassword">
                    <Form.Label>Powtórz hasło</Form.Label>
                    <Form.Control type="password" isInvalid={validated && !repeatPasswordValid} value={repeatPassword} onChange={handleRepeatPasswordChange} />
                    <Form.Control.Feedback type="invalid">Podane hasła różnią się od siebie</Form.Control.Feedback>
                </Form.Group>
                {errorText !== null && errorMessage}
                <Button variant="primary" type="submit">
                    Utwórz konto
                </Button>
                
            </Form>
        </Container>
    );
}