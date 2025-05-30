import 'react-native-url-polyfill/auto';
import 'react-native-gesture-handler'; // Required for navigation
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import HomeScreen from './src/screens/HomeScreen';
import ProvincesScreen from './src/screens/ProvincesScreen'; // ✅ New
import CitiesScreen from './src/screens/CitiesScreen';

export type RootStackParamList = {
  Home: undefined;
  Provinces: undefined;
  Cities: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Provinces"
          component={ProvincesScreen}
          options={{ title: 'Explore Provinces' }}
        />
        <Stack.Screen
          name="Cities"
          component={CitiesScreen}
          options={{ title: 'Cities' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
