import { useState, lazy, Suspense, memo } from "react"
import { Routes, Route, useLocation } from "react-router-dom"
import { SiteHeader } from "./components/site-header"
import { HeroHeader } from "./components/hero-header"
import { SidebarMenu } from "./components/sidebar-menu"
import { SiteFooter } from "./components/site-footer"
import { Toaster } from "./components/ui/sonner"
import { LoadingSpinner } from "./components/ui/loading-spinner"
import { ProtectedRoute } from "./components/protected-route"
import { ROUTES } from "./constants/routes"

// Lazy load pages for better performance
const HomePage = lazy(() => import("./pages/home"))
const ComingSoonPage = lazy(() => import("./pages/coming-soon"))
const NewsPage = lazy(() => import("./pages/news"))
const NewsDetailPage = lazy(() => import("./pages/news-detail"))
const EventsPage = lazy(() => import("./pages/events"))
const EventDetailPage = lazy(() => import("./pages/event-detail"))
const ReleasesPage = lazy(() => import("./pages/releases"))
const ReleaseDetailPage = lazy(() => import("./pages/release-detail"))
const VideosPage = lazy(() => import("./pages/videos"))
const VideoDetailPage = lazy(() => import("./pages/video-detail"))
const ReviewsPage = lazy(() => import("./pages/reviews"))
const ReviewDetailPage = lazy(() => import("./pages/review-detail"))
const StorePage = lazy(() => import("./pages/store"))
const ProductDetailPage = lazy(() => import("./pages/product-detail"))
const CheckoutPage = lazy(() => import("./pages/checkout"))
const CheckoutSuccessPage = lazy(() => import("./pages/checkout-success"))
const CheckoutErrorPage = lazy(() => import("./pages/checkout-error"))
const ProfilePage = lazy(() => import("./pages/profile"))
const DJsPage = lazy(() => import("./pages/djs"))
const DJProfilePage = lazy(() => import("./pages/profiles/dj"))
const ClubProfilePage = lazy(() => import("./pages/profiles/club"))
const PromoterProfilePage = lazy(() => import("./pages/profiles/promoter"))
const LabelProfilePage = lazy(() => import("./pages/profiles/label"))
const ClubberProfilePage = lazy(() => import("./pages/profiles/clubber"))
const LoginPage = lazy(() => import("./pages/auth/login"))
const SignUpPage = lazy(() => import("./pages/auth/sign-up"))
const SignUpSuccessPage = lazy(() => import("./pages/auth/sign-up-success"))
const ErrorPage = lazy(() => import("./pages/auth/error"))
const ProfileSelectionPage = lazy(() => import("./pages/auth/profile-selection"))
const ForgotPasswordPage = lazy(() => import("./pages/auth/forgot-password"))
const ResetPasswordPage = lazy(() => import("./pages/auth/reset-password"))
const AdminDashboard = lazy(() => import("./pages/admin/dashboard"))
const AdminNewsPage = lazy(() => import("./pages/admin/news"))
const AdminNewsEditPage = lazy(() => import("./pages/admin/news-edit"))
const AdminEventsPage = lazy(() => import("./pages/admin/events"))
const AdminEventsEditPage = lazy(() => import("./pages/admin/events-edit"))
const AdminReleasesPage = lazy(() => import("./pages/admin/releases"))
const AdminReleasesEditPage = lazy(() => import("./pages/admin/releases-edit"))
const AdminReviewsPage = lazy(() => import("./pages/admin/reviews"))
const AdminReviewsEditPage = lazy(() => import("./pages/admin/reviews-edit"))
const AdminVideosPage = lazy(() => import("./pages/admin/videos"))
const AdminVideosEditPage = lazy(() => import("./pages/admin/videos-edit"))
const AdminProfilesPage = lazy(() => import("./pages/admin/profiles"))
const AdminProfilesEditPage = lazy(() => import("./pages/admin/profiles-edit"))
const AdminProductsPage = lazy(() => import("./pages/admin/products"))
const AdminProductsEditPage = lazy(() => import("./pages/admin/products-edit"))
const AdminCategoriesPage = lazy(() => import("./pages/admin/categories"))
const AdminOrdersPage = lazy(() => import("./pages/admin/orders"))
const AdminUsersPage = lazy(() => import("./pages/admin/users"))
const AdminModerationPage = lazy(() => import("./pages/admin/moderation"))

// Loading fallback component
const PageLoader = memo(() => (
  <div className="min-h-screen bg-black flex items-center justify-center">
    <LoadingSpinner />
  </div>
))
PageLoader.displayName = "PageLoader"

