import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import OnboardingScreen from './screens/OnboardingScreen';
import LoginScreen from './screens/LoginScreen';
import VotingScreen from './screens/VotingScreen';
import LeaderboardScreen from './screens/LeaderboardScreen';
import SettingsScreen from './screens/SettingsScreen';

// Simple manual navigator (no React Navigation container)
function Main() {
  const { isAuthenticated } = useAuth();
  const [currentScreen, setCurrentScreen] = useState('Onboarding');

  // Keep currentScreen in sync with auth state
  useEffect(() => {
    if (isAuthenticated) {
      setCurrentScreen('Voting');
    } else {
      setCurrentScreen('Onboarding');
    }
  }, [isAuthenticated]);

  const navigate = (screenName) => {
    setCurrentScreen(screenName);
  };

  const navigation = {
    navigate,
    goBack: () => {
      // Basic back behavior: from Leaderboard -> Voting, otherwise Onboarding
      if (currentScreen === 'Leaderboard') {
        setCurrentScreen('Voting');
      } else {
        setCurrentScreen('Onboarding');
      }
    },
    replace: navigate,
  };

  if (!isAuthenticated) {
    switch (currentScreen) {
      case 'Login':
        return <LoginScreen navigation={navigation} />;
      case 'Onboarding':
      default:
        return <OnboardingScreen navigation={navigation} />;
    }
  }

  // Authenticated flow
  switch (currentScreen) {
    case 'Settings':
      return <SettingsScreen navigation={navigation} />;
    case 'Leaderboard':
      return <LeaderboardScreen navigation={navigation} />;
    case 'Voting':
    default:
      return <VotingScreen navigation={navigation} />;
  }
}

export default function App() {
  return (
    <AuthProvider>
      <Main />
    </AuthProvider>
  );
}
