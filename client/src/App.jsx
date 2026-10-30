import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import { AccessibilityProvider } from './context/AccessibilityContext.jsx';

// Assistive Modals & Background Audio Helpers
import AccessibilityApprovalModal from './components/AccessibilityApprovalModal.jsx';
import PageAudioAnnouncer from './components/PageAudioAnnouncer.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import AppShell from './components/AppShell.jsx';

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
        {/* Device Accessibility Audio Approval Modal for Blind / Speech Assistance */}
        <AccessibilityApprovalModal />

        {/* Automated Spoken Page Introduction for Blind Users */}
        <PageAudioAnnouncer />

        {/* Application Routes */}
        <Routes>
          {/* Public Top-Level Pages */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Assistive App Shell with Desktop Sidebar & Mobile Bottom Nav */}
          <Route element={<AppShell />}>
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
              path="/image"
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
              path="/voice"
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
              path="/lecture"
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
          </Route>

          {/* Catch-all redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AccessibilityProvider>
    </AuthProvider>
  );
}
