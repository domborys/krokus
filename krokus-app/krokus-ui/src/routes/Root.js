import { useState } from 'react';
import { Route, Routes, Link } from "react-router-dom";
import Login from './Login';
import Map from './Map';
import Header from './Header';
import ObservationSearch from './ObservationSearch';
import { UserContext } from '../services/contexts';
import "react-datepicker/dist/react-datepicker.css";
import { registerLocale, setDefaultLocale } from "react-datepicker";
import pl from 'date-fns/locale/pl';
registerLocale('pl', pl);
export default function Root() {
    const [currentUser, setCurrentUser] = useState(null);
    return (
        <>
            <UserContext.Provider value={{ currentUser, setCurrentUser }}>
                <div className="layout-container">
                    <Header />
                    <Routes>
                        <Route path="/" element={<div>Home</div>} />
                        {/* }<Route path="/map" element={<Map />}>
                            <Route index element={<ObservationSearch />} />
                        </Route>*/}
                        <Route path="/map/*" element={<Map />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<div>Rejestracja</div>} />
                    </Routes>
                </div>
                
                
            </UserContext.Provider>
        </>
    );
};