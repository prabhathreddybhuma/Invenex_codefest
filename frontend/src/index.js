import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './index.css';
import App from './App';
import Dashboard from './dashboard';
import WarehouseManagement from './warehouse';
import Forecast from './forecast';
import Optimisation from './optimisations';
import Inventory from './inventory';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/warehouse" element={<WarehouseManagement />} />
        <Route path="/forecast" element={<Forecast />} />
        <Route path="/optimise" element={<Optimisation />} />
        <Route path="/inventory" element={<Inventory />} />
      </Routes>
    </Router>
  </React.StrictMode>
);
