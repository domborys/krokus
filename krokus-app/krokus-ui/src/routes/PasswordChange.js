import Container from 'react-bootstrap/Container';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Alert from 'react-bootstrap/Alert';
import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom'
import { apiService } from '../services/api';
import { isValidPassword } from '../services/utils';
import { UserContext } from '../services/contexts';
export default function Login() {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [repeatPassword, setRepeatPassword] = useState('');
    const [validated, setValidated] = useState(false);
    const [errorText, setErrorText] = useState(null);
    const [wrongPassword, setWrongPassword] = useState(false);
    const { setCurrentUser } = useContext(UserContext);
    const navigate = useNavigate();

    const currentPasswordValid = isValidPassword(currentPassword);
    const newPasswordValid = isValidPassword(newPassword);
    const repeatPasswordValid = newPassword === repeatPassword;


    function handleCurrentPasswordChange(e) {
        setCurrentPassword(e.target.value);
    }

    function handleNewPasswordChange(e) {
        setNewPassword(e.target.value);
    }

    function handleRepeatPasswordChange(e) {
        setRepeatPassword(e.target.value);
    }

    function validate() {
        const valid = currentPasswordValid && newPasswordValid && repeatPasswordValid;
        setValidated(true);
        return valid;
    }

    async function handleSubmit(e) {
        e.preventDefault();
        const valid = validate();
        if (!valid) {
            setErrorText('Proszę poprawić pola formularza.');
            return;
        }
        const passwordData = {
            currentPassword,
            newPassword,
        }
        try {
            await apiService.changePassword(passwordData);
            await apiService.logout();
            setCurrentUser(null);
            navigate('/login', {
                state: { passwordChangeSuccess: true }
            });
        }
        catch (error) {
            console.log(error);
            setErrorText('Nieprawidłowe obecne hasło.');
            setWrongPassword(true);
        }
    }

    const errorMessage =
        <Alert variant="danger">
            {errorText}
        </Alert>;

    return (
        <Container className="register-container mt-5">
            <h2>Zmiana hasła</h2>
            <Form onSubmit={handleSubmit} action="#">
                <Form.Group className="mb-3" controlId="formCurrentPassword">
                    <Form.Label>Obecne hasło</Form.Label>
                    <Form.Control type="password" isInvalid={validated && !currentPasswordValid} value={currentPassword} onChange={handleCurrentPasswordChange} />
                    <Form.Control.Feedback type="invalid">Proszę podać poprawne hasło.</Form.Control.Feedback>
                </Form.Group>
                <Form.Group className="mb-3" controlId="formNewPassword">
                    <Form.Label>Nowe hasło</Form.Label>
                    <Form.Control type="password" isInvalid={validated && !newPasswordValid} value={newPassword} onChange={handleNewPasswordChange} aria-describedby="passwordHelpText" />
                    <Form.Control.Feedback type="invalid">Proszę podać poprawne hasło.</Form.Control.Feedback>
                    <Form.Text id="passwordHelpText" muted>
                        Hasło musi mieć długość co najmniej 6 znaków i zawierać dużą literę, małą literę, cyfrę oraz znak inny niż litera lub cyfra.
                    </Form.Text>
                </Form.Group>
                <Form.Group className="mb-3" controlId="formRepeatPassword">
                    <Form.Label>Powtórz nowe hasło</Form.Label>
                    <Form.Control type="password" isInvalid={validated && !repeatPasswordValid} value={repeatPassword} onChange={handleRepeatPasswordChange} />
                    <Form.Control.Feedback type="invalid">Podane hasła różnią się od siebie</Form.Control.Feedback>
                </Form.Group>
                {errorText !== null && errorMessage}
                <Button variant="primary" type="submit">
                    Zmień hasło
                </Button>
            </Form>
        </Container>
    );
}