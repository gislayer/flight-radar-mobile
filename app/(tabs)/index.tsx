import { StyleSheet, TouchableOpacity, View, Text, Switch, Alert, Platform, DeviceEventEmitter } from 'react-native';
import { WebView } from 'react-native-webview';
import { ThemedView } from '@/components/ThemedView';
import { Asset } from 'expo-asset';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useEffect, useRef, useState } from 'react';
import * as Location from 'expo-location';
import Slider from '@react-native-community/slider';
import { Picker } from '@react-native-picker/picker';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { FlightData } from '@/lib/types';

interface Basemap {
  id: string;
  name: string;
}

export default function MapScreen() {
  const route = useSelector((state: RootState) => state.route.route) as FlightData;
  const [settings, setSettings] = useState(false);
  const [layers, setLayers] = useState(false);
  const [buildings, setBuildings] = useState(true);
  const [terrain, setTerrain] = useState(true);
  const [loaded, setLoaded] = useState(false);
  const [follow, setFollow] = useState(false);
  const [oldView, setOldView] = useState<{zoom: number, pitch: number, bearing: number, center: [number, number]} | null>(null);
  const isIOS = Platform.OS === 'ios';
  const [pitch, setPitch] = useState(45);
  const [bearing, setBearing] = useState(45);
  const [zoom, setZoom] = useState(15);
  const [center, setCenter] = useState<[number, number]>([0, 0]);
  const [activeBasemap, setActiveBasemap] = useState('satellite');

  var basemaps: Record<string, Basemap> = {
    'satellite': { id: 'satellite', name: 'Satellite' },
    'light': { id: 'light', name: 'Light' },
    'dark': { id: 'dark', name: 'Dark' },
    'street': { id: 'street', name: 'Street' },
  }

  useEffect(() => {
    const subscription = DeviceEventEmitter.addListener('zoomToLocation', (data: any) => {
      if (loaded && webViewRef.current) {
        (webViewRef.current as any).injectJavaScript(`
          map.flyTo({
            center: [${data.longitude}, ${data.latitude}],
            zoom: ${data.zoom}
          });
          addPopup(${data.longitude}, ${data.latitude}, '${data.name}');
        `);
      }
    });
    return () => {
      subscription.remove();
    };
  }, [loaded]);

  const webViewRef = useRef(null);
  const handleMessagePress = () => {
    const getLocation = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          console.error('Permission denied');
          return;
        }

        const location = await Location.getCurrentPositionAsync({});
        const lat = location.coords.latitude;
        const lng = location.coords.longitude;

        if (webViewRef.current) {
          (webViewRef.current as any).injectJavaScript(`
            map.flyTo({
              center: [${lng}, ${lat}],
              zoom: 15
            });
          `);
        }
      } catch (error) {
        console.error('Location error:', error);
      }
    };
    getLocation();
  };

  useEffect(() => {
    if (webViewRef.current) {
      (webViewRef.current as any).injectJavaScript(`
        map.setPitch(${pitch});
        map.setBearing(${bearing});
        map.setZoom(${zoom});
      `);
    }
  }, [pitch, bearing, zoom])

  const closeAll = () => {
    setSettings(false);
    setLayers(false);
  }

  const changeBasemap = (b: Basemap) => {
    if (webViewRef.current) {
      (webViewRef.current as any).injectJavaScript(`
        changeIt('${b.id}');
      `);
    }
  }

  const watchPlane = () => {
    if (route) {
      var location = route?.point.coordinates;
      var altitude = route?.altitude;
      var speed = route?.speed;
      var bearing = route?.bearing;
      if (location && webViewRef.current) {
        (webViewRef.current as any).injectJavaScript(`
          watchPlane(${location[1]}, ${location[0]}, ${altitude}, ${speed}, ${bearing});
        `);
      }
    }
  }

  return (
    <ThemedView style={styles.container}>
      <WebView
        ref={webViewRef}
        style={styles.map}
        source={{ uri: Asset.fromModule(require('../../assets/map/index.html')).uri }}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        allowFileAccess={true}
        allowUniversalAccessFromFileURLs={true}
        sharedCookiesEnabled={true}
        thirdPartyCookiesEnabled={true}
        allowFileAccessFromFileURLs={true}
        allowContentAccess={true}
        onMessage={(event) => {
          try {
            const message = JSON.parse(event.nativeEvent.data);

            if (message.type === 'mapState') {
              var { zoom, pitch, bearing, center } = message.data;

              zoom = parseFloat(zoom.toFixed(2));
              pitch = parseFloat(pitch.toFixed(2));
              bearing = parseFloat(bearing.toFixed(2));

              setZoom(zoom);
              setPitch(pitch);
              setBearing(bearing);
              setCenter(center);
            }
            if (message.type === 'log') {
              console.log(message.data);
            }
            if (message.type === 'load') {
              setLoaded(message.data);
            }
          } catch (error) {
            console.error('Message parsing error:', error);
          }
        }}
      />
      <TouchableOpacity
        style={styles.messageButton}
        onPress={handleMessagePress}
      >
        <Ionicons name="locate" size={32} color="#fff" />
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.settingsButton}
        onPress={() => { closeAll(); setSettings(!settings) }}
      >
        <Ionicons name="settings-outline" size={24} color={settings ? '#ffc107' : '#fff'} />
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.layersButton}
        onPress={() => { closeAll(); setLayers(!layers) }}
      >
        <Ionicons name="layers-outline" size={24} color={layers ? '#ffc107' : '#fff'} />
      </TouchableOpacity>
      {
        route && (<TouchableOpacity
          style={styles.watchButton}
          onPress={() => { 
            if(follow==false){
              setOldView({ zoom, pitch, bearing, center });
              watchPlane()
            }else{
              if(oldView){
                (webViewRef.current as any).injectJavaScript(`
                  map.flyTo({
                    center: [${oldView.center[0]}, ${oldView.center[1]}],
                    zoom: ${oldView.zoom},
                    pitch: ${oldView.pitch},
                    bearing: ${oldView.bearing}
                  });
                `);
              }
            }
            setFollow(!follow); 
            
          }}
        >
          <Ionicons name="airplane-outline" size={24} color={follow ? '#ffc107' : '#fff'} />
        </TouchableOpacity>)
      }

      {
        layers && (
          <View style={[styles.layersContainer, { bottom: isIOS ? 10 : 0 }]}>
            {
              isIOS ? (<TouchableOpacity style={styles.selectContainer} onPress={() => {
                Alert.alert(
                  "Select Basemap",
                  "Please select a basemap",
                  Object.values(basemaps).map((basemap) => ({
                    text: basemap.name,
                    onPress: () => {
                      setActiveBasemap(basemap.id);
                      changeBasemap(basemap);
                    }
                  }))
                );
              }}>
                <Text style={styles.layerLabel}>Basemaps</Text>
                <View style={styles.selectBox}>
                  <Text style={[styles.layerLabel, { color: '#666' }]}>
                    {basemaps[activeBasemap]?.name || 'Select a basemap'}
                  </Text>
                  <Ionicons name="chevron-down" style={{ marginTop: 10 }} size={20} color="#666" />
                </View>

              </TouchableOpacity>) : (
                <View style={[styles.selectContainer, { height: 30, justifyContent: 'space-between' }]}>
                  <Text style={[styles.layerLabel, { width: '80%', textAlign: 'left' }]}>Basemaps</Text>
                  <Picker
                    selectedValue={activeBasemap}
                    style={styles.picker}
                    onValueChange={(itemValue) => {
                      setActiveBasemap(itemValue);
                      changeBasemap(basemaps[itemValue]);
                    }}>
                    {Object.values(basemaps).map((basemap) => (
                      <Picker.Item key={basemap.id} label={basemap.name} value={basemap.id} />
                    ))}
                  </Picker>
                  <MaterialIcons name="move-down" style={{ marginTop: 10 }} size={20} color="#666" />
                </View>
              )
            }

            <View style={styles.switchContainer}>
              <Text style={styles.layerLabel}>3D Buildings</Text>
              <Switch
                value={buildings}
                onValueChange={(value) => {
                  setBuildings(value);
                  if (webViewRef.current) {
                    (webViewRef.current as any).injectJavaScript(`
                      map.setLayoutProperty('3d-buildings', 'visibility', '${value ? 'visible' : 'none'}');
                    `);
                  }
                }}
              />
            </View>

            <View style={styles.switchContainer}>
              <Text style={styles.layerLabel}>Terrain</Text>
              <Switch
                value={terrain}
                onValueChange={(value) => {
                  setTerrain(value);
                  if (webViewRef.current) {
                    (webViewRef.current as any).injectJavaScript(`
                      map.setTerrain({ 'source': 'mapbox-dem', 'exaggeration': ${value ? 1.5 : 0} });
                    `);
                  }
                }}
              />
            </View>
          </View>
        )
      }

      {
        settings && (<View style={[styles.sliderContainer2, { bottom: isIOS ? 129 : 81 }]}>
          <Text style={styles.sliderLabel}>Zoom Level: {zoom.toFixed(2)}</Text>
          <Slider
            style={styles.slider}
            value={zoom}
            onValueChange={(value) => {
              if (webViewRef.current) {
                (webViewRef.current as any).injectJavaScript(`
                  map.setZoom(${value});
                `);
              }
            }}
            minimumValue={0}
            maximumValue={22}
            step={0.01}
          />
        </View>)
      }
      {
        settings && (<View style={[styles.sliderContainer, { bottom: isIOS ? 49 : 0 }]}>
          <View style={styles.sliderBox}>
            <Text style={styles.sliderLabel}>Pitch: {pitch.toFixed(2)}°</Text>
            <Slider
              style={styles.slider}
              value={pitch}
              onValueChange={(value) => {
                if (webViewRef.current) {
                  (webViewRef.current as any).injectJavaScript(`
                    map.setPitch(${value});
                  `);
                }
              }}
              minimumValue={0}
              maximumValue={90}
              step={1}
            />
          </View>
          <View style={styles.sliderBox}>
            <Text style={styles.sliderLabel}>Azimuth : {bearing.toFixed(2)}°</Text>
            <Slider
              style={styles.slider}
              value={bearing}
              onValueChange={(value) => {
                if (webViewRef.current) {
                  (webViewRef.current as any).injectJavaScript(`
                    map.setBearing(${value});
                  `);
                }
              }}
              minimumValue={-180}
              maximumValue={180}
              step={1}
            />
          </View>
        </View>)
      }

    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1
  },
  sliderContainer2: {
    position: 'absolute',
    bottom: 129,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    padding: 5,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingStart: 10,
    paddingEnd: 10,
  },
  sliderContainer: {
    position: 'absolute',
    bottom: 49,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    padding: 5,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingStart: 10,
    paddingEnd: 10,
  },
  sliderBox: {
    width: '50%',
  },
  sliderBox2: {
    width: '100%',
    paddingStart: 10,
    paddingEnd: 10,
  },
  sliderLabel: {
    fontSize: 16,
    marginBottom: 0,
    marginTop: 10,
    textAlign: 'center',
  },
  slider: {
    width: '100%',
    height: 40,
  },
  messageButton: {
    position: 'absolute',
    top: 20,
    right: 10,
    backgroundColor: '#061b5e',
    borderWidth: 1,
    borderColor: '#fff',
    width: 48,
    height: 48,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  layersButton: {
    position: 'absolute',
    top: 20,
    left: 65,
    backgroundColor: '#061b5e',
    borderWidth: 1,
    borderColor: '#fff',
    width: 48,
    height: 48,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  watchButton: {
    position: 'absolute',
    top: 20,
    left: 125,
    backgroundColor: '#061b5e',
    borderWidth: 1,
    borderColor: '#fff',
    width: 48,
    height: 48,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  settingsButton: {
    position: 'absolute',
    top: 20,
    left: 10,
    backgroundColor: '#061b5e',
    borderWidth: 1,
    borderColor: '#fff',
    width: 48,
    height: 48,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  layersContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 10,
    height: 200,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
  selectBox: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
  },
  selectContainer: {
    width: '100%',
    paddingStart: 10,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingEnd: 10,
    marginBottom: 10,
    marginTop: 10,
  },
  layerLabel: {
    fontSize: 16,
    marginBottom: 0,
    marginTop: 10,
    textAlign: 'center',
  },
  picker: {
    width: '100%',
    height: 200,
  },
  switchContainer: {
    width: '100%',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingStart: 10,
    paddingEnd: 10,
    marginBottom: 10,
    marginTop: 10,
  },
  switchLabel: {
    fontSize: 16,
    marginBottom: 0,
    marginTop: 10,
    textAlign: 'center',
  },
  switch: {
    width: '50%',
  },
});
