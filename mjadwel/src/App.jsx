import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import MainLayout from './components/layout/MainLayout';
import ProtectedRoute from './components/layout/ProtectedRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Places from './pages/Places';
import SubmitPlace from './pages/SubmitPlace';
import CreateJadwal from './pages/plans/CreateJadwal';
import MyPlans from './pages/plans/MyPlans';
import PlanDetails from './pages/plans/PlanDetails';
import Explore from './pages/Explore';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route element={<MainLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/places" element={<Places />} />
            <Route path="/explore" element={<Explore />} />
            <Route path="/plans/:id" element={<PlanDetails />} />
            
            {/* Protected Routes */}
            <Route path="/places/submit" element={<ProtectedRoute><SubmitPlace /></ProtectedRoute>} />
            <Route path="/create-jadwal" element={<ProtectedRoute><CreateJadwal /></ProtectedRoute>} />
            <Route path="/my-plans" element={<ProtectedRoute><MyPlans /></ProtectedRoute>} />
            
            <Route path="*" element={<div className="p-8 text-center text-2xl">Not Found - 404</div>} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
