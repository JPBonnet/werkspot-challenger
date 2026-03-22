import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

import SearchProfessionalsScreen from '../screens/customer/SearchProfessionalsScreen';
import ProfessionalProfileScreen from '../screens/customer/ProfessionalProfileScreen';
import BookJobScreen from '../screens/customer/BookJobScreen';
import PaymentScreen from '../screens/customer/PaymentScreen';
import ReviewScreen from '../screens/customer/ReviewScreen';
import MyJobsScreen from '../screens/customer/MyJobsScreen';
import MessagingScreen from '../screens/customer/MessagingScreen';
import MessageThread from '../screens/shared/MessageThread';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function SearchStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="SearchList" component={SearchProfessionalsScreen} />
      <Stack.Screen name="ProfessionalProfile" component={ProfessionalProfileScreen} />
      <Stack.Screen name="BookJob" component={BookJobScreen} />
      <Stack.Screen name="Payment" component={PaymentScreen} />
      <Stack.Screen name="Review" component={ReviewScreen} />
    </Stack.Navigator>
  );
}

function JobsStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="JobsList" component={MyJobsScreen} />
      <Stack.Screen name="Review" component={ReviewScreen} />
    </Stack.Navigator>
  );
}

function MessagesStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ConversationsList" component={MessagingScreen} />
      <Stack.Screen name="MessageThread" component={MessageThread} />
    </Stack.Navigator>
  );
}

export default function CustomerNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'home';
          if (route.name === 'Search') iconName = 'search';
          if (route.name === 'MyJobs') iconName = 'briefcase';
          if (route.name === 'Messaging') iconName = 'chatbubbles';
          return <Ionicons name={iconName} size={24} color={color} />;
        },
        tabBarActiveTintColor: '#1A3A52',
        tabBarInactiveTintColor: '#999',
        headerShown: false,
      })}
    >
      <Tab.Screen name="Search" component={SearchStack} options={{ tabBarLabel: 'Search' }} />
      <Tab.Screen name="MyJobs" component={JobsStack} options={{ tabBarLabel: 'My Jobs' }} />
      <Tab.Screen name="Messaging" component={MessagesStack} options={{ tabBarLabel: 'Messages' }} />
    </Tab.Navigator>
  );
}
