import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {io} from 'socket.io-client';

// Define the message type
interface Message {
  _id: string;
  sender: string;
  receiver: string;
  text?: string;
  voice?: string;
  emoji?: string;
  userId?: string;
}

// Connect to backend socket server
const socket = io('http://10.0.2.2:5000');

interface ChatPageProps {
  route: {
    params: {
      user: {_id: string; firstName: string; lastName: string; userId?: string};
      currentUser: {_id: string};
    };
  };
}

const ChatPage: React.FC<ChatPageProps> = ({route}) => {
  const {user, currentUser} = route.params;
  const receiverId = user?.userId || user?._id;
  const [messages, setMessages] = useState<Message[]>([]);
  console.log(messages);
  const [input, setInput] = useState('');
  useEffect(() => {
    console.log('Connecting to socket...');
    socket.emit('joinChat', currentUser?._id);

    const receiveMessageHandler = (message: Message) => {
      console.log('Received message:', message); // Log received message
      setMessages(prev => {
        console.log('Previous messages:', prev); // Log previous messages
        return [...prev, message]; // Update state correctly
      });
    };
    const previousMessagesHandler = (msgs: Message[]) => {
      console.log('Previous messages:', msgs);
      setMessages(msgs);
    };
    socket.on('previousMessages', previousMessagesHandler);
    socket.emit('fetchMessages', {
      sender: currentUser?._id,
      receiver: receiverId,
    });
    socket.on('receiveMessage', receiveMessageHandler);

    return () => {
      socket.off('receiveMessage', receiveMessageHandler);
      socket.off('previousMessages', previousMessagesHandler);
    };
  }, [currentUser?._id, receiverId]);

  const sendMessage = () => {
    if (input.trim() === '') {
      return;
    }

    const newMessage: Message = {
      _id: Date.now().toString(),
      sender: currentUser?._id,
      receiver: receiverId,
      text: input,
    };
    console.log('Sending message:', newMessage);
    socket.emit('sendMessage', newMessage); // Emit message to server

    setMessages(prev => [...prev, newMessage]);
    setInput('');
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerText}>
          {user.firstName} {user.lastName}
        </Text>
      </View>

      {/* Chat Messages */}
      <FlatList
        data={messages}
        keyExtractor={item => item?._id}
        renderItem={({item}) => (
          <View
            style={[
              styles.messageContainer,
              item.sender === currentUser?._id
                ? styles.myMessage
                : styles.otherMessage,
            ]}>
            <Text style={styles.messageText}>{item.text}</Text>
          </View>
        )}
        contentContainerStyle={styles.chatContent}
      />

      {/* Message Input */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={input}
            onChangeText={setInput}
            placeholder="Type a message..."
          />
          <TouchableOpacity onPress={sendMessage} style={styles.sendButton}>
            <Text style={styles.sendButtonText}>Send</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ECE5DD',
  },
  header: {
    padding: 15,
    backgroundColor: '#075E54',
    alignItems: 'center',
  },
  headerText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  chatContent: {
    flexGrow: 1,
    padding: 10,
  },
  messageContainer: {
    maxWidth: '75%',
    padding: 10,
    marginVertical: 5,
    borderRadius: 10,
  },
  myMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#DCF8C6',
  },
  otherMessage: {
    alignSelf: 'flex-start',
    backgroundColor: 'white',
  },
  messageText: {
    fontSize: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 10,
    borderTopWidth: 1,
    borderColor: '#ddd',
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingHorizontal: 10,
  },
  sendButton: {
    backgroundColor: '#25D366',
    padding: 10,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default ChatPage;
