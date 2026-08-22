import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AdminLayout } from './layouts/AdminLayout';
import { AdminLogin } from './pages/admin/Login';
import { Overview } from './pages/admin/Overview';
import { SurveyBuilder } from './pages/admin/SurveyBuilder';
import { CPTTaskBuilder } from './pages/admin/CPTTaskBuilder';
import { LogicBranching } from './pages/admin/LogicBranching';
import { Responses } from './pages/admin/Responses';
import { CPTResults } from './pages/admin/CPTResults';
import { Settings } from './pages/admin/Settings';
import { LandingPage } from './pages/public/LandingPage';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Landing Page */}
          <Route path="/" element={<LandingPage />} />

          {/* Admin Routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
          
          <Route path="/admin" element={<ProtectedRoute />}>
            <Route element={<AdminLayout />}>
              <Route index element={<Navigate to="/admin/overview" replace />} />
              <Route path="overview" element={<Overview />} />
              <Route path="survey-builder" element={<SurveyBuilder />} />
              <Route path="cpt-task-builder" element={<CPTTaskBuilder />} />
              <Route path="logic-branching" element={<LogicBranching />} />
              <Route path="responses" element={<Responses />} />
              <Route path="cpt-results" element={<CPTResults />} />
              <Route path="settings" element={<Settings />} />
            </Route>
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
