import { useState } from 'react';
import { Route, Routes, Link } from "react-router-dom";
import Login from './Login';
import Map from './Map';
import Header from './Header';
import { UserContext } from '../services/contexts';
export default function Root() {
    const [currentUser, setCurrentUser] = useState(null);
    return (
        <>
            <UserContext.Provider value={{ currentUser, setCurrentUser }}>
                <div className="layout-container">
                    <Header />
                    <Routes>
                        <Route path="/" element={<div>Home</div>} />
                        <Route path="/map" element={<Map />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<div>Rejestracja</div>} />
                    </Routes>
                </div>
                
                
            </UserContext.Provider>
        </>
    );
};