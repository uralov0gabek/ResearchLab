import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import PrivacyPolicy from './pages/PrivacyPolicy';
import Contact from './pages/Contact';
import PublicSurvey from './pages/PublicSurvey';

import AdminLayout from './components/AdminLayout';
import ProtectedRoute from './components/ProtectedRoute';

// Admin Pages
import AdminOverview from './pages/admin/AdminOverview';
import SurveyBuilder from './pages/admin/SurveyBuilder';
import CPTTaskBuilder from './pages/admin/CPTTaskBuilder';
import Responses from './pages/admin/Responses';
import Results from './pages/admin/Results';
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
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/survey" element={<PublicSurvey />} />
          
          {/* Protected Admin Routes */}
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="overview" replace />} />
            <Route path="overview" element={<AdminOverview />} />
            <Route path="survey-builder" element={<SurveyBuilder />} />
            <Route path="cpt-builder" element={<CPTTaskBuilder />} />
            <Route path="responses" element={<Responses />} />
            <Route path="results" element={<Results />} />
            <Route path="settings" element={<Settings />} />
          </Route>
          
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
  );
};

export default App;
