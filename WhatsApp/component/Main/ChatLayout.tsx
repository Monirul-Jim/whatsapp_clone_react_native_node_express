import React, {useState, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TouchableWithoutFeedback,
} from 'react-native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {createStackNavigator} from '@react-navigation/stack';

import AddUser from './AddUser/AddUser';
import ChatScreen from './ChatScreen/ChatScreen';
import ChatPage from './ChatPage/ChatPage';

// Create Navigators
const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const UpdateScreen = () => (
  <View style={styles.screen}>
    <Text>Update Screen</Text>
  </View>
);

const CommunityScreen = () => (
  <View style={styles.screen}>
    <Text>Community Screen</Text>
  </View>
);

const CallsScreen = () => (
  <View style={styles.screen}>
    <Text>Calls Screen</Text>
  </View>
);

// // New Add Screen
// const AddScreen = ({navigation}) => {
//   const {data, isLoading, error} = useGetSearchUserQuery(null);
//   return (
//     <View style={styles.screen}>
//       <Text style={styles.addScreenText}>Add New Item Screen</Text>
//     </View>
//   );
// };

const Header = ({title, showCamera, showSearch, navigation}) => {
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const dropdownRef = useRef(null);

  const toggleDropdown = () => {
    setDropdownVisible(!dropdownVisible);
  };

  const closeDropdown = () => {
    setDropdownVisible(false);
  };

  return (
    <View style={styles.header}>
      <Text style={styles.headerTitle}>{title}</Text>
      <View style={styles.headerActions}>
        {showCamera && (
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionText}>Camera</Text>
          </TouchableOpacity>
        )}
        {showSearch && (
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionText}>Search</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={styles.actionButton}
          onPress={toggleDropdown}
          ref={dropdownRef}>
          <Text style={styles.actionText}>...</Text>
        </TouchableOpacity>
        <Modal visible={dropdownVisible} transparent animationType="fade">
          <TouchableWithoutFeedback onPress={closeDropdown}>
            <View style={styles.dropdownOverlay}>
              <View style={styles.dropdownContainer}>
                <TouchableOpacity
                  style={styles.dropdownItem}
                  onPress={() => {
                    navigation.navigate('New Group');
                    closeDropdown();
                  }}>
                  <Text>New Group</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.dropdownItem}>
                  <Text>Settings</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </Modal>
      </View>
    </View>
  );
};

const TabNavigator = ({navigation}) => {
  return (
    <View style={{flex: 1}}>
      <Tab.Navigator
        screenOptions={({route}) => ({
          header: ({navigation}) => {
            let title = '';
            let showCamera = false;
            let showSearch = false;

            if (route.name === 'Chat') {
              title = 'Chats';
              showCamera = true;
              showSearch = true;
            } else if (route.name === 'Update') {
              title = 'Update';
              showSearch = true;
            } else if (route.name === 'Calls') {
              title = 'Calls';
              showSearch = true;
            }

            if (route.name === 'Community') {
              return (
                <View style={styles.communityHeader}>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => navigation.navigate('Settings')}>
                    <Text style={styles.actionText}>...</Text>
                  </TouchableOpacity>
                </View>
              );
            }

            return (
              <Header
                title={title}
                showCamera={showCamera}
                showSearch={showSearch}
                navigation={navigation}
              />
            );
          },
          tabBarActiveTintColor: 'white',
          tabBarInactiveTintColor: 'gray',
          tabBarStyle: {backgroundColor: '#075E54'},
        })}>
        <Tab.Screen name="Chat" component={ChatScreen} />
        <Tab.Screen name="Update" component={UpdateScreen} />
        <Tab.Screen name="Community" component={CommunityScreen} />
        <Tab.Screen name="Calls" component={CallsScreen} />
      </Tab.Navigator>

      {/* Floating Button inside TabNavigator */}
      <TouchableOpacity
        style={styles.floatingButton}
        onPress={() => navigation.navigate('Add')}>
        <Text style={styles.floatingButtonText}>+</Text>
      </TouchableOpacity>
    </View>
  );
};
const ChatLayout = () => (
  <Stack.Navigator screenOptions={{headerShown: false}}>
    <Stack.Screen name="Main" component={TabNavigator} />
    <Stack.Screen
      name="Add"
      component={AddUser}
      options={{headerShown: false, title: 'Add Item'}}
    />
    <Stack.Screen name="ChatPage" component={ChatPage} />
  </Stack.Navigator>
);

// const ChatLayout = () => (
//   <NavigationContainer>
//     <Stack.Navigator screenOptions={{headerShown: false}}>
//       <Stack.Screen name="Main" component={TabNavigator} />
//       <Stack.Screen
//         name="Add"
//         component={AddScreen}
//         options={{headerShown: true, title: 'Add Item'}}
//       />
//     </Stack.Navigator>
//   </NavigationContainer>
// );

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    backgroundColor: '#075E54',
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerActions: {
    flexDirection: 'row',
  },
  actionButton: {
    marginLeft: 16,
  },
  actionText: {
    color: 'white',
    fontSize: 16,
  },
  communityHeader: {
    backgroundColor: '#075E54',
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  dropdownOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    paddingTop: 50,
    paddingRight: 10,
  },
  dropdownContainer: {
    backgroundColor: 'white',
    borderRadius: 5,
    padding: 10,
  },
  dropdownItem: {
    padding: 10,
  },
  floatingButton: {
    position: 'absolute',
    right: 20,
    bottom: 80, // Adjusted to stay above the tab bar
    backgroundColor: '#25D366',
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 50,
    elevation: 5,
  },
  floatingButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  addScreenText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  searchBar: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  userItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  userText: {
    fontSize: 16,
  },
});

export default ChatLayout;
