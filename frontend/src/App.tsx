import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import './App.css'
import { useAuth } from './hooks/useAuth'

const Navbar = lazy(() => import('./components/navbar/navbar').then(module => ({ default: module.Navbar })))
const LoginPage = lazy(() => import('./pages/auth/LoginPage').then(module => ({ default: module.LoginPage })))
const SignupPage = lazy(() => import('./pages/auth/SignupPage').then(module => ({ default: module.SignupPage })))
const ForgotPasswordPage = lazy(() => import('./pages/auth/ForgotPasswordPage').then(module => ({ default: module.ForgotPasswordPage })))
const AgencyInvitationPage = lazy(() => import('./pages/auth/AgencyInvitationPage').then(module => ({ default: module.AgencyInvitationPage })))
const AppShell = lazy(() => import('./components/layout/AppShell').then(module => ({ default: module.AppShell })))
const OverviewTab = lazy(() => import('./tabs/overview/overview').then(module => ({ default: module.OverviewTab })))
const PromptsTab = lazy(() => import('./tabs/prompts/prompts').then(module => ({ default: module.PromptsTab })))
const PromptDetailTab = lazy(() => import('./tabs/prompts/PromptDetailTab').then(module => ({ default: module.PromptDetailTab })))
const SourcesTab = lazy(() => import('./tabs/sources/SourcesTab').then(module => ({ default: module.SourcesTab })))
const SeoTab = lazy(() => import('./tabs/seo/SeoTab').then(module => ({ default: module.SeoTab })))
const CompetitorsTab = lazy(() => import('./tabs/competitors/CompetitorsTab').then(module => ({ default: module.CompetitorsTab })))
const WebAnalyticsTab = lazy(() => import('./tabs/webanalytics/WebAnalyticsTab').then(module => ({ default: module.WebAnalyticsTab })))
const ChatHistoryPage = lazy(() => import('./tabs/chat/ChatHistoryPage').then(module => ({ default: module.ChatHistoryPage })))
const SubscriptionTab = lazy(() => import('./tabs/subscription/SubscriptionTab').then(module => ({ default: module.SubscriptionTab })))
const ProfileTab = lazy(() => import('./tabs/profile/ProfileTab').then(module => ({ default: module.ProfileTab })))
const SettingsTab = lazy(() => import('./tabs/settings/SettingsTab').then(module => ({ default: module.SettingsTab })))
const HelpTab = lazy(() => import('./tabs/help/HelpTab').then(module => ({ default: module.HelpTab })))
const OpportunitiesTab = lazy(() => import('./tabs/opportunities/OpportunitiesTab').then(module => ({ default: module.OpportunitiesTab })))
const AIWorkspaceTab = lazy(() => import('./tabs/aiworkspace/AIWorkspaceTab').then(module => ({ default: module.AIWorkspaceTab })))
const AdminTab = lazy(() => import('./tabs/admin/AdminTab').then(module => ({ default: module.AdminTab })))
const BillingTab = lazy(() => import('./tabs/billing/BillingTab').then(module => ({ default: module.BillingTab })))
const AgencyTab = lazy(() => import('./tabs/agency/AgencyTab').then(module => ({ default: module.AgencyTab })))
const PricingPage = lazy(() => import('./pages/homepage/PricingPage').then(module => ({ default: module.PricingPage })))
const BookDemoPage = lazy(() => import('./pages/homepage/BookDemoPage').then(module => ({ default: module.BookDemoPage })))
const ProductPage = lazy(() => import('./pages/homepage/ProductPage').then(module => ({ default: module.ProductPage })))
const BlogPage = lazy(() => import('./pages/resources/BlogPage').then(module => ({ default: module.BlogPage })))
const ChangelogPage = lazy(() => import('./pages/resources/ChangelogPage').then(module => ({ default: module.ChangelogPage })))
const GeoGuidePage = lazy(() => import('./pages/resources/GeoGuidePage').then(module => ({ default: module.GeoGuidePage })))
const PublicHelpPage = lazy(() => import('./pages/resources/PublicHelpPage').then(module => ({ default: module.PublicHelpPage })))
const OnboardingSetupPage = lazy(() => import('./pages/onboarding/OnboardingSetupPage').then(module => ({ default: module.OnboardingSetupPage })))
const LandingChatWidget = lazy(() => import('./components/landing-chat/LandingChatWidget').then(module => ({ default: module.LandingChatWidget })))

function RootRoute() {
  const { isAuthenticated } = useAuth()
  if (isAuthenticated) return <Navigate to="/dashboard" replace />
  return <Navbar />
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth()
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return <>{children}</>
}

