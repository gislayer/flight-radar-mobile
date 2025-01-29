import { StyleSheet, TouchableOpacity } from 'react-native';
import { WebView } from 'react-native-webview';
import { ThemedView } from '@/components/ThemedView';
import { Asset } from 'expo-asset';
import { Ionicons } from '@expo/vector-icons';
import { useRef } from 'react';


export default function MapScreen() {

    const webViewRef = useRef(null);

    const handleMessagePress = () => {
        // Mesaj butonuna tıklandığında yapılacak işlemler
        console.log('Mesaj butonuna tıklandı');
        if (webViewRef.current) {
            (webViewRef.current as any).injectJavaScript(`handleMessagePress("Hi this is test message");`);
        }
    };

  return ( 
    <ThemedView style={styles.container}>
      <WebView
        ref={webViewRef}
        style={styles.map}
        source={{ uri: Asset.fromModule(require('../../assets/map/index.html')).uri }}
        javaScriptEnabled={true}
        domStorageEnabled={true}
      />
      <TouchableOpacity 
        style={styles.messageButton}
        onPress={handleMessagePress}
      >
        <Ionicons name="chatbubble-ellipses" size={24} color="white" />
      </TouchableOpacity>
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
  messageButton: {
    position: 'absolute',
    bottom: 60,
    right: 10,
    backgroundColor: '#2196F3',
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5, // Android için gölge
    shadowColor: '#000', // iOS için gölge
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  }
});
