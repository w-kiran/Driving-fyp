import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { instance } from '@/api/apiClient'
import { Booking, Lesson } from '@/types'

interface BookingState {
  bookings: Booking[]
  lessons: Lesson[]
  loading: boolean
  error: string | null
}

const initialState: BookingState = {
  bookings: [],
  lessons: [],
  loading: false,
  error: null,
}

interface CreateBookingPayload {
  preferredSlot: 'SLOT_1' | 'SLOT_2' | 'SLOT_3' | 'SLOT_4' | 'SLOT_5' | 'SLOT_6' | 'SLOT_7' | 'SLOT_8' | 'SLOT_9' | 'SLOT_10' | 'SLOT_11' | 'SLOT_12'
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

export const fetchMyBookings = createAsyncThunk<
  Booking[],
  { sortBy?: string; sortOrder?: string } | undefined,
  { rejectValue: string }
>(
  'booking/fetchMyBookings',
  async (params, { rejectWithValue }) => {
    try {
      const queryParams: Record<string, string> = {}
      if (params?.sortBy) queryParams.sortBy = params.sortBy
      if (params?.sortOrder) queryParams.sortOrder = params.sortOrder
      const response = await instance.get<{ bookings: Booking[] }>('/students/bookings', {
        params: queryParams,
      })
      return response.data.bookings
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } }
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch bookings')
    }
  }
)

export const fetchMyLessons = createAsyncThunk<
  Lesson[],
  { sortBy?: string; sortOrder?: string } | undefined,
  { rejectValue: string }
>(
  'booking/fetchMyLessons',
  async (params, { rejectWithValue }) => {
    try {
      const queryParams: Record<string, string> = {}
      if (params?.sortBy) queryParams.sortBy = params.sortBy
      if (params?.sortOrder) queryParams.sortOrder = params.sortOrder
      const response = await instance.get<{ lessons: Lesson[] }>('/students/lessons', {
        params: queryParams,
      })
      return response.data.lessons
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } }
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch lessons')
    }
  }
)

export const editBooking = createAsyncThunk<
  Booking,
  { id: number; data: Partial<CreateBookingPayload> },
  { rejectValue: string }
>('booking/edit', async ({ id, data }, { rejectWithValue }) => {
  try {
    const response = await instance.put<{ booking: Booking }>(`/students/bookings/${id}`, data)
    return response.data.booking
  } catch (err: unknown) {
    const error = err as { response?: { data?: { message?: string } } }
    return rejectWithValue(error.response?.data?.message || 'Failed to edit booking')
  }
})

export const deleteBooking = createAsyncThunk<number, number, { rejectValue: string }>(
  'booking/delete',
  async (id, { rejectWithValue }) => {
    try {
      await instance.delete(`/students/bookings/${id}`)
      return id
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } }
      return rejectWithValue(error.response?.data?.message || 'Failed to delete booking')
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
      .addCase(editBooking.fulfilled, (state, action: PayloadAction<Booking>) => {
        const index = state.bookings.findIndex((b) => b.id === action.payload.id)
        if (index !== -1) {
          state.bookings[index] = action.payload
        }
      })
      .addCase(deleteBooking.fulfilled, (state, action: PayloadAction<number>) => {
        state.bookings = state.bookings.filter((b) => b.id !== action.payload)
      })
      .addCase(cancelBooking.fulfilled, (state, action: PayloadAction<number>) => {
        const index = state.bookings.findIndex((b) => b.id === action.payload)
        if (index !== -1) {
          state.bookings[index].status = 'CANCELLED'
        }
      })
  },
})

export const { resetBookingState } = bookingSlice.actions
export default bookingSlice.reducer