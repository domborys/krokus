import { useContext } from 'react';
import Nav from 'react-bootstrap/Nav';
import NavDropdown from 'react-bootstrap/NavDropdown';
import { Link, useNavigate } from "react-router-dom";
import { UserContext } from '../services/contexts';
import { apiService } from '../services/api';

export default function () {
    const { currentUser, setCurrentUser } = useContext(UserContext);
    const navigate = useNavigate();
    let accountItems;

    async function logout() {
        await apiService.logout();
        setCurrentUser(null);
        navigate('/login');
    }
    if (currentUser === null) {
        accountItems =
            <>
                <Nav.Item className="ms-auto">
                    <Nav.Link as={Link} to="/register">Rejestracja</Nav.Link>
                </Nav.Item>
                <Nav.Item>
                    <Nav.Link as={Link} to="/login">Logowanie</Nav.Link>
                </Nav.Item>
            </>;
    }
    else {
        accountItems =
            <>
            <NavDropdown title={currentUser.username} id="user-dropdown" className="ms-auto">
                <NavDropdown.Item>Profil</NavDropdown.Item>
                <NavDropdown.Item as={Link} to="/password-change">Zmień hasło</NavDropdown.Item>
                <NavDropdown.Item onClick={logout}>Wyloguj</NavDropdown.Item>
                </NavDropdown>
            </>;
    }
    return (
        <Nav className="border-bottom">
            <Nav.Item>
                <Nav.Link as={Link} to="/map">Mapa</Nav.Link>
            </Nav.Item>
            {currentUser !== null &&
                <Nav.Item>
                    <Nav.Link as={Link} to="/map/observations-add">Dodaj obserwację</Nav.Link>
                </Nav.Item>

            }
            {accountItems}
        </Nav>
    );
}