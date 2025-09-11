import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="header">
      <div className="container">
        <nav className="nav">
          <div className="nav-brand">
            <Link to="/" className="nav-link">StockSpot</Link>
          </div>
          <ul className="nav-menu">
            {user && (
              <>
                <li>
                  <Link to="/" className="nav-link">Dashboard</Link>
                </li>
                <li>
                  <Link to="/map" className="nav-link">Map View</Link>
                </li>
                <li>
                  <Link to="/search" className="nav-link">Search</Link>
                </li>
                {user.role === 'merchant' && (
                  <li>
                    <Link to="/merchants/add" className="nav-link">Add Merchant</Link>
                  </li>
                )}
                <li>
                  <button onClick={handleLogout} className="nav-link">
                    Logout
                  </button>
                </li>
              </>
            )}
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Navbar;