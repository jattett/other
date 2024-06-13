// components/NavBar.js
import React from 'react';
import { Link } from 'react-router-dom';
import './styled.css'

function NavBar() {
  return (
    <nav>
      <ul style={{ display: 'flex', justifyContent: 'space-around' }}>
        <li>
          <Link to="/">Home</Link>
        </li>
        <li>
          <Link to="/about">About</Link>
        </li>
        <li>
          <Link to="/SportsMap">SportsMap</Link>
        </li>
      </ul>
    </nav>
  );
}

export default NavBar;