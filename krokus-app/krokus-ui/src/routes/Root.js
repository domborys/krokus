import { useEffect, useState } from 'react';
import { Route, Routes, Link, useNavigate, Navigate } from "react-router-dom";
import Login from './Login';
import Register from './Register';
import PasswordChange from './PasswordChange';
import Map from './Map';
import Header from './Header';
import UserProfile from './UserProfile';
import UserSearch from './UserSearch';
import ObservationSearch from './ObservationSearch';
import { UserContext } from '../services/contexts';
import "react-datepicker/dist/react-datepicker.css";
import { registerLocale, setDefaultLocale } from "react-datepicker";
import pl from 'date-fns/locale/pl';
import { apiService } from '../services/api';
registerLocale('pl', pl);
export default function Root() {
    const [currentUser, setCurrentUser] = useState(null);
    const [currentUserLoading, setCurrentUserLoading] = useState(false);
    const navigate = useNavigate();

    async function loadCurrentUser() {
        if (!currentUserLoading) {
            try {
                setCurrentUserLoading(true);
                const user = await apiService.getCurrentUser();
                if (user) {
                    setCurrentUser(user);
                    navigate('/map')
                }
            }
            finally {
                setCurrentUserLoading(false);
            }
        }
    }

    useEffect(() => {
        loadCurrentUser();
    }, []);

    return (
        <>
            <UserContext.Provider value={{ currentUser, setCurrentUser }}>
                <div className="layout-container">
                    <Header />
                    <Routes>
                        <Route path="/" element={<Navigate to="/map" />} />
                        <Route path="/map/*" element={<Map />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        <Route path="/password-change" element={<PasswordChange />} />
                        <Route path="/users/:id" element={<UserProfile />} />
                        <Route path="/user-search" element={<UserSearch />} />
                    </Routes>
                </div>
            </UserContext.Provider>
        </>
    );
};