import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import ProtectedRoute from './components/ProtectedRoute';
import AdminLayout from './components/AdminLayout';

// Admin Pages
import AdminOverview from './pages/admin/AdminOverview';
import SurveyBuilder from './pages/admin/SurveyBuilder';
import CPTTaskBuilder from './pages/admin/CPTTaskBuilder';
import LogicBranching from './pages/admin/LogicBranching';
import Responses from './pages/admin/Responses';
import CPTResults from './pages/admin/CPTResults';
import Settings from './pages/admin/Settings';

const NotFound = () => (
  <div className="p-8">
    <h2 className="text-3xl font-bold mb-4 text-red-500">404 - Not Found</h2>
    <p>The page you are looking for does not exist.</p>
  </div>
);

const App: React.FC = () => {
  return (
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          
          {/* Protected Admin Routes */}
          <Route 
            path="/admin" 
            element={<AdminLayout />}
          >
            <Route index element={<AdminOverview />} />
            <Route path="survey-builder" element={<SurveyBuilder />} />
            <Route path="cpt-builder" element={<CPTTaskBuilder />} />
            <Route path="logic" element={<LogicBranching />} />
            <Route path="responses" element={<Responses />} />
            <Route path="cpt-results" element={<CPTResults />} />
            <Route path="settings" element={<Settings />} />
          </Route>
          
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
  );
};

export default App;
