import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import ToursDashboard from './pages/ToursDashboard';
import AuthPage from './pages/AuthPage';
import TourDetail from './pages/TourDetail';
import AdminPage from './pages/AdminPage';
import ProfilePage from './pages/ProfilePage';
import AgenciesDashboard from './pages/AgenciesDashboard';
import AgencyProfile from './pages/AgencyProfile';
import AgencyRegister from './pages/agency/AgencyRegister';
import AgencyPortal from './pages/agency/AgencyPortal';
import About from './pages/About';
import Contact from './pages/Contact';
import { useAuth } from './context/AuthContext';

// Auth Protection Component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { token, loading } = useAuth();
  
  if (loading) return null;
  if (!token) return <Navigate to="/auth" replace />;
  
  return <>{children}</>;
};

// Agency Dedicated Protected Route Component
const AgencyProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { token, user, loading } = useAuth();
  
  if (loading) return null;
  if (!token || !user) return <Navigate to="/auth" replace />;
  if (user.role !== 'agency' || user.agencyStatus !== 'approved') {
    return <Navigate to="/auth" replace />;
  }
  
  return <>{children}</>;
};

function App() {
  return (
    <Router>
        <Routes>
          {/* Public Auth Route */}
          <Route path="/auth" element={<AuthPage />} />
          
          {/* Agency Onboarding Registration */}
          <Route path="/agency/register" element={<AgencyRegister />} />

          {/* Dedicated Agency & Tour Guide Management Portal (Strictly Protected) */}
          <Route path="/agency" element={<AgencyProtectedRoute><AgencyPortal /></AgencyProtectedRoute>} />
          <Route path="/agency/dashboard" element={<AgencyProtectedRoute><AgencyPortal /></AgencyProtectedRoute>} />
          <Route path="/agency/tours" element={<AgencyProtectedRoute><AgencyPortal /></AgencyProtectedRoute>} />
          <Route path="/agency/bookings" element={<AgencyProtectedRoute><AgencyPortal /></AgencyProtectedRoute>} />
          <Route path="/agency/settings" element={<AgencyProtectedRoute><AgencyPortal /></AgencyProtectedRoute>} />

          {/* Public Homepage */}
          <Route 
            path="/" 
            element={
              <Layout>
                <Home />
              </Layout>
            } 
          />
          
          {/* Public Explore Tours Page */}
          <Route 
            path="/tours" 
            element={
              <Layout>
                <ToursDashboard />
              </Layout>
            } 
          />

          {/* Public Tour Detail Page */}
          <Route 
            path="/tours/:id" 
            element={
              <Layout>
                <TourDetail />
              </Layout>
            } 
          />

          {/* Public Agencies Directory Page */}
          <Route 
            path="/agencies" 
            element={
              <Layout>
                <AgenciesDashboard />
              </Layout>
            } 
          />

          {/* Public Agency Profile Page */}
          <Route 
            path="/agencies/:id" 
            element={
              <Layout>
                <AgencyProfile />
              </Layout>
            } 
          />

          {/* Public About Page */}
          <Route 
            path="/about" 
            element={
              <Layout>
                <About />
              </Layout>
            } 
          />

          {/* Public Contact Page */}
          <Route 
            path="/contact" 
            element={
              <Layout>
                <Contact />
              </Layout>
            } 
          />

          {/* Protected Admin Route */}
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute>
                <Layout>
                  <AdminPage />
                </Layout>
              </ProtectedRoute>
            } 
          />

          {/* Protected Profile & Traveler Dashboard Routes */}
          <Route 
            path="/my-dashboard" 
            element={
              <ProtectedRoute>
                <Layout>
                  <ProfilePage />
                </Layout>
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/my-profile" 
            element={
              <ProtectedRoute>
                <Layout>
                  <ProfilePage />
                </Layout>
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/my-bookings" 
            element={
              <ProtectedRoute>
                <Layout>
                  <ProfilePage />
                </Layout>
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/profile" 
            element={
              <ProtectedRoute>
                <Layout>
                  <ProfilePage />
                </Layout>
              </ProtectedRoute>
            } 
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
  );
}

export default App;
