import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { instance } from '@/api/apiClient'
import { Booking, Lesson, Notification } from '@/types'

interface BookingState {
  bookings: Booking[]
  lessons: Lesson[]
  notifications: Notification[]
  loading: boolean
  error: string | null
}

const initialState: BookingState = {
  bookings: [],
  lessons: [],
  notifications: [],
  loading: false,
  error: null,
}

interface CreateBookingPayload {
  preferredSlot: 'MORNING' | 'AFTERNOON' | 'EVENING'
  preferredDate: string
  vehicleType: 'CAR' | 'BIKE' | 'SCOOTER'
  trainingDuration: number
  experienceLevel: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED'
  examDate?: string
}

export const createBooking = createAsyncThunk<
  Booking,
  CreateBookingPayload,
  { rejectValue: string }
>('booking/create', async (data, { rejectWithValue }) => {
  try {
    const response = await instance.post<{ booking: Booking }>('/students/request-new-lesson', data)
    return response.data.booking
  } catch (err: unknown) {
    const error = err as { response?: { data?: { message?: string } } }
    return rejectWithValue(error.response?.data?.message || 'Failed to create booking')
  }
})

export const fetchMyBookings = createAsyncThunk<Booking[], void, { rejectValue: string }>(
  'booking/fetchMyBookings',
  async (_, { rejectWithValue }) => {
    try {
      const response = await instance.get<{ bookings: Booking[] }>('/students/bookings')
      return response.data.bookings
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } }
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch bookings')
    }
  }
)

export const fetchMyLessons = createAsyncThunk<Lesson[], void, { rejectValue: string }>(
  'booking/fetchMyLessons',
  async (_, { rejectWithValue }) => {
    try {
      const response = await instance.get<{ lessons: Lesson[] }>('/students/lessons')
      return response.data.lessons
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } }
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch lessons')
    }
  }
)

export const fetchNotifications = createAsyncThunk<Notification[], void, { rejectValue: string }>(
  'booking/fetchNotifications',
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
  'booking/markNotificationRead',
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
  'booking/markAllNotificationsRead',
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
  'booking/deleteNotification',
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

export const cancelBooking = createAsyncThunk<number, number, { rejectValue: string }>(
  'booking/cancel',
  async (id, { rejectWithValue }) => {
    try {
      await instance.put(`/students/bookings/${id}/cancel`)
      return id
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } }
      return rejectWithValue(error.response?.data?.message || 'Failed to cancel booking')
    }
  }
)

const bookingSlice = createSlice({
  name: 'booking',
  initialState,
  reducers: {
    resetBookingState: (state) => {
      state.bookings = []
      state.lessons = []
      state.notifications = []
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createBooking.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(createBooking.fulfilled, (state, action: PayloadAction<Booking>) => {
        state.loading = false
        state.bookings.unshift(action.payload)
      })
      .addCase(createBooking.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload || 'Failed to create booking'
      })
      .addCase(fetchMyBookings.pending, (state) => {
        state.loading = true
      })
      .addCase(fetchMyBookings.fulfilled, (state, action: PayloadAction<Booking[]>) => {
        state.loading = false
        state.bookings = action.payload
      })
      .addCase(fetchMyBookings.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload || 'Failed to fetch bookings'
      })
      .addCase(fetchMyLessons.pending, (state) => {
        state.loading = true
      })
      .addCase(fetchMyLessons.fulfilled, (state, action: PayloadAction<Lesson[]>) => {
        state.loading = false
        state.lessons = action.payload
      })
      .addCase(fetchMyLessons.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload || 'Failed to fetch lessons'
      })
      .addCase(fetchNotifications.fulfilled, (state, action: PayloadAction<Notification[]>) => {
        state.notifications = action.payload
      })
      .addCase(cancelBooking.fulfilled, (state, action: PayloadAction<number>) => {
        const index = state.bookings.findIndex((b) => b.id === action.payload)
        if (index !== -1) {
          state.bookings[index].status = 'CANCELLED'
        }
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

export const { resetBookingState } = bookingSlice.actions
export default bookingSlice.reducer