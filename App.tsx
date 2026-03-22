import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import * as SecureStore from 'expo-secure-store';
import { RootNavigator } from './navigation/RootNavigator';
import { useAuthStore } from './services/authStore';

export default function App() {
  const { initialize } = useAuthStore();

  useEffect(() => {
    // Initialize app state from secure storage
    const initializeApp = async () => {
      try {
        const token = await SecureStore.getItemAsync('authToken');
        if (token) {
          initialize(token);
        }
      } catch (error) {
        console.error('Failed to initialize app:', error);
      }
    };

    initializeApp();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <NavigationContainer>
          <RootNavigator />
        </NavigationContainer>
        <StatusBar barStyle="dark-content" />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
