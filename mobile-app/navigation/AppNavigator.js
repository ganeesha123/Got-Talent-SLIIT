import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useAuth } from '../context/AuthContext';
import LoginScreen from '../screens/LoginScreen';
import VotingScreen from '../screens/VotingScreen';
import OnboardingScreen from '../screens/OnboardingScreen';
import LeaderboardScreen from '../screens/LeaderboardScreen';

import { View, Text, ActivityIndicator } from 'react-native';

const Stack = createStackNavigator();

export default function AppNavigator() {
  const { isAuthenticated, loading } = useAuth(); // Assuming useAuth is still relevant or we can simplify for now

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#1a1a2e' }}>
        <ActivityIndicator size="large" color="#e94560" />
        <Text style={{ color: 'white', marginTop: 20 }}>Loading App...</Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isAuthenticated ? (
          <>
            <Stack.Screen name="Onboarding" component={OnboardingScreen} />
            <Stack.Screen name="Login" component={LoginScreen} />
          </>
        ) : (
          <>
            <Stack.Screen name="Voting" component={VotingScreen} />
            <Stack.Screen name="Leaderboard" component={LeaderboardScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
