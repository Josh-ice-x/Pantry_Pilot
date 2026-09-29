import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';

import { AppProvider, useApp } from './src/context/AppContext';
import { initPurchases } from './src/services/revenuecat';
import { colors } from './src/theme';

import HomeScreen from './src/screens/HomeScreen';
import ResultsScreen from './src/screens/ResultsScreen';
import RecipeDetailScreen from './src/screens/RecipeDetailScreen';
import PaywallScreen from './src/screens/PaywallScreen';

const Stack = createNativeStackNavigator();

function Navigator() {
  const { refreshPremiumStatus } = useApp();

  useEffect(() => {
    initPurchases();
    refreshPremiumStatus();
  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: colors.bg },
          headerTintColor: colors.text,
          headerShadowVisible: false,
        }}
      >
        <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Results" component={ResultsScreen} options={{ title: 'Your Meals' }} />
        <Stack.Screen name="RecipeDetail" component={RecipeDetailScreen} options={{ title: '' }} />
        <Stack.Screen name="Paywall" component={PaywallScreen} options={{ title: '', presentation: 'modal' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <AppProvider>
      <StatusBar style="dark" />
      <Navigator />
    </AppProvider>
  );
}
