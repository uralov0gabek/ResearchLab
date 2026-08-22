import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AdminLayout } from './layouts/AdminLayout';
import { AdminLogin } from './pages/admin/Login';
import { AdminDashboard } from './pages/admin/Dashboard';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Landing Page Placeholder */}
          <Route 
            path="/" 
            element={
              <div className="min-h-screen flex items-center justify-center bg-background p-4">
                <div className="text-center">
                  <h1 className="text-4xl font-bold tracking-tight text-foreground mb-4">UzCombinator Research Lab</h1>
                  <p className="text-muted-foreground text-lg max-w-xl mx-auto">
                    The public survey platform will be built here in subsequent steps.
                  </p>
                  <div className="mt-8">
                    <a href="/admin/login" className="text-sm font-medium text-blue-500 hover:text-blue-400">
                      Go to Admin Portal &rarr;
                    </a>
                  </div>
                </div>
              </div>
            } 
          />

          {/* Admin Routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
          
          <Route path="/admin" element={<ProtectedRoute />}>
            <Route element={<AdminLayout />}>
              <Route index element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="dashboard" element={<AdminDashboard />} />
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
