import { configureStore } from '@reduxjs/toolkit'
import authReducer from './slices/authSlice'
import bookingReducer from './slices/bookingSlice'
import notificationReducer from './slices/notificationSlice'
import adminReducer from './slices/adminSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    booking: bookingReducer,
    notifications: notificationReducer,
    admin: adminReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch