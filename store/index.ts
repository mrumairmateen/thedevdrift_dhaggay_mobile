import { configureStore, createSlice } from '@reduxjs/toolkit';
import { useDispatch, useSelector } from 'react-redux';
import type { TypedUseSelectorHook } from 'react-redux';
import { api } from '@services/api';

// Placeholder until real slices are added
const appSlice = createSlice({
  name: 'app',
  initialState: { ready: true },
  reducers: {},
});

export const store = configureStore({
  reducer: {
    app: appSlice.reducer,
    [api.reducerPath]: api.reducer,
    // Feature slices added here as we build them:
    // auth: authReducer,
    // cart: cartReducer,
  },
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }).concat(api.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
