import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import ToursDashboard from './pages/ToursDashboard';
import AuthPage from './pages/AuthPage';
import TourDetail from './pages/TourDetail';
import AdminPage from './pages/AdminPage';
import ProfilePage from './pages/ProfilePage';
import { AuthProvider, useAuth } from './context/AuthContext';

// Auth Protection Component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { token, loading } = useAuth();
  
  if (loading) return null;
  if (!token) return <Navigate to="/auth" replace />;
  
  return <>{children}</>;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Auth Route */}
          <Route path="/auth" element={<AuthPage />} />
          
          {/* Protected Routes inside Layout */}
          <Route 
            path="/" 
            element={
              <ProtectedRoute>
                <Layout>
                  <ToursDashboard />
                </Layout>
              </ProtectedRoute>
            } 
          />
          
          {/* /tours also leads to Dashboard */}
          <Route 
            path="/tours" 
            element={
              <ProtectedRoute>
                <Layout>
                  <ToursDashboard />
                </Layout>
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/tours/:id" 
            element={
              <ProtectedRoute>
                <Layout>
                  <TourDetail />
                </Layout>
              </ProtectedRoute>
            } 
          />

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
    </AuthProvider>
  );
}

export default App;
