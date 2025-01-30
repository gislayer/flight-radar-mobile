import { Image, StyleSheet, TextInput, Pressable } from 'react-native';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useState } from 'react';
import API from '@/lib/API';
import { FlightData } from '@/lib/types';
export default function HomeScreen2() {

  const [routeId, setRouteId] = useState<number>(73211);
  const [route, setRoute] = useState<FlightData>();
  const api = new API({newurl:'http://localhost:2003/api'});

  const clearRoute = () => {
    setRoute(undefined);
  }

  const getRoute = async () => {
    const route = await api.get(`routes/${routeId}`) as FlightData;
    setRoute(route);
  }

  const getAirportShortName = (name:string) => {
    return name.split(' ').map(word => word.charAt(0).toUpperCase()).join('');
  }

  const getAircraftImage = ()=>{
    try {
      if(!route){
        return require('@/assets/images/mobile-baykar.png');
      }
      const images:any = {
        1: require('@/assets/images/aircrafts/1.png'),
        2: require('@/assets/images/aircrafts/2.png'),
        3: require('@/assets/images/aircrafts/3.png'),
        4: require('@/assets/images/aircrafts/4.png'),
        5: require('@/assets/images/aircrafts/5.png'),
        6: require('@/assets/images/aircrafts/6.png'),
        7: require('@/assets/images/aircrafts/7.png'),
        8: require('@/assets/images/aircrafts/8.png'),
      };
      return images[route.aircraft.aircraftTypeId] || require('@/assets/images/mobile-baykar.png');
    } catch (error) {
      return require('@/assets/images/mobile-baykar.png');
    }
  }

  const getBackgroundImage = () => {
    try {
      if (!route?.aircraft?.id) {
        return require('@/assets/images/sky/1.jpg');
      }
      var bgImages = [
       require('@/assets/images/sky/1.jpg'),
       require('@/assets/images/sky/2.png'),
       require('@/assets/images/sky/3.jpg'),
       require('@/assets/images/sky/4.jpg'),
       require('@/assets/images/sky/5.jpg'),
       require('@/assets/images/sky/6.avif'),
       require('@/assets/images/sky/7.jpg'),
       require('@/assets/images/sky/8.jpg'),
       require('@/assets/images/sky/9.jpg'),
       require('@/assets/images/sky/10.jpg'),
       require('@/assets/images/sky/11.jpg'),
       require('@/assets/images/sky/12.jpg'),
       require('@/assets/images/sky/13.jpg'),
       require('@/assets/images/sky/14.jpg'),
       require('@/assets/images/sky/15.jpg'),
       require('@/assets/images/sky/16.webp'),
       require('@/assets/images/sky/17.jpg'),
       require('@/assets/images/sky/18.jpg'),
       require('@/assets/images/sky/19.webp'),
       require('@/assets/images/sky/20.jpg'),
       require('@/assets/images/sky/21.jpeg'),
       require('@/assets/images/sky/22.jpeg'),
      ];
      return bgImages[route.aircraft.id % bgImages.length];
    } catch (error) {
      return require('@/assets/images/sky/1.jpg'); // Varsayılan resim
    }
  }

  return (
    <ThemedView style={styles.container}>
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
      headerImage={
        <ThemedView style={styles.headerContainer}>
            <Image
              source={getBackgroundImage()}
              style={styles.headerBackground}
            />
            <Image
              source={getAircraftImage()}
              style={styles.aircraftImage}
            />
          </ThemedView>
      }>
      <ThemedView style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={routeId.toString()}
          onChangeText={(text)=>{setRouteId(Number(text))}}
          placeholder="Route No"
          keyboardType="numeric"
          onSubmitEditing={getRoute}
        />
        
        <ThemedView style={styles.buttonContainer}>
          <Pressable 
            style={styles.button}
            onPress={() => {
              getRoute();
            }}>
            <ThemedText style={styles.buttonText}>Search</ThemedText>
          </Pressable>
          {route && (
            <Pressable 
              style={styles.button}
              onPress={() => {
                clearRoute();
              }}>
              <ThemedText style={styles.buttonText}>Clear</ThemedText>
            </Pressable>
          )}
        </ThemedView>
      </ThemedView>
      {
        route && (
        <ThemedView style={styles.flightInfoContainer}>
          <ThemedView style={styles.rowContainer}>
            <Pressable style={styles.airportBox}>
              <ThemedText style={styles.labelText}>DEPARTURE AIRPORT</ThemedText>
              <ThemedText style={styles.airportCode}>{getAirportShortName(route.start_airport.name)}</ThemedText>
              <ThemedText style={styles.airportName} numberOfLines={1}>
                {route.start_airport.name}
              </ThemedText>
            </Pressable>
            
            <Pressable style={styles.airportBox}>
              <ThemedText style={styles.labelText}>ARRIVAL AIRPORT</ThemedText>
              <ThemedText style={styles.airportCode}>{getAirportShortName(route.finish_airport.name)}</ThemedText>
              <ThemedText style={styles.airportName} numberOfLines={1}>
                {route.finish_airport.name}
              </ThemedText>
            </Pressable>
          </ThemedView>

          <ThemedView style={styles.rowContainer}>
            <ThemedView style={styles.infoBox}>
              <ThemedText style={[styles.labelText, {color: '#06b6d4'}]}>ALTITUDE</ThemedText>
              <ThemedText style={[styles.valueText, {color: '#06b6d4'}]}>
                {route.altitude.toFixed(2)} m
              </ThemedText>
            </ThemedView>
            
            <ThemedView style={styles.infoBox}>
              <ThemedText style={[styles.labelText, {color: '#16a34a'}]}>SPEED</ThemedText>
              <ThemedText style={[styles.valueText, {color: '#16a34a'}]}>
                {route.speed.toFixed(2)} km/h
              </ThemedText>
            </ThemedView>
          </ThemedView>

          <ThemedView style={styles.rowContainer}>
            <ThemedView style={styles.infoBox}>
              <ThemedText style={[styles.labelText, {color: '#fbbf24'}]}>AZIMUTH</ThemedText>
              <ThemedText style={[styles.valueText, {color: '#fbbf24'}]}>
                {route.bearing.toFixed(2)}°
              </ThemedText>
            </ThemedView>
            
            <ThemedView style={styles.infoBox}>
              <ThemedText style={[styles.labelText, {color: '#f87171'}]}>PILOT</ThemedText>
              <ThemedText style={[styles.valueText, {color: '#f87171'}]}>
                {route.pilot.name}
              </ThemedText>
            </ThemedView>
          </ThemedView>
        </ThemedView>
        )
      }
      
    </ParallaxScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundImage: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  bgImage: {
    width: '100%',
    bottom: 0,
    left: 0,
    position: 'absolute',
    backgroundImage: 'url(@/assets/images/sky/1.jpg)',
    top:0
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  input: {
    flex: 1,
    height: 45,
    borderColor: '#efefef',
    borderRadius: 5,
    borderWidth: 1,
    paddingHorizontal: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  button: {
    backgroundColor: '#BBD686',
    padding: 10,
    borderRadius: 5,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  flightInfoContainer: {
    flex: 1,
    padding: 0,
  },
  rowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  airportBox: {
    flex: 1,
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#1e293b20',
    borderRadius: 5,
    padding: 10,
    backgroundColor:'#1e293b10',
    marginBottom:10
  },
  labelText: {
    fontSize: 9,
    fontWeight: 'bold',
  },
  airportCode: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  airportName: {
    fontSize: 12,
  },
  infoBox: {
    flex: 1,
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#1e293b20',
    borderRadius: 5,
    padding: 10,
    backgroundColor:'#1e293b10',
    marginBottom:10
  },
  valueText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  contactButton: {
    backgroundColor: '#BBD686',
    padding: 10,
    borderRadius: 5,
  },
  contactButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  headerContainer: {
    width: '100%',
    height: '100%',
  },
  headerBackground: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  aircraftImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    resizeMode: 'contain',
    padding:20
  },
});

/*<ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Welcome2!</ThemedText>
        <HelloWave />
      </ThemedView>
      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Step 1: Try it</ThemedText>
        <ThemedText>
          Edit <ThemedText type="defaultSemiBold">app/(tabs)/index.tsx</ThemedText> to see changes.
          Press{' '}
          <ThemedText type="defaultSemiBold">
            {Platform.select({
              ios: 'cmd + d',
              android: 'cmd + m',
              web: 'F12'
            })}
          </ThemedText>{' '}
          to open developer tools.
        </ThemedText>
      </ThemedView>
      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Step 2: Explore</ThemedText>
        <ThemedText>
          Tap the Explore tab to learn more about what's included in this starter app.
        </ThemedText>
      </ThemedView>
      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Step 3: Get a fresh start</ThemedText>
        <ThemedText>
          When you're ready, run{' '}
          <ThemedText type="defaultSemiBold">npm run reset-project</ThemedText> to get a fresh{' '}
          <ThemedText type="defaultSemiBold">app</ThemedText> directory. This will move the current{' '}
          <ThemedText type="defaultSemiBold">app</ThemedText> to{' '}
          <ThemedText type="defaultSemiBold">app-example</ThemedText>.
        </ThemedText>
      </ThemedView>*/