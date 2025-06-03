import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  SafeAreaView,
  ImageBackground,
} from 'react-native';
import Footer from '../components/Footer'; // <-- Import Footer

const { width } = Dimensions.get('window');

export default function HomeScreen({ navigation }: any) {
  return (
    <View style={{ flex: 1 }}>
      <View style={styles.background}>
        <ImageBackground
          source={require('../../assets/images/home-bg-final.png')}
          style={styles.backgroundImage}
          resizeMode="cover"
        >
          <SafeAreaView style={styles.wrapper}>
            <Text style={styles.title}>Welcome to Local Street Shop</Text>
            <Text style={styles.subtitle}>
              Discover authentic local businesses and explore real shops across Canadian streets.
            </Text>

            <TouchableOpacity
              style={styles.button}
              onPress={() => navigation.navigate('Provinces')}
            >
              <Text style={styles.buttonText}>Explore Canada</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.secondaryButton]}
              onPress={() => navigation.navigate('LiveCitiesScreen')}
            >
              <Text style={styles.buttonText}>Live Cities</Text>
            </TouchableOpacity>
          </SafeAreaView>
        </ImageBackground>
      </View>
      <Footer />
    </View>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: '#FFF2CC',
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  wrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
    marginBottom: 32,
  },
  button: {
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 10,
    marginBottom: 15,
    minWidth: width * 0.6,
    alignItems: 'center',
  },
  secondaryButton: {
    backgroundColor: '#eee',
  },
  buttonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '600',
  },
});