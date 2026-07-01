import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { instance } from '@/api/apiClient'
import { Notification } from '@/types'

interface NotificationState {
  notifications: Notification[]
  loading: boolean
  error: string | null
}

const initialState: NotificationState = {
  notifications: [],
  loading: false,
  error: null,
}

export const fetchNotifications = createAsyncThunk<Notification[], void, { rejectValue: string }>(
  'notifications/fetch',
  async (_, { rejectWithValue }) => {
    try {
      const response = await instance.get<{ notifications: Notification[] }>('/students/notifications')
      return response.data.notifications
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } }
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch notifications')
    }
  }
)

export const markNotificationRead = createAsyncThunk<number, number, { rejectValue: string }>(
  'notifications/markRead',
  async (id, { rejectWithValue }) => {
    try {
      await instance.put(`/students/notifications/${id}/read`)
      return id
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } }
      return rejectWithValue(error.response?.data?.message || 'Failed to mark notification as read')
    }
  }
)

export const markAllNotificationsRead = createAsyncThunk<void, void, { rejectValue: string }>(
  'notifications/markAllRead',
  async (_, { rejectWithValue }) => {
    try {
      await instance.put('/students/notifications/read-all')
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } }
      return rejectWithValue(error.response?.data?.message || 'Failed to mark all notifications as read')
    }
  }
)

export const deleteNotification = createAsyncThunk<number, number, { rejectValue: string }>(
  'notifications/delete',
  async (id, { rejectWithValue }) => {
    try {
      await instance.delete(`/students/notifications/${id}`)
      return id
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } }
      return rejectWithValue(error.response?.data?.message || 'Failed to delete notification')
    }
  }
)

const notificationSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchNotifications.fulfilled, (state, action: PayloadAction<Notification[]>) => {
        state.loading = false
        state.notifications = action.payload
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload || 'Failed to fetch notifications'
      })
      .addCase(markNotificationRead.fulfilled, (state, action: PayloadAction<number>) => {
        const notification = state.notifications.find((n) => n.id === action.payload)
        if (notification) {
          notification.read = true
        }
      })
      .addCase(markAllNotificationsRead.fulfilled, (state) => {
        state.notifications.forEach((n) => { n.read = true })
      })
      .addCase(deleteNotification.fulfilled, (state, action: PayloadAction<number>) => {
        state.notifications = state.notifications.filter((n) => n.id !== action.payload)
      })
  },
})

export default notificationSlice.reducer
