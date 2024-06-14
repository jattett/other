// components/NavBar.js
import React from 'react';
import { Link } from 'react-router-dom';
import './styled.css'

function NavBar() {
  return (
    <nav>
      <ul style={{ display: 'flex', justifyContent: 'space-around' }}>
        <li>
          <Link to="/">홈</Link>
        </li>
        <li>
          <Link to="/about">맛집찾기</Link>
        </li>
        <li>
          <Link to="/SportsMap">체육관찾기</Link>
        </li>
      </ul>
    </nav>
  );
}

export default NavBar;
