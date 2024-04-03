import React from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useSetRecoilState } from 'recoil';
import { AuthState } from '../states/AuthState';
import { TokenState } from '../states/TokenState';

function Navbar() {
    const location = useLocation();
    const navigate = useNavigate();
    const setToken = useSetRecoilState(TokenState);
    const setAuth = useSetRecoilState(AuthState);
    const handleLogout = () => {
        localStorage.removeItem('token');
        setToken('');
        setAuth(false);
        navigate('/login');
    }

    return (
        <div>
            <nav className="navbar navbar-expand-lg bg-body-tertiary">
                <div className="container-fluid">
                    <Link className="navbar-brand" to="/docs">@ngworks</Link>
                    <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
                        <span className="navbar-toggler-icon"></span>
                    </button>
                    <div className="collapse navbar-collapse" id="navbarSupportedContent">
                        <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                            <li className="nav-item">
                                <Link className={`nav-link ${location.pathname === '/addoc' ? 'active' : ""}`} aria-current="page" to="/addoc">Upload File</Link>
                            </li>
                            <li className="nav-item">
                                <Link className={`nav-link ${location.pathname === '/' ? 'active' : ""}`} to="/">DataVault</Link>
                            </li>
                            <li className="nav-item">
                                <Link className={`nav-link ${location.pathname === '/missing' ? 'active' : ""}`} to="/missing">Complain</Link>
                            </li>
                        </ul>
                        <div className="d-flex" onClick={handleLogout}>
                            <button className="btn btn-dark">
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </nav>
        </div>
    )
}

export default Navbar