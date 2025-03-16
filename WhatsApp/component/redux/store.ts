// // src/store.ts
// import {configureStore} from '@reduxjs/toolkit';
// import thunk from 'redux-thunk';
// import rootReducer from './reducers';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import {persistStore, persistReducer} from 'redux-persist';

// const persistConfig = {
//   key: 'root', // Key for AsyncStorage
//   storage: AsyncStorage,
//   // whitelist: ['someReducer'], // Array of reducers to persist (optional)
//   // blacklist: ['anotherReducer'], // Array of reducers to not persist (optional)
// };

// const persistedReducer = persistReducer(persistConfig, rootReducer);

// const store = configureStore({
//   reducer: persistedReducer,
//   middleware: getDefaultMiddleware =>
//     getDefaultMiddleware({
//       serializableCheck: {
//         ignoredActions: ['persist/PERSIST'],
//       },
//     }).concat(thunk),
// });

// export const persistor = persistStore(store);

// export type RootState = ReturnType<typeof store.getState>;
// export type AppDispatch = typeof store.dispatch;

// export default store;

import {configureStore} from '@reduxjs/toolkit';
import authReducer from '../redux/feature/authSlice';
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage'; // ✅ Correct Storage for React Native
import {baseApi} from './api/baseApi';

// Persist Configs
const persistConfig = {
  key: 'auth',
  storage: AsyncStorage, // ✅ Use AsyncStorage instead of localStorage
};

// Create Persisted Reducers
const persistedAuthReducer = persistReducer(persistConfig, authReducer);

// Store Configuration
export const store = configureStore({
  reducer: {
    auth: persistedAuthReducer,
    [baseApi.reducerPath]: baseApi.reducer,
  },
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }).concat(baseApi.middleware),
});

// Export Store & Persistor
export const persistor = persistStore(store);

// Type Definitions
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
