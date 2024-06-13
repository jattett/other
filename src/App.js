import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './page/Home';
import About from './page/About';
import NotFound from './page/NotFound';
import SportsMap from './page/SportsMap';
import NavBar from './components/NavBar';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/About" element={<About />} />
        <Route path="/SportsMap" element={<SportsMap />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <NavBar />
    </Router>
  );
}

export default App;
