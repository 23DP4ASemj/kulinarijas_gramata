import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navigacija from './komponentes/Navigacija';
import Receptes from './lapas/Receptes';
import PievienotRecepti from './lapas/PievienotRecepti';
import RedigetRecepti from './lapas/RedigetRecepti';
import Recepte from './lapas/Recepte';
import Profils from './lapas/Profils';
import Kolekcijas from './lapas/Kolekcijas';
import Kolekcija from './lapas/Kolekcija';
import './stili/animacijas.css';

function App() {
  return (
    <Router>
      <div className="app">
        <Navigacija />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Navigate to="/receptes" />} />
            <Route path="/receptes" element={<Receptes />} />
            <Route path="/recepte/:id" element={<Recepte />} />
            <Route path="/pievienot" element={<PievienotRecepti />} />
            <Route path="/rediget/:id" element={<RedigetRecepti />} />
            <Route path="/profils" element={<Profils />} />
            <Route path="/profils/:userId" element={<Profils />} />
            <Route path="/kolekcijas" element={<Kolekcijas />} />
            <Route path="/kolekcija/:id" element={<Kolekcija />} />
            <Route path="*" element={<div>Lapa nav atrasta!</div>} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
