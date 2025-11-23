import { Routes, Route } from "react-router-dom"
import { SiteHeader } from "./components/site-header"
import { SiteFooter } from "./components/site-footer"
import { Toaster } from "./components/ui/sonner"
import HomePage from "./pages/home"
import NewsDetailPage from "./pages/news-detail"
import EventsPage from "./pages/events"
import EventDetailPage from "./pages/event-detail"
import ReleasesPage from "./pages/releases"
import ReleaseDetailPage from "./pages/release-detail"
import VideosPage from "./pages/videos"
import VideoDetailPage from "./pages/video-detail"
import LoginPage from "./pages/auth/login"
import SignUpPage from "./pages/auth/sign-up"
import SignUpSuccessPage from "./pages/auth/sign-up-success"
import ErrorPage from "./pages/auth/error"
import AdminDashboard from "./pages/admin/dashboard"
import AdminNewsPage from "./pages/admin/news"
import AdminEventsPage from "./pages/admin/events"
import AdminReleasesPage from "./pages/admin/releases"
import { ProtectedRoute } from "./components/protected-route"

function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/news/:slug" element={<NewsDetailPage />} />
          <Route path="/events" element={<EventsPage />} />
          <Route path="/events/:slug" element={<EventDetailPage />} />
          <Route path="/releases" element={<ReleasesPage />} />
          <Route path="/releases/:id" element={<ReleaseDetailPage />} />
          <Route path="/videos" element={<VideosPage />} />
          <Route path="/videos/:id" element={<VideoDetailPage />} />
          <Route path="/auth/login" element={<LoginPage />} />
          <Route path="/auth/sign-up" element={<SignUpPage />} />
          <Route path="/auth/sign-up-success" element={<SignUpSuccessPage />} />
          <Route path="/auth/error" element={<ErrorPage />} />

          <Route
            path="/admin"
            element={
              <ProtectedRoute requireAdmin>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/news"
            element={
              <ProtectedRoute requireAdmin>
                <AdminNewsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/events"
            element={
              <ProtectedRoute requireAdmin>
                <AdminEventsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/releases"
            element={
              <ProtectedRoute requireAdmin>
                <AdminReleasesPage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>
      <SiteFooter />
      <Toaster />
    </div>
  )
}

export default App
