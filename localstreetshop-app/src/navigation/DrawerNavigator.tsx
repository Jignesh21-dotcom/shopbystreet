import React, { useEffect, useState } from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { supabase } from '../lib/supabase';

// Screens
import HomeScreen from '../screens/HomeScreen';
import LiveCitiesScreen from '../screens/LiveCitiesScreen';
import MemberScreen from '../screens/MemberScreen';
import ShopOwnerScreen from '../screens/ShopOwnerScreen';
import HomeBizScreen from '../screens/HomeBizScreen';
import ProfileScreen from '../screens/ProfileScreen';
import AdminScreen from '../screens/AdminScreen';
import LoginScreen from '../screens/LoginScreen';

const Drawer = createDrawerNavigator();

export default function DrawerNavigator() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
    };

    fetchUser();

    const { data: listener } = supabase.auth.onAuthStateChange(() => {
      fetchUser();
    });

    return () => {
      listener?.subscription?.unsubscribe();
    };
  }, []);

  return (
    <Drawer.Navigator initialRouteName="🏠 Home">
      <Drawer.Screen name="🏠 Home" component={HomeScreen} />
      <Drawer.Screen name="🏙️ Live Cities" component={LiveCitiesScreen} />
      <Drawer.Screen name="👤 Member" component={MemberScreen} />
      <Drawer.Screen name="🏪 Shop Owner" component={ShopOwnerScreen} />
      <Drawer.Screen name="🧵 Home Biz" component={HomeBizScreen} />
      {!user ? (
        <Drawer.Screen name="🔐 Login" component={LoginScreen} />
      ) : (
        <>
          <Drawer.Screen name="👤 Profile" component={ProfileScreen} />
          {user.user_metadata?.isAdmin && (
            <Drawer.Screen name="👑 Admin" component={AdminScreen} />
          )}
        </>
      )}
    </Drawer.Navigator>
  );
}
