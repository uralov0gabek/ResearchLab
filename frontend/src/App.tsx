import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import { Loader2 } from 'lucide-react';

// Lazy loaded components
const Home = React.lazy(() => import('./pages/Home'));
const Login = React.lazy(() => import('./pages/Login'));
const PrivacyPolicy = React.lazy(() => import('./pages/PrivacyPolicy'));
const Contact = React.lazy(() => import('./pages/Contact'));
const PublicSurvey = React.lazy(() => import('./pages/PublicSurvey'));
const AdminLayout = React.lazy(() => import('./components/AdminLayout'));

// Admin Pages
const AdminOverview = React.lazy(() => import('./pages/admin/AdminOverview'));
const SurveyBuilder = React.lazy(() => import('./pages/admin/SurveyBuilder'));
const CPTBuilder = React.lazy(() => import('./pages/admin/CPTBuilder'));
const Responses = React.lazy(() => import('./pages/admin/Responses'));
const Results = React.lazy(() => import('./pages/admin/Results'));
const Settings = React.lazy(() => import('./pages/admin/Settings'));

const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
  </div>
);

const NotFound = () => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-8">
    <div className="bg-white p-8 rounded-xl shadow-lg text-center max-w-md w-full border border-gray-100">
      <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
        </svg>
      </div>
      <h2 className="text-3xl font-bold mb-3 text-gray-800">404</h2>
      <h3 className="text-xl font-medium mb-4 text-gray-600">Page Not Found</h3>
      <p className="text-gray-500 mb-8 text-sm">
        The page you are looking for does not exist or has been moved.
      </p>
      <Link 
        to="/" 
        className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors w-full"
      >
        Return to Home
      </Link>
    </div>
  </div>
);

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
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
            <Route index element={<AdminOverview />} />
            <Route path="survey-builder" element={<SurveyBuilder />} />
            <Route path="cpt-builder" element={<CPTBuilder />} />
            <Route path="responses" element={<Responses />} />
            <Route path="results" element={<Results />} />
            <Route path="settings" element={<Settings />} />
          </Route>
          
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
};

export default App;