function App() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-slate-50 text-sm font-semibold text-slate-500">Loading PromptPulse...</div>}>
      <>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<RootRoute />} />
          <Route path="/demo" element={<BookDemoPage />} />
          <Route path="/book-demo" element={<BookDemoPage />} />
          <Route path="/pricing" element={<PricingPage />} />
          <Route path="/product/:product" element={<ProductPage />} />
          <Route path="/blog" element={<BlogPage />} />
          <Route path="/geo-guide" element={<GeoGuidePage />} />
          <Route path="/help-center" element={<PublicHelpPage />} />
          <Route path="/changelog" element={<ChangelogPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/agency/invitations/:token" element={<AgencyInvitationPage />} />
          <Route
            path="/onboarding"
            element={
              <ProtectedRoute>
                <OnboardingSetupPage />
              </ProtectedRoute>
            }
          />


      {/* Protected Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <AppShell>
                <OverviewTab />
              </AppShell>
            </ProtectedRoute>
          }
        />
        <Route
          path="/opportunities"
          element={
            <ProtectedRoute>
              <AppShell>
                <OpportunitiesTab />
              </AppShell>
            </ProtectedRoute>
          }
        />
        <Route
          path="/geo-articles"
          element={
            <ProtectedRoute>
              <Navigate to="/ai-workspace/content-briefs" replace />
            </ProtectedRoute>
          }
        />
        <Route
          path="/ai-workspace"
          element={
            <ProtectedRoute>
              <AppShell>
                <AIWorkspaceTab />
              </AppShell>
            </ProtectedRoute>
          }
        />
        <Route
          path="/ai-workspace/content-briefs"
          element={
            <ProtectedRoute>
              <AppShell>
                <AIWorkspaceTab />
              </AppShell>
            </ProtectedRoute>
          }
        />
        <Route
          path="/ai-workspace/actions"
          element={
            <ProtectedRoute>
              <AppShell>
                <AIWorkspaceTab />
              </AppShell>
            </ProtectedRoute>
          }
        />
        <Route
          path="/prompts"
          element={
            <ProtectedRoute>
              <AppShell>
                <PromptsTab />
              </AppShell>
            </ProtectedRoute>
          }
        />
        <Route
          path="/prompts/:promptId"
          element={
            <ProtectedRoute>
              <AppShell>
                <PromptDetailTab />
              </AppShell>
            </ProtectedRoute>
          }
        />
        <Route
          path="/sources"
          element={
            <ProtectedRoute>
              <AppShell>
                <SourcesTab />
              </AppShell>
            </ProtectedRoute>
          }
        />
        <Route
          path="/seo"
          element={
            <ProtectedRoute>
              <AppShell>
                <SeoTab />
              </AppShell>
            </ProtectedRoute>
          }
        />
        <Route
          path="/competitors"
          element={
            <ProtectedRoute>
              <AppShell>
                <CompetitorsTab />
              </AppShell>
            </ProtectedRoute>
          }
        />
        <Route
          path="/analytics"
          element={
            <ProtectedRoute>
              <AppShell>
                <WebAnalyticsTab />
              </AppShell>
            </ProtectedRoute>
          }
        />
        <Route
          path="/chat"
          element={
            <ProtectedRoute>
              <AppShell>
                <ChatHistoryPage />
              </AppShell>
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <AppShell>
                <ProfileTab />
              </AppShell>
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <AppShell>
                <SettingsTab />
              </AppShell>
            </ProtectedRoute>
          }
        />
        <Route
          path="/help"
          element={
            <ProtectedRoute>
              <AppShell>
                <HelpTab />
              </AppShell>
            </ProtectedRoute>
          }
        />
        <Route
          path="/subscription"
          element={
            <ProtectedRoute>
              <AppShell>
                <SubscriptionTab />
              </AppShell>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/*"
          element={
            <ProtectedRoute>
              <AppShell>
                <AdminTab />
              </AppShell>
            </ProtectedRoute>
          }
        />
        <Route
          path="/billing"
          element={
            <ProtectedRoute>
              <AppShell>
                <BillingTab />
              </AppShell>
            </ProtectedRoute>
          }
        />
        <Route
          path="/agency"
          element={
            <ProtectedRoute>
              <AppShell>
                <AgencyTab />
              </AppShell>
            </ProtectedRoute>
          }
        />
          {/* Catch-all to dashboard if logged in, otherwise login */}
          <Route
            path="*"
            element={
              <ProtectedRoute>
                <Navigate to="/dashboard" replace />
              </ProtectedRoute>
            }
          />
        </Routes>
        <LandingChatWidget />
      </>
    </Suspense>
  )
}

export default App
