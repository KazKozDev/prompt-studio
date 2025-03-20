import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import authReducer from './slices/authSlice';
import promptReducer from './slices/promptSlice';
import templateReducer from './slices/templateSlice';
import testReducer from './slices/testSlice';
import analyticsReducer from './slices/analyticsSlice';
import documentsReducer from './slices/documentSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    prompt: promptReducer,
    template: templateReducer,
    test: testReducer,
    analytics: analyticsReducer,
    documents: documentsReducer
  },
  middleware: (getDefaultMiddleware) => 
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
