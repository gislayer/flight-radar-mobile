import { useEffect, useRef, useState } from 'react';
import { View, Text, TextInput, FlatList, StyleSheet, Platform, Pressable, DeviceEventEmitter } from 'react-native';
import io from 'socket.io-client';
import { FlightData, Pilot, SendMessage } from '@/lib/types';
import { RootState } from '@/store/store';
import { useSelector } from 'react-redux';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function MessagesScreen() {
  const route = useSelector((state: RootState) => state.route.route) as FlightData;
  const [messages, setMessages] = useState<SendMessage[]>([]);
  const [messageText, setMessageText] = useState('');
  const isIOS = Platform.OS === 'ios';
  const [pilot, setPilotId] = useState<Pilot>(route?.pilot);
  const socketRef = useRef<any>(null);
  const router = useRouter();

  useEffect(() => {
    if(route){
      setPilotId(route.pilot);
    }else{
      setPilotId(null as any);
    }
  }, [route]);

  useEffect(() => {
    if(!pilot) return;

    if (socketRef.current) {
      socketRef.current.disconnect();
    }

    socketRef.current = io(Platform.select({
      ios: 'http://localhost:2003/chat',
      android: 'http://192.168.1.23:2003/chat'
    }));

    socketRef.current.on('connect', () => {
      console.log('Socket connected');
      joinToChat();
    });

    socketRef.current.on('message', (message: SendMessage) => {
      console.log('Message received:', message);
      setMessages(prev => [...prev, message]);
    });

    socketRef.current.on('joined', (data: any) => {
      console.log('User Joined : ', data['user']['name']);
    });

    socketRef.current.on('left', (data: any) => {
      console.log('User Left : ', data['user']['name']);
    });

    socketRef.current.on('connect_error', (error: any) => {
      console.log('Socket connection error', error);
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [pilot]);

  const joinToChat = () => {
    if (!pilot) return;
    console.log('Joining chat with pilotId:', pilot.id);
    setMessages([]);
    socketRef.current.emit('join', {
      route_id: pilot.id,
      socketId: socketRef.current.id,
      id: pilot.id,
      name: pilot.name,
    });
  }

  const sendMessage = () => {
    if (!messageText.trim() || !pilot.id) return;
    const message: SendMessage = {
      route_id: Number(pilot.id),
      user_id: Number(pilot.id),
      sender: pilot.name,
      message: {
        type: 'text',
        text:{
          type: 'text',
          data:messageText.toString()
        },
        timestamp: Date.now()
      }
    };
    socketRef.current.emit('message', message);
    setMessageText('');
  };

  const renderMessage = ({ item }: { item: SendMessage }) => {
    if(item.message.type === 'text'){
      return (
        <View style={styles.messageContainer}>
          <Text style={styles.messageText}>{item.message.text?.data}</Text>
          <Text style={styles.timestamp}>
            {new Date(item.message.timestamp).toLocaleTimeString()}
          </Text>
        </View>
      )
    }
    if(item.message.type === 'location'){
      return (
        <View style={styles.messageContainer}>
          <Text style={styles.messageText}>Location Name : {item.message.location?.data.name}</Text>
          <View style={[styles.buttonContainer,{justifyContent:'flex-start'}]}>
            <Pressable 
                style={[styles.button, { backgroundColor: '#333' }]}
                onPress={() => {
                  router.push('/(tabs)');
                  DeviceEventEmitter.emit('zoomToLocation', {
                    latitude: item.message.location?.data.latitude,
                    longitude: item.message.location?.data.longitude,
                    name: item.message.location?.data.name,
                    zoom: 15
                  });
                  socketRef.current.emit('message', {
                    route_id: Number(pilot.id),
                    user_id: Number(pilot.id), 
                    sender: pilot.name,
                    message: {
                      type: 'text',
                      text: {
                        type: 'text',
                        data: `${pilot.name} Clicked Go to Location Button`
                      },
                      timestamp: Date.now()
                    }
                  });
                }}>
                <Text style={styles.buttonText}>Go to Location</Text>
              </Pressable>
          </View>
          <Text style={styles.timestamp}>
            {new Date(item.message.timestamp).toLocaleTimeString()}
          </Text>
        </View>
      )
    }
    if(item.message.type === 'command'){
      return (
        <View style={styles.messageContainer}>
          <Text style={styles.messageText}>{item.message.command?.data.question}</Text>
          <View style={styles.buttonContainer}>
            <Pressable 
              style={[styles.button, { backgroundColor: '#4CAF50' }]}
              onPress={() => {
                socketRef.current.emit('message', {
                  route_id: Number(pilot.id),
                  user_id: Number(pilot.id), 
                  sender: pilot.name,
                  message: {
                    type: 'text',
                    text: {
                      type: 'text',
                      data: `Perfect, ${pilot.name} Answered : ${item.message.command?.data.true_answer}, your question (${item.message.command?.data.question})`
                    },
                    timestamp: Date.now()
                  }
                });
              }}>
              <Text style={styles.buttonText}>{item.message.command?.data.true_answer}</Text>
            </Pressable>
            
            <Pressable
              style={[styles.button, { backgroundColor: '#f44336' }]}
              onPress={() => {
                socketRef.current.emit('message', {
                  route_id: Number(pilot.id),
                  user_id: Number(pilot.id),
                  sender: pilot.name,
                  message: {
                    type: 'text', 
                    text: {
                      type: 'text',
                      data: `Unfortunatly, ${pilot.name} Answered : ${item.message.command?.data.false_answer}, your question )${item.message.command?.data.question})`
                    },
                    timestamp: Date.now()
                  }
                });
              }}>
              <Text style={styles.buttonText}>{item.message.command?.data.false_answer}</Text>
            </Pressable>
          </View>
          <Text style={styles.timestamp}>
            {new Date(item.message.timestamp).toLocaleTimeString()}
          </Text>
        </View>
      )
    }
    return null;
  }

  if(!pilot) {
    return (
    <View style={{flex:1, justifyContent:'center', alignItems:'center'}}>
      <Ionicons name="warning" size={64} color="#ffc107" />
      <Text style={{fontSize:18, marginTop:16, marginBottom:24}}>Please Select a Route</Text>
      <Pressable 
        style={{
          backgroundColor:'#2196F3',
          paddingHorizontal:24,
          paddingVertical:12,
          borderRadius:8
        }}
        onPress={() => {
          router.push('/(tabs)/flights');
        }}
      >
        <Text style={{color:'#fff', fontSize:16}}>Back to Flight</Text>
      </Pressable>
    </View>
    )
  }

  return (
    <View style={[styles.container,{height:isIOS ? 620 : '100%'}]}>
      <View style={styles.header}>
        <Text style={styles.headerText}>
          Tower Messages
        </Text>
      </View>
      <FlatList
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.message.timestamp.toString()}
        style={styles.messagesList}
      />
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={messageText}
          onChangeText={setMessageText}
          placeholder="Write message..."
          onSubmitEditing={sendMessage}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  buttonContainer:{
    marginTop:20,
    marginBottom:5,
    flexDirection:'row',
    justifyContent:'flex-end',
    width:'100%',
    gap:10
  },
  button:{
    padding:10,
    borderRadius:10,
    width:'40%'
  },
  buttonText:{
    color:'#fff',
    fontWeight:'bold',
    textAlign:'center'
  },
  header: {
    padding: 16,
    backgroundColor: '#333',
    justifyContent: 'center',
  },
  headerText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff'
  },
  container: {
    position:'absolute',
    top:0,
    bottom:0,
    left:0,
    right:0,
    flex: 1,
    height:620,
    backgroundColor: '#f9f9f9',
    paddingTop: 50
  },
  messagesList: {
    flex: 1,
    padding: 10
  },
  messageContainer: {
    backgroundColor: '#fff',
    padding: 10,
    minHeight: 60,
    marginVertical: 5,
    borderRadius: 10,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  messageText: {
    fontSize: 16
  },
  timestamp: {
    fontSize: 12,
    color: '#666',
    marginTop: 5
  },
  inputContainer: {
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#ddd'
  },
  input: {
    backgroundColor: '#f0f0f0',
    padding: 10,
    borderRadius: 20,
    fontSize: 16
  }
});
