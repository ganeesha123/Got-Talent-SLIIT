import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';

import { AuthProvider } from './components/AuthContext.jsx';
import RequireAuth from './components/RequireAuth.jsx';
import RequireAdmin from './components/RequireAdmin.jsx';

import LoginPage from './pages/LoginPage.jsx';
import DashboardLayout from './pages/DashboardLayout.jsx';
import VotePage from './pages/VotePage.jsx';
import RankingsPage from './pages/RankingsPage.jsx';
import ManagePage from './pages/ManagePage.jsx';
import SettingsPage from './pages/SettingsPage.jsx';
import CategoriesPage from './pages/CategoriesPage.jsx';
import CountdownPage from './pages/CountdownPage.jsx';
import HomePage from './pages/HomePage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import ApplicationStatusPage from './pages/ApplicationStatusPage.jsx';

import JudgeDashboard from './pages/JudgeDashboard.jsx';
import JudgePanelDashboard from './pages/JudgePanelDashboard.jsx';
import FinalLeaderboardDashboard from './pages/FinalLeaderboardDashboard.jsx';
import FinalResult from './pages/FinalResult.jsx';

import ReviewPage from './pages/ReviewPage.jsx';

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />

        <Route path="/register" element={<RegisterPage />} />
        <Route
          path="/application-status"
          element={
            <RequireAuth>
              <ApplicationStatusPage />
            </RequireAuth>
          }
        />

        <Route
          path="/vote"
          element={
            <RequireAuth>
              <VotePage />
            </RequireAuth>
          }
        />

        <Route
          path="/rankings"
          element={
            <RequireAuth>
              <RankingsPage />
            </RequireAuth>
          }
        />

        <Route
          path="/dashboard"
          element={
            <RequireAuth>
              <DashboardLayout />
            </RequireAuth>
          }
        >
          <Route index element={<Navigate to="manage" replace />} />
          <Route
            path="manage"
            element={
              <RequireAdmin>
                <ManagePage />
              </RequireAdmin>
            }
          />
          <Route
            path="categories"
            element={
              <RequireAdmin>
                <CategoriesPage />
              </RequireAdmin>
            }
          />
          <Route
            path="countdown"
            element={
              <RequireAdmin>
                <CountdownPage />
              </RequireAdmin>
            }
          />
          <Route
            path="review/:id"
            element={
              <RequireAdmin>
                <ReviewPage />
              </RequireAdmin>
            }
          />
          <Route path="settings" element={<SettingsPage />} />
        </Route>

        <Route
          path="/judge-dashboard"
          element={
            <RequireAuth>
              <JudgeDashboard />
            </RequireAuth>
          }
        />
        <Route path="/judge-panel" element={<JudgePanelDashboard />} />
        <Route path="/final-leaderboard" element={<FinalLeaderboardDashboard />} />
        <Route path="/final-result" element={<FinalResult />} />
        <Route path="*" element={<Navigate to="/vote" replace />} />
      </Routes>
    </AuthProvider>
  );
}
   