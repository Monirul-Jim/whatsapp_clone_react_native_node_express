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
import {PermissionsAndroid} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import AudioRecorderPlayer from 'react-native-audio-recorder-player';
import RNFetchBlob from 'rn-fetch-blob';
const audioRecorderPlayer = new AudioRecorderPlayer();

// Define the message type
interface Message {
  _id: string;
  sender: string;
  receiver: string;
  text?: string;
  voice?: string;
  emoji?: string;
  userId?: string;
  timestamp?: number;
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
  const [isRecording, setIsRecording] = useState(false);
  const [audioPath, setAudioPath] = useState('');
  const [input, setInput] = useState('');
  useEffect(() => {
    async function requestPermissions() {
      try {
        const granted = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
          PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
        ]);

        if (
          granted['android.permission.RECORD_AUDIO'] ===
            PermissionsAndroid.RESULTS.GRANTED &&
          granted['android.permission.WRITE_EXTERNAL_STORAGE'] ===
            PermissionsAndroid.RESULTS.GRANTED &&
          granted['android.permission.READ_EXTERNAL_STORAGE'] ===
            PermissionsAndroid.RESULTS.GRANTED
        ) {
          console.log('All permissions granted');
        } else {
          console.log('Permissions denied');
        }
      } catch (err) {
        console.warn(err);
      }
    }

    requestPermissions();
  }, []);

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
  const startRecording = async () => {
    setIsRecording(true);
    const path = `${RNFetchBlob.fs.dirs.CacheDir}/audio_message.mp3`; // Works better on Android

    // const path = `${RNFetchBlob.fs.dirs.DocumentDir}/audio_message.mp3`; // Change to DocumentDir
    setAudioPath(path);

    const result = await audioRecorderPlayer.startRecorder(path);
    console.log('Recording started at:', result);
  };

  const stopRecording = async () => {
    setIsRecording(false);
    await audioRecorderPlayer.stopRecorder();
    sendAudioMessage(audioPath);
  };
  const sendAudioMessage = async (filePath: string) => {
    try {
      const fileExists = await RNFetchBlob.fs.exists(filePath);
      if (!fileExists) {
        console.error('File does not exist:', filePath);
        return;
      }

      const base64Audio = await RNFetchBlob.fs.readFile(filePath, 'base64');

      socket.emit('sendAudioMessage', {
        sender: currentUser._id,
        receiver: receiverId,
        audio: `data:audio/mpeg;base64,${base64Audio}`,
      });

      console.log('Audio message sent successfully');
    } catch (error) {
      console.error('Error sending audio message:', error);
    }
  };
  const playAudio = async (audioUrl: string) => {
    try {
      console.log('Playing audio:', audioUrl);
      await audioRecorderPlayer.startPlayer(audioUrl);
    } catch (error) {
      console.log('Error playing audio:', error);
    }
  };

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
  const formatTime = (timestamp: number | undefined) => {
    if (!timestamp) {
      return '';
    }
    const date = new Date(timestamp);
    let hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    return `${hours}:${minutes} ${ampm}`;
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.nameStatusContainer}>
          {' '}
          {/* Explicit container for name & status */}
          <Text style={styles.headerText}>
            {user.firstName} {user.lastName}
          </Text>
          <Text style={styles.statusText}>Hello</Text>
        </View>
        <View style={styles.iconsContainer}>
          <TouchableOpacity style={styles.iconButton}>
            <Icon name="phone" size={30} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
            <Icon name="video-camera" size={30} color="#fff" />
          </TouchableOpacity>
        </View>
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
            <View style={styles.messageRow}>
              <Text style={styles.messageText}>{item.text}</Text>
              <Text style={styles.timeText}>{formatTime(item.timestamp)}</Text>
            </View>
            {item.voice && (
              <TouchableOpacity onPress={() => playAudio(item.voice)}>
                <Text>▶️ Play Audio</Text>
              </TouchableOpacity>
            )}
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
            <Icon style={styles.sendButtonText} name="paper-plane" size={20} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={isRecording ? stopRecording : startRecording}>
            <Text>
              {isRecording ? (
                <Icon
                  style={styles.microPhone}
                  name="microphone-lines"
                  size={30}
                />
              ) : (
                <Icon style={styles.microPhone} name="microphone" size={30} />
              )}
            </Text>
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
    flexDirection: 'row',
    justifyContent: 'space-between', // Aligns items on each side
    alignItems: 'center',
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  messageText: {
    fontSize: 16,
    // ... other text styles
  },
  timeText: {
    fontSize: 12,
    color: '#888',
    marginBottom: 2,
    marginLeft: 5,
  },
  headerText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  iconButton: {
    marginLeft: 20, // Spacing between icons
  },
  microPhone: {
    marginRight: 20,
  },
  iconsContainer: {
    flexDirection: 'row',
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
  nameStatusContainer: {
    flexDirection: 'column', // Ensures name and status are stacked vertically
    justifyContent: 'center', // centers the name and status vertically in the nameStatusContainer
  },
  statusText: {
    fontSize: 14, // Adjust size as needed
    color: '#ddd', // A lighter color to differentiate
    marginTop: 2, // Spacing between name and status
  },
});

export default ChatPage;
