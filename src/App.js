import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Other from './page/Home';
import About from './page/About';
import NotFound from './page/NotFound';
import SportsMap from './page/SportsMap';
import NavBar from './components/NavBar';
import './global.css'; // Global styles

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/other" element={<Other />} />
        <Route path="/About" element={<About />} />
        <Route path="/SportsMap" element={<SportsMap />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <NavBar />
    </Router>
  );
}

export default App;
