import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { combineReducers } from 'redux';
import authReducer from './slices/authSlice';
import promptReducer from './slices/promptSlice';
import templateReducer from './slices/templateSlice';
import testReducer from './slices/testSlice';
import analyticsReducer from './slices/analyticsSlice';
import documentsReducer from './slices/documentSlice';

const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['auth'], // Only persist auth
};

const rootReducer = combineReducers({
  auth: authReducer,
  prompt: promptReducer,
  template: templateReducer,
  test: testReducer,
  analytics: analyticsReducer,
  documents: documentsReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
