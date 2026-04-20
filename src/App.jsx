import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Toast from './components/ui/Toast'

import LandingPage from './pages/LandingPage'
import PlannerSetupPage from './pages/PlannerSetupPage'
import ChatPlannerPage from './pages/ChatPlannerPage'
import ItineraryPage from './pages/ItineraryPage'
import ExplorePage from './pages/ExplorePage'
import BudgetPage from './pages/BudgetPage'
import SavedTripsPage from './pages/SavedTripsPage'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import AdminDashboard from './pages/AdminDashboard'
import BusRoutesPage from './pages/BusRoutesPage'
import ProtectedRoute from './components/auth/ProtectedRoute'
import AdminRoute from './components/auth/AdminRoute'
import AdminPlacesPage from './pages/AdminPlacesPage'
import AdminBusesPage from './pages/AdminBusesPage'
import RoutePlannerPage from './pages/RoutePlannerPage'
export default function App() {
  return (
    <BrowserRouter>
      <Toast />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/plan/setup" element={<PlannerSetupPage />} />
        <Route path="/plan/chat" element={<ChatPlannerPage />} />
        <Route path="/itinerary" element={<ItineraryPage />} />
        <Route path="/explore" element={<ExplorePage />} />
        <Route path="/budget" element={<BudgetPage />} />

        <Route
          path="/saved"
          element={
            <ProtectedRoute>
              <SavedTripsPage />
            </ProtectedRoute>
          }
        />

        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />

        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          }
        />
      <Route path="/buses" element={<BusRoutesPage />} />
        <Route path="*" element={<LandingPage />} />
        <Route
  path="/admin/places"
  element={
    <AdminRoute>
      <AdminPlacesPage />
    </AdminRoute>
  }
/>

<Route
  path="/admin/buses"
  element={
    <AdminRoute>
      <AdminBusesPage /></AdminRoute>}/>

      <Route path="/route-planner" element={<RoutePlannerPage />} />
      </Routes>
    </BrowserRouter>
  )
}