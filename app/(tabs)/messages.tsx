import { useEffect, useState } from 'react';
import { View, Text, TextInput, FlatList, StyleSheet } from 'react-native';
import io from 'socket.io-client';
import { useLocalSearchParams } from 'expo-router';

interface ChatMessage {
  pilotId: number;
  content: string; 
  timestamp: number;
}

export default function MessagesScreen() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [messageText, setMessageText] = useState('');
  const { pilotId } = useLocalSearchParams<{ pilotId: string }>();
  const socket = io('http://localhost:2003/chat');

  useEffect(() => {
    if (!pilotId) return;

    socket.emit('join', { pilotId: Number(pilotId) });

    socket.on('message', (message: ChatMessage) => {
      setMessages(prev => [...prev, message]);
    });

    return () => {
      socket.disconnect();
    };
  }, [pilotId]);

  const sendMessage = () => {
    if (!messageText.trim() || !pilotId) return;

    const message: ChatMessage = {
      pilotId: Number(pilotId),
      content: messageText,
      timestamp: Date.now()
    };

    socket.emit('message', message);
    setMessageText('');
  };

  const renderMessage = ({ item }: { item: ChatMessage }) => (
    <View style={styles.messageContainer}>
      <Text style={styles.messageText}>{item.content}</Text>
      <Text style={styles.timestamp}>
        {new Date(item.timestamp).toLocaleTimeString()}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.timestamp.toString()}
        style={styles.messagesList}
      />
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={messageText}
          onChangeText={setMessageText}
          placeholder="Mesajınızı yazın..."
          onSubmitEditing={sendMessage}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 50
  },
  messagesList: {
    flex: 1,
    padding: 10
  },
  messageContainer: {
    backgroundColor: '#f0f0f0',
    padding: 10,
    marginVertical: 5,
    borderRadius: 10
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
