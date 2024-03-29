import { useContext } from 'react';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import NavDropdown from 'react-bootstrap/NavDropdown';
import { Link, useNavigate } from "react-router-dom";
import { UserContext } from '../services/contexts';
import { apiService } from '../services/api';

/**
 * Application header with top menu.
 * */
export default function () {
    const { currentUser, setCurrentUser } = useContext(UserContext);
    const navigate = useNavigate();
    let accountItems;
    const modRights = currentUser && (currentUser.role === 'Admin' || currentUser.role === 'Moderator');
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
            {modRights && <Nav.Item><Nav.Link as={Link} to="/user-search">Użytkownicy</Nav.Link></Nav.Item>}
            <NavDropdown title={currentUser.username} id="user-dropdown" align="end">
                <NavDropdown.Item as={Link} to={`/Users/${currentUser.id}`}>Profil</NavDropdown.Item>
                <NavDropdown.Item as={Link} to="/password-change" >Zmień hasło</NavDropdown.Item>
                <NavDropdown.Item onClick={logout}>Wyloguj</NavDropdown.Item>
                </NavDropdown>
            </>;
    }
    return (
        <Navbar bg="primary" variant="dark" className="py-1">
            <Navbar.Brand as={Link} to="/map" className="ms-2">Krokus</Navbar.Brand>
            <Nav>
                <Nav.Item>
                    <Nav.Link as={Link} to="/map">Mapa</Nav.Link>
                </Nav.Item>
                {currentUser !== null &&
                    <Nav.Item>
                        <Nav.Link as={Link} to="/map/observations-add">Dodaj obserwację</Nav.Link>
                    </Nav.Item>
                }
            </Nav>
            <Nav className="ms-auto me-2">
                {accountItems}
            </Nav>
        </Navbar>
    );
}