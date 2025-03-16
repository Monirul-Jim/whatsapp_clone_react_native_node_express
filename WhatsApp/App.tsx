import React from 'react';
import {SafeAreaView} from 'react-native-safe-area-context';
import {Provider} from 'react-redux';
import {PersistGate} from 'redux-persist/integration/react';
import {persistor, store} from './component/redux/store';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';

import ChatLayout from './component/Main/ChatLayout';
import SignIn from './component/Authentication/SignIn';
import SignUp from './component/Authentication/SignUp';

const Stack = createStackNavigator();

const App = () => {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <NavigationContainer>
          <SafeAreaView style={{flex: 1}}>
            <Stack.Navigator initialRouteName="Login">
              <Stack.Screen name="Login" component={SignIn} />
              <Stack.Screen name="SignUp" component={SignUp} />
              <Stack.Screen
                name="Chat"
                component={ChatLayout}
                // options={{headerShown: false}}
              />
            </Stack.Navigator>
          </SafeAreaView>
        </NavigationContainer>
      </PersistGate>
    </Provider>
  );
};

export default App;
