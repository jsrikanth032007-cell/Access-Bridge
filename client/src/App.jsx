import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import { AccessibilityProvider } from './context/AccessibilityContext.jsx';

// Components
import SkipLink from './components/SkipLink.jsx';
import AccessibilityToolbar from './components/AccessibilityToolbar.jsx';
import AccessibilityApprovalModal from './components/AccessibilityApprovalModal.jsx';
import PageAudioAnnouncer from './components/PageAudioAnnouncer.jsx';
import Navbar from './components/Navbar.jsx';
import Footer from './components/Footer.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';

// Pages
import Landing from './pages/Landing.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Simplify from './pages/Simplify.jsx';
import ImageDescribe from './pages/ImageDescribe.jsx';
import VoiceAssistant from './pages/VoiceAssistant.jsx';
import LectureNotes from './pages/LectureNotes.jsx';
import History from './pages/History.jsx';
import Profile from './pages/Profile.jsx';

export default function App() {
  return (
    <AuthProvider>
      <AccessibilityProvider>
        <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
          {/* Accessible Skip to Content Link */}
          <SkipLink />

          {/* Quick Accessibility Customization Toolbar */}
          <AccessibilityToolbar />

          {/* Device Accessibility Audio Approval Modal for Blind / Speech Assistance */}
          <AccessibilityApprovalModal />

          {/* Automated Spoken Page Introduction for Blind Users */}
          <PageAudioAnnouncer />

          {/* Semantic Main Navbar */}
          <Navbar />

          {/* Page Routing */}
          <div className="flex-1">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Protected Assistive Routes */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/simplify"
                element={
                  <ProtectedRoute>
                    <Simplify />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/describe-image"
                element={
                  <ProtectedRoute>
                    <ImageDescribe />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/voice-assistant"
                element={
                  <ProtectedRoute>
                    <VoiceAssistant />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/lecture-notes"
                element={
                  <ProtectedRoute>
                    <LectureNotes />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/history"
                element={
                  <ProtectedRoute>
                    <History />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>

          {/* Semantic Accessible Footer */}
          <Footer />
        </div>
      </AccessibilityProvider>
    </AuthProvider>
  );
}
