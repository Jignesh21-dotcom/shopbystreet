import 'react-native-gesture-handler';
import 'react-native-url-polyfill/auto';
import { TailwindProvider } from 'tailwindcss-react-native';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';


import HomeScreen from './src/screens/HomeScreen';
import ProvincesScreen from './src/screens/ProvincesScreen';
import CitiesScreen from './src/screens/CitiesScreen';
import StreetScreen from './src/screens/StreetScreen';
import ShopListScreen from './src/screens/ShopListScreen';
import ShopDetailScreen from './src/screens/ShopDetailScreen';
import LiveCitiesScreen from './src/screens/LiveCitiesScreen';
import LoginScreen from './src/screens/LoginScreen';
import SignupScreen from './src/screens/SignupScreen';
import DrawerNavigator from './src/navigation/DrawerNavigator';

// ✅ Shop Owner Screens
import ShopOwnerDashboard from './src/screens/ShopOwnerDashboard';
import ClaimShopScreen from './src/screens/ClaimShopScreen';
import AddShopScreen from './src/screens/AddShopScreen';
import AddProductScreen from './src/screens/AddProductScreen';
import ManageProductsScreen from './src/screens/ManageProductsScreen';
import OrdersScreen from './src/screens/OrdersScreen';
import PaymentSuccessScreen from './src/screens/PaymentSuccessScreen';

// ✅ Extra Pages
import MemberScreen from './src/screens/MemberScreen';
import HomeBizScreen from './src/screens/HomeBizScreen';
import AboutScreen from './src/screens/AboutScreen';
import ContactUsScreen from './src/screens/ContactUsScreen';
import PrivacyPolicyScreen from './src/screens/PrivacyPolicyScreen';
import SubmitShopScreen from './src/screens/SubmitShopScreen';
import SubmitShopFormScreen from './src/screens/SubmitShopFormScreen';
import SubmitStreetScreen from './src/screens/SubmitStreetScreen';

export type RootStackParamList = {
  Drawer: undefined;
  Provinces: undefined;
  Cities: { provinceSlug?: string };
  StreetScreen: { cityId: string; cityName: string; provinceSlug: string };
  ShopListScreen: { streetSlug: string; streetName: string };
  ShopDetailScreen: { shopSlug: string };
  LiveCitiesScreen: undefined;
  LoginScreen: undefined;
  SignupScreen: undefined;

  // Shop Owner
  ShopOwnerDashboard: undefined;
  ClaimShopScreen: undefined;
  AddShopScreen: undefined;
  AddProductScreen: undefined;
  ManageProductsScreen: undefined;
  OrdersScreen: undefined;
  PaymentSuccessScreen: undefined;

  // Extra Pages
  MemberScreen: undefined;
  HomeBizScreen: undefined;
  AboutScreen: undefined;
  ContactUsScreen: undefined;
  PrivacyPolicyScreen: undefined;
  SubmitShopScreen: undefined;
  SubmitShopFormScreen: undefined;
  SubmitStreetScreen: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <TailwindProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Drawer" screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Drawer" component={DrawerNavigator} />
          <Stack.Screen name="Provinces" component={ProvincesScreen} />
          <Stack.Screen name="Cities" component={CitiesScreen} />
          <Stack.Screen name="StreetScreen" component={StreetScreen} />
          <Stack.Screen name="ShopListScreen" component={ShopListScreen} />
          <Stack.Screen name="ShopDetailScreen" component={ShopDetailScreen} />
          <Stack.Screen name="LiveCitiesScreen" component={LiveCitiesScreen} />
          <Stack.Screen name="LoginScreen" component={LoginScreen} />
          <Stack.Screen name="SignupScreen" component={SignupScreen} />

          {/* Shop Owner Flow */}
          <Stack.Screen name="ShopOwnerDashboard" component={ShopOwnerDashboard} />
          <Stack.Screen name="ClaimShopScreen" component={ClaimShopScreen} />
          <Stack.Screen name="AddShopScreen" component={AddShopScreen} />
          <Stack.Screen name="AddProductScreen" component={AddProductScreen} />
          <Stack.Screen name="ManageProductsScreen" component={ManageProductsScreen} />
          <Stack.Screen name="OrdersScreen" component={OrdersScreen} />
          <Stack.Screen name="PaymentSuccessScreen" component={PaymentSuccessScreen} />

          {/* Extra Pages */}
          <Stack.Screen name="MemberScreen" component={MemberScreen} />
          <Stack.Screen name="HomeBizScreen" component={HomeBizScreen} />
          <Stack.Screen name="AboutScreen" component={AboutScreen} />
          <Stack.Screen name="ContactUsScreen" component={ContactUsScreen} />
          <Stack.Screen name="PrivacyPolicyScreen" component={PrivacyPolicyScreen} />
          <Stack.Screen name="SubmitShopScreen" component={SubmitShopScreen} />
          <Stack.Screen name="SubmitShopFormScreen" component={SubmitShopFormScreen} />
          <Stack.Screen name="SubmitStreetScreen" component={SubmitStreetScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </TailwindProvider>
  );
}