function AppComponent() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [currentSection, setCurrentSection] = useState<string | undefined>()
  const location = useLocation()
  const isHomePage = location.pathname === ROUTES.HOME

  return (
    <div className="min-h-screen flex flex-col bg-black overflow-x-hidden w-full">
      <SidebarMenu 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)}
        onSectionChange={setCurrentSection}
      />
      {isHomePage ? (
        <HeroHeader 
          onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        />
      ) : (
        <SiteHeader 
          onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)}
          currentSection={currentSection}
        />
      )}
      <main className="flex-1 overflow-x-hidden w-full" style={{ minHeight: 0 }}>
        <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/coming-soon" element={<ComingSoonPage />} />
          <Route path="/" element={<HomePage />} />
          <Route path="/news" element={<NewsPage />} />
          <Route path="/news/:slug" element={<NewsDetailPage />} />
          <Route path="/events" element={<EventsPage />} />
          <Route path="/events/:slug" element={<EventDetailPage />} />
          <Route path="/releases" element={<ReleasesPage />} />
          <Route path="/releases/:id" element={<ReleaseDetailPage />} />
          <Route path="/videos" element={<VideosPage />} />
          <Route path="/videos/:id" element={<VideoDetailPage />} />
          <Route path="/reviews" element={<ReviewsPage />} />
          <Route path="/reviews/:slug" element={<ReviewDetailPage />} />
          <Route path="/store" element={<StorePage />} />
          <Route path="/store/:id" element={<ProductDetailPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/checkout/success" element={<CheckoutSuccessPage />} />
          <Route path="/checkout/error" element={<CheckoutErrorPage />} />
          <Route path="/auth/login" element={<LoginPage />} />
          <Route path="/auth/sign-up" element={<SignUpPage />} />
          <Route path="/auth/sign-up-success" element={<SignUpSuccessPage />} />
          <Route path="/auth/error" element={<ErrorPage />} />
          <Route path="/auth/profile-selection" element={<ProfileSelectionPage />} />
          <Route path="/auth/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/auth/reset-password" element={<ResetPasswordPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route
            path="/profile/dj"
            element={
              <ProtectedRoute
                requireVerified
                allowedProfileTypes={["dj"]}
              >
                <DJProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile/club"
            element={
              <ProtectedRoute
                requireVerified
                allowedProfileTypes={["club"]}
              >
                <ClubProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile/promoter"
            element={
              <ProtectedRoute
                requireVerified
                allowedProfileTypes={["promoter", "agency"]}
              >
                <PromoterProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile/label"
            element={
              <ProtectedRoute
                requireVerified
                allowedProfileTypes={["label"]}
              >
                <LabelProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile/clubber"
            element={
              <ProtectedRoute
                allowedProfileTypes={["clubber"]}
              >
                <ClubberProfilePage />
              </ProtectedRoute>
            }
          />
          <Route path="/profiles/:id" element={<ProfilePage />} />
          <Route path="/djs" element={<DJsPage />} />

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
            path="/admin/news/new"
            element={
              <ProtectedRoute requireAdmin>
                <AdminNewsEditPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/news/:id/edit"
            element={
              <ProtectedRoute requireAdmin>
                <AdminNewsEditPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/events"
            element={
              <ProtectedRoute
                requireAdmin
                requireVerified
                allowedProfileTypes={["dj", "promoter", "label", "agency", "club"]}
              >
                <AdminEventsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/events/new"
            element={
              <ProtectedRoute
                requireAdmin
                requireVerified
                allowedProfileTypes={["dj", "promoter", "label", "agency", "club"]}
              >
                <AdminEventsEditPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/events/edit/:id"
            element={
              <ProtectedRoute
                requireAdmin
                requireVerified
                allowedProfileTypes={["dj", "promoter", "label", "agency", "club"]}
              >
                <AdminEventsEditPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/releases"
            element={
              <ProtectedRoute
                requireAdmin
                requireVerified
                allowedProfileTypes={["dj", "label"]}
              >
                <AdminReleasesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/releases/new"
            element={
              <ProtectedRoute
                requireAdmin
                requireVerified
                allowedProfileTypes={["dj", "label"]}
              >
                <AdminReleasesEditPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/releases/edit/:id"
            element={
              <ProtectedRoute
                requireAdmin
                requireVerified
                allowedProfileTypes={["dj", "label"]}
              >
                <AdminReleasesEditPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/reviews"
            element={
              <ProtectedRoute requireAdmin>
                <AdminReviewsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/reviews/new"
            element={
              <ProtectedRoute requireAdmin>
                <AdminReviewsEditPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/reviews/edit/:id"
            element={
              <ProtectedRoute requireAdmin>
                <AdminReviewsEditPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/videos"
            element={
              <ProtectedRoute requireAdmin>
                <AdminVideosPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/videos/new"
            element={
              <ProtectedRoute requireAdmin>
                <AdminVideosEditPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/videos/:id/edit"
            element={
              <ProtectedRoute requireAdmin>
                <AdminVideosEditPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/products"
            element={
              <ProtectedRoute requireAdmin>
                <AdminProductsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/products/new"
            element={
              <ProtectedRoute requireAdmin>
                <AdminProductsEditPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/products/edit/:id"
            element={
              <ProtectedRoute requireAdmin>
                <AdminProductsEditPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/categories"
            element={
              <ProtectedRoute requireAdmin>
                <AdminCategoriesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/orders"
            element={
              <ProtectedRoute requireAdmin>
                <AdminOrdersPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute requireAdmin>
                <AdminUsersPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/moderation"
            element={
              <ProtectedRoute requireAdmin>
                <AdminModerationPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/profiles"
            element={
              <ProtectedRoute requireAdmin>
                <AdminProfilesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/profiles/new"
            element={
              <ProtectedRoute requireAdmin>
                <AdminProfilesEditPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/profiles/edit/:id"
            element={
              <ProtectedRoute requireAdmin>
                <AdminProfilesEditPage />
              </ProtectedRoute>
            }
          />
        </Routes>
        </Suspense>
      </main>
      <SiteFooter />
      <Toaster />
    </div>
  )
}

const App = memo(AppComponent)

export default App
