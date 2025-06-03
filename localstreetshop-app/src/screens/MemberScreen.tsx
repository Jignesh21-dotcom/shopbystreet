import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Button, ScrollView, Alert } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '../lib/supabase';
import Footer from '../components/Footer';

export default function MemberScreen() {
  const navigation = useNavigation<any>();

  const [user, setUser] = useState<any>(null);
  const [countries, setCountries] = useState<any[]>([]);
  const [provinces, setProvinces] = useState<any[]>([]);
  const [cities, setCities] = useState<any[]>([]);
  const [streets, setStreets] = useState<any[]>([]);
  const [shops, setShops] = useState<any[]>([]);

  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedProvince, setSelectedProvince] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedStreet, setSelectedStreet] = useState('');
  const [selectedShop, setSelectedShop] = useState('');
  const [review, setReview] = useState('');

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      const { data, error } = await supabase.from('countries').select('id, name').order('name');
      if (!error) setCountries(data);
    };
    init();
  }, []);

  useEffect(() => {
    if (selectedCountry) {
      supabase.from('provinces')
        .select('id, name')
        .eq('country_id', selectedCountry)
        .order('name')
        .then(({ data }) => {
          setProvinces(data ?? []);
          setCities([]); setStreets([]); setShops([]);
          setSelectedProvince(''); setSelectedCity(''); setSelectedStreet(''); setSelectedShop('');
        });
    }
  }, [selectedCountry]);

  useEffect(() => {
    if (selectedProvince) {
      supabase.from('cities')
        .select('id, name')
        .eq('province_id', selectedProvince)
        .order('name')
        .then(({ data }) => {
          setCities(data ?? []);
          setStreets([]); setShops([]);
          setSelectedCity(''); setSelectedStreet(''); setSelectedShop('');
        });
    }
  }, [selectedProvince]);

  useEffect(() => {
    if (selectedCity) {
      supabase.from('streets')
        .select('id, name')
        .eq('city_id', selectedCity)
        .order('name')
        .then(({ data }) => {
          setStreets(data ?? []);
          setShops([]);
          setSelectedStreet(''); setSelectedShop('');
        });
    }
  }, [selectedCity]);

  useEffect(() => {
    if (selectedStreet) {
      supabase.from('shops')
        .select('id, name')
        .eq('street_id', selectedStreet)
        .order('name')
        .then(({ data }) => {
          setShops(data ?? []);
          setSelectedShop('');
        });
    }
  }, [selectedStreet]);

  const handleSubmit = async () => {
    if (!selectedShop || !review) {
      Alert.alert('Incomplete', 'Please select a shop and write your review.');
      return;
    }

    const { error } = await supabase.from('reviews').insert([
      { shop_id: selectedShop, user_id: user.id, review },
    ]);

    if (error) {
      Alert.alert('Error', 'Could not submit review. Please try again.');
    } else {
      Alert.alert('Success', 'Review submitted!');
      setReview('');
      setSelectedShop('');
    }
  };

  // 🔒 Not Logged In
  if (!user) {
    return (
      <View style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ padding: 20, alignItems: 'center' }}>
          <Text style={{ fontSize: 22, fontWeight: 'bold', marginBottom: 10 }}>Not a member yet?</Text>
          <Text style={{ textAlign: 'center', marginBottom: 20 }}>
            Sign up or log in to unlock exclusive perks:
          </Text>

          <View style={{ alignSelf: 'flex-start', marginBottom: 20 }}>
            <Text>✅ Browse and buy products from local shops</Text>
            <Text>📝 Leave reviews and share your experiences</Text>
            <Text>🎯 Earn points & rewards (coming soon!)</Text>
            <Text>🎉 Early access to special deals</Text>
          </View>

          <View style={{ flexDirection: 'row', gap: 20 }}>
            <Button title="Log In" onPress={() => navigation.navigate('LoginScreen')} />
            <Button title="Sign Up" onPress={() => navigation.navigate('SignupScreen')} />
          </View>
        </ScrollView>
        <Footer />
      </View>
    );
  }

  // 🔒 Shop Owner Restriction
  if (user.user_metadata?.isShopOwner) {
    return (
      <View style={{ flex: 1 }}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <Text style={{ fontSize: 18, color: 'red', textAlign: 'center' }}>
            🛑 Access Denied: This page is for members only.
          </Text>
        </View>
        <Footer />
      </View>
    );
  }

  // ✅ Logged In Member
  return (
    <View style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 20 }}>
          Leave a review, {user.email} 👋
        </Text>

        <Picker selectedValue={selectedCountry} onValueChange={setSelectedCountry}>
          <Picker.Item label="-- Choose a Country --" value="" />
          {countries.map((c: any) => <Picker.Item key={c.id} label={c.name} value={c.id} />)}
        </Picker>

        {provinces.length > 0 && (
          <Picker selectedValue={selectedProvince} onValueChange={setSelectedProvince}>
            <Picker.Item label="-- Choose a Province --" value="" />
            {provinces.map((p: any) => <Picker.Item key={p.id} label={p.name} value={p.id} />)}
          </Picker>
        )}

        {cities.length > 0 && (
          <Picker selectedValue={selectedCity} onValueChange={setSelectedCity}>
            <Picker.Item label="-- Choose a City --" value="" />
            {cities.map((c: any) => <Picker.Item key={c.id} label={c.name} value={c.id} />)}
          </Picker>
        )}

        {streets.length > 0 && (
          <Picker selectedValue={selectedStreet} onValueChange={setSelectedStreet}>
            <Picker.Item label="-- Choose a Street --" value="" />
            {streets.map((s: any) => <Picker.Item key={s.id} label={s.name} value={s.id} />)}
          </Picker>
        )}

        {shops.length > 0 && (
          <Picker selectedValue={selectedShop} onValueChange={setSelectedShop}>
            <Picker.Item label="-- Choose a Shop --" value="" />
            {shops.map((s: any) => <Picker.Item key={s.id} label={s.name || '(Unnamed shop)'} value={s.id} />)}
          </Picker>
        )}

        {selectedShop && (
          <>
            <TextInput
              placeholder="Write your review here"
              value={review}
              onChangeText={setReview}
              style={{ borderWidth: 1, borderColor: '#ccc', padding: 10, marginTop: 20, marginBottom: 10 }}
            />
            <Button title="Submit Review" onPress={handleSubmit} />
          </>
        )}
      </ScrollView>
      <Footer />
    </View>
  );
}