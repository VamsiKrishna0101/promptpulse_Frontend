import { Routes, Route, Navigate } from 'react-router-dom'
import './App.css'
import { Navbar } from './components/navbar/navbar'
import { LoginPage } from './pages/auth/LoginPage'
import { SignupPage } from './pages/auth/SignupPage'
import { AppShell } from './components/layout/AppShell'
import { useAuth } from './hooks/useAuth'
import { OverviewTab } from './tabs/overview/overview'
import { PromptsTab } from './tabs/prompts/prompts'
import { PromptDetailTab } from './tabs/prompts/PromptDetailTab'
import { SourcesTab } from './tabs/sources/SourcesTab'
import { CompetitorsTab } from './tabs/competitors/CompetitorsTab'
import { WebAnalyticsTab } from './tabs/webanalytics/WebAnalyticsTab'
import { ChatHistoryPage } from './tabs/chat/ChatHistoryPage'
import { SubscriptionTab } from './tabs/subscription/SubscriptionTab'
import { ProfileTab } from './tabs/profile/ProfileTab'
import { SettingsTab } from './tabs/settings/SettingsTab'
import { HelpTab } from './tabs/help/HelpTab'
import { OpportunitiesTab } from './tabs/opportunities/OpportunitiesTab'
import { AIWorkspaceTab } from './tabs/aiworkspace/AIWorkspaceTab'
import { AdminTab } from './tabs/admin/AdminTab'
import { PricingPage } from './pages/homepage/PricingPage'
import { BookDemoPage } from './pages/homepage/BookDemoPage'
import { ProductPage } from './pages/homepage/ProductPage'
import { BlogPage } from './pages/resources/BlogPage'
import { ChangelogPage } from './pages/resources/ChangelogPage'
import { GeoGuidePage } from './pages/resources/GeoGuidePage'
import { PublicHelpPage } from './pages/resources/PublicHelpPage'
import { OnboardingSetupPage } from './pages/onboarding/OnboardingSetupPage'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth()
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return <>{children}</>
}

function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Navbar />} />
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
  )
}

export default App
