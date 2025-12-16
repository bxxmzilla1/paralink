import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Viewer from './pages/Viewer';

/**
 * Main App Component
 * 
 * Routes:
 * - / (or no hash) -> Dashboard (creator mode)
 * - /go?p=... -> Viewer (visitor mode)
 */
const App: React.FC = () => {
  return (
    <HashRouter>
      <Routes>
        <Route path="/go" element={<Viewer />} />
        <Route path="*" element={<Dashboard />} />
      </Routes>
    </HashRouter>
  );
};

export default App;
