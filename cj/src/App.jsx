import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Toast from './components/ui/Toast'
import { useAuthStore } from './store/useAuthStore'

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
import WeatherPage from './pages/WeatherPage'
import HotelsPage from './pages/HotelsPage'
import ProtectedRoute from './components/auth/ProtectedRoute'
import AdminRoute from './components/auth/AdminRoute'
import AdminPlacesPage from './pages/AdminPlacesPage'
import AdminBusesPage from './pages/AdminBusesPage'

export default function App() {
  const fetchMe = useAuthStore((s) => s.fetchMe)

  // Hydrate auth state on app load — validates stored token
  useEffect(() => {
    fetchMe()
  }, [fetchMe])

  return (
    <BrowserRouter>
      <Toast />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/plan/setup" element={<PlannerSetupPage />} />
        <Route path="/plan/chat" element={<ChatPlannerPage />} />
        <Route path="/itinerary" element={<ItineraryPage />} />
        <Route path="/explore" element={<ExplorePage />} />
        <Route path="/hotels" element={<HotelsPage />} />
        <Route path="/budget" element={<BudgetPage />} />
        <Route path="/weather" element={<WeatherPage />} />

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
              <AdminBusesPage />
            </AdminRoute>
          }
        />

        <Route path="/route-planner" element={<Navigate to="/buses" replace />} />
        <Route path="*" element={<LandingPage />} />
      </Routes>
    </BrowserRouter>
  )
}