import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../services/authStore';

// Screens
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import OnboardingScreen from '../screens/auth/OnboardingScreen';

import ProfessionalDashboard from '../screens/professional/ProfessionalDashboard';
import JobDetailScreen from '../screens/professional/JobDetailScreen';
import ProfileScreen from '../screens/professional/ProfileScreen';
import EarningsScreen from '../screens/professional/EarningsScreen';
import CustomerNavigator from './CustomerNavigator';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function AuthNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
  );
}

function ProfessionalNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'home';
          if (route.name === 'Dashboard') iconName = 'briefcase';
          if (route.name === 'Earnings') iconName = 'wallet';
          if (route.name === 'Profile') iconName = 'person';
          return <Ionicons name={iconName} size={24} color={color} />;
        },
        tabBarActiveTintColor: '#1A3A52',
        tabBarInactiveTintColor: '#999',
        headerShown: true,
      })}
    >
      <Tab.Screen name="Dashboard" component={ProfessionalDashboard} />
      <Tab.Screen name="Earnings" component={EarningsScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

export function RootNavigator() {
  const { user, token } = useAuthStore();

  if (!token || !user) return <AuthNavigator />;
  return user.userType === 'customer' ? <CustomerNavigator /> : <ProfessionalNavigator />;
}
