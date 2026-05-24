import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { instance } from '@/api/apiClient'
import { Instructor, Vehicle, DashboardStats, Booking, Lesson, Student, Payment } from '@/types'

interface AdminState {
  instructors: Instructor[]
  vehicles: Vehicle[]
  bookings: Booking[]
  lessons: Lesson[]
  students: Student[]
  payments: Payment[]
  stats: DashboardStats | null
  loading: boolean
  error: string | null
  scheduleGenerating: boolean
}

const initialState: AdminState = {
  instructors: [],
  vehicles: [],
  bookings: [],
  lessons: [],
  students: [],
  payments: [],
  stats: null,
  loading: false,
  error: null,
  scheduleGenerating: false,
}

export const fetchInstructors = createAsyncThunk<Instructor[], void, { rejectValue: string }>(
  'admin/fetchInstructors',
  async (_, { rejectWithValue }) => {
    try {
      const response = await instance.get<{ instructors: Instructor[] }>('/instructors')
      return response.data.instructors
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } }
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch instructors')
    }
  }
)

export const createInstructor = createAsyncThunk<
  Instructor,
  { name: string; availableSlots: string[] },
  { rejectValue: string }
>('admin/createInstructor', async (data, { rejectWithValue }) => {
  try {
    const response = await instance.post<{ instructor: Instructor }>('/instructors', data)
    return response.data.instructor
  } catch (err: unknown) {
    const error = err as { response?: { data?: { message?: string } } }
    return rejectWithValue(error.response?.data?.message || 'Failed to create instructor')
  }
})

export const deleteInstructor = createAsyncThunk<number, number, { rejectValue: string }>(
  'admin/deleteInstructor',
  async (id, { rejectWithValue }) => {
    try {
      await instance.delete(`/instructors/${id}`)
      return id
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } }
      return rejectWithValue(error.response?.data?.message || 'Failed to delete instructor')
    }
  }
)

export const fetchVehicles = createAsyncThunk<Vehicle[], void, { rejectValue: string }>(
  'admin/fetchVehicles',
  async (_, { rejectWithValue }) => {
    try {
      const response = await instance.get<{ vehicles: Vehicle[] }>('/vehicles')
      return response.data.vehicles
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } }
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch vehicles')
    }
  }
)

export const createVehicle = createAsyncThunk<
  Vehicle,
  { type: 'CAR' | 'BIKE' | 'SCOOTER'; availableSlots: string[] },
  { rejectValue: string }
>('admin/createVehicle', async (data, { rejectWithValue }) => {
  try {
    const response = await instance.post<{ vehicle: Vehicle }>('/vehicles', data)
    return response.data.vehicle
  } catch (err: unknown) {
    const error = err as { response?: { data?: { message?: string } } }
    return rejectWithValue(error.response?.data?.message || 'Failed to create vehicle')
  }
})

export const toggleVehicleActive = createAsyncThunk<
  { id: number; active: boolean },
  number,
  { rejectValue: string }
>('admin/toggleVehicle', async (id, { rejectWithValue }) => {
  try {
    const response = await instance.put<{ vehicle: Vehicle }>(`/vehicles/${id}`)
    return { id, active: response.data.vehicle.active }
  } catch (err: unknown) {
    const error = err as { response?: { data?: { message?: string } } }
    return rejectWithValue(error.response?.data?.message || 'Failed to update vehicle')
  }
})

export const fetchBookings = createAsyncThunk<Booking[], void, { rejectValue: string }>(
  'admin/fetchBookings',
  async (_, { rejectWithValue }) => {
    try {
      const response = await instance.get<{ bookings: Booking[] }>('/admin/bookings')
      return response.data.bookings
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } }
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch bookings')
    }
  }
)

export const updateBookingStatus = createAsyncThunk<
  { id: number; status: string },
  { id: number; status: string },
  { rejectValue: string }
>('admin/updateBookingStatus', async ({ id, status }, { rejectWithValue }) => {
  try {
    await instance.put(`/admin/bookings/${id}`, { status })
    return { id, status }
  } catch (err: unknown) {
    const error = err as { response?: { data?: { message?: string } } }
    return rejectWithValue(error.response?.data?.message || 'Failed to update booking')
  }
})

export const fetchLessons = createAsyncThunk<Lesson[], void, { rejectValue: string }>(
  'admin/fetchLessons',
  async (_, { rejectWithValue }) => {
    try {
      const response = await instance.get<{ lessons: Lesson[] }>('/admin/lessons')
      return response.data.lessons
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } }
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch lessons')
    }
  }
)

export const completeLesson = createAsyncThunk<
  { id: number; passed: boolean; notes?: string },
  { id: number; passed: boolean; notes?: string },
  { rejectValue: string }
>('admin/completeLesson', async ({ id, passed, notes }, { rejectWithValue }) => {
  try {
    await instance.put(`/admin/lessons/${id}/complete`, { passed, notes })
    return { id, passed, notes }
  } catch (err: unknown) {
    const error = err as { response?: { data?: { message?: string } } }
    return rejectWithValue(error.response?.data?.message || 'Failed to complete lesson')
  }
})

export const updateLesson = createAsyncThunk<
  Lesson,
  { id: number; slot?: string; status?: string; trainingDuration?: number; instructorId?: number; vehicleId?: number },
  { rejectValue: string }
>('admin/updateLesson', async ({ id, ...data }, { rejectWithValue }) => {
  try {
    const response = await instance.put<{ lesson: Lesson }>(`/admin/lessons/${id}`, data)
    return response.data.lesson
  } catch (err: unknown) {
    const error = err as { response?: { data?: { message?: string } } }
    return rejectWithValue(error.response?.data?.message || 'Failed to update lesson')
  }
})

export const deleteLesson = createAsyncThunk<number, number, { rejectValue: string }>(
  'admin/deleteLesson',
  async (id, { rejectWithValue }) => {
    try {
      await instance.delete(`/admin/lessons/${id}`)
      return id
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } }
      return rejectWithValue(error.response?.data?.message || 'Failed to delete lesson')
    }
  }
)

export const fetchStudents = createAsyncThunk<Student[], void, { rejectValue: string }>(
  'admin/fetchStudents',
  async (_, { rejectWithValue }) => {
    try {
      const response = await instance.get<{ students: Student[] }>('/admin/students')
      return response.data.students
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } }
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch students')
    }
  }
)

export const deleteStudent = createAsyncThunk<number, number, { rejectValue: string }>(
  'admin/deleteStudent',
  async (id, { rejectWithValue }) => {
    try {
      await instance.delete(`/admin/students/${id}`)
      return id
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } }
      return rejectWithValue(error.response?.data?.message || 'Failed to delete student')
    }
  }
)

export const fetchDashboardStats = createAsyncThunk<DashboardStats, void, { rejectValue: string }>(
  'admin/fetchStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await instance.get<{ stats: DashboardStats }>('/admin/dashboard')
      return response.data.stats
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } }
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch stats')
    }
  }
)

export const generateSchedule = createAsyncThunk<
  { scheduled: number; failed: number },
  void,
  { rejectValue: string }
>('admin/generateSchedule', async (_, { rejectWithValue }) => {
  try {
    const response = await instance.post<{ scheduled: number; failed: number }>('/admin/schedule/generate')
    return response.data
  } catch (err: unknown) {
    const error = err as { response?: { data?: { message?: string } } }
    return rejectWithValue(error.response?.data?.message || 'Failed to generate schedule')
  }
})

export const fetchPayments = createAsyncThunk<Payment[], void, { rejectValue: string }>(
  'admin/fetchPayments',
  async (_, { rejectWithValue }) => {
    try {
      const response = await instance.get<{ payments: Payment[] }>('/admin/payments')
      return response.data.payments
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } }
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch payments')
    }
  }
)

export const refundPayment = createAsyncThunk<
  { id: number; status: string },
  number,
  { rejectValue: string }
>('admin/refundPayment', async (id, { rejectWithValue }) => {
  try {
    await instance.put(`/admin/payments/${id}/refund`)
    return { id, status: 'REFUNDED' }
  } catch (err: unknown) {
    const error = err as { response?: { data?: { message?: string } } }
    return rejectWithValue(error.response?.data?.message || 'Failed to refund payment')
  }
})

const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchInstructors.pending, (state) => {
        state.loading = true
      })
      .addCase(fetchInstructors.fulfilled, (state, action: PayloadAction<Instructor[]>) => {
        state.loading = false
        state.instructors = action.payload
      })
      .addCase(createInstructor.fulfilled, (state, action: PayloadAction<Instructor>) => {
        state.instructors.push(action.payload)
      })
      .addCase(deleteInstructor.fulfilled, (state, action: PayloadAction<number>) => {
        state.instructors = state.instructors.filter((i) => i.id !== action.payload)
      })
      .addCase(fetchVehicles.fulfilled, (state, action: PayloadAction<Vehicle[]>) => {
        state.vehicles = action.payload
      })
      .addCase(createVehicle.fulfilled, (state, action: PayloadAction<Vehicle>) => {
        state.vehicles.push(action.payload)
      })
      .addCase(toggleVehicleActive.fulfilled, (state, action) => {
        const vehicle = state.vehicles.find((v) => v.id === action.payload.id)
        if (vehicle) {
          vehicle.active = action.payload.active
        }
      })
      .addCase(fetchBookings.fulfilled, (state, action: PayloadAction<Booking[]>) => {
        state.bookings = action.payload
      })
      .addCase(updateBookingStatus.fulfilled, (state, action) => {
        const booking = state.bookings.find((b) => b.id === action.payload.id)
        if (booking) {
          booking.status = action.payload.status as 'PENDING' | 'SCHEDULED' | 'COMPLETED'
        }
      })
      .addCase(fetchLessons.fulfilled, (state, action: PayloadAction<Lesson[]>) => {
        state.lessons = action.payload
      })
      .addCase(completeLesson.fulfilled, (state, action) => {
        const lesson = state.lessons.find((l) => l.id === action.payload.id)
        if (lesson) {
          lesson.status = 'COMPLETED'
        }
      })
      .addCase(updateLesson.fulfilled, (state, action: PayloadAction<Lesson>) => {
        const index = state.lessons.findIndex((l) => l.id === action.payload.id)
        if (index !== -1) {
          state.lessons[index] = action.payload
        }
      })
      .addCase(deleteLesson.fulfilled, (state, action: PayloadAction<number>) => {
        state.lessons = state.lessons.filter((l) => l.id !== action.payload)
      })
      .addCase(fetchStudents.fulfilled, (state, action: PayloadAction<Student[]>) => {
        state.students = action.payload
      })
      .addCase(deleteStudent.fulfilled, (state, action: PayloadAction<number>) => {
        state.students = state.students.filter((s) => s.id !== action.payload)
      })
      .addCase(fetchDashboardStats.fulfilled, (state, action: PayloadAction<DashboardStats>) => {
        state.stats = action.payload
      })
      .addCase(generateSchedule.pending, (state) => {
        state.scheduleGenerating = true
      })
      .addCase(generateSchedule.fulfilled, (state) => {
        state.scheduleGenerating = false
      })
      .addCase(generateSchedule.rejected, (state, action) => {
        state.scheduleGenerating = false
        state.error = action.payload || 'Failed to generate schedule'
      })
      .addCase(fetchPayments.fulfilled, (state, action: PayloadAction<Payment[]>) => {
        state.payments = action.payload
      })
      .addCase(refundPayment.fulfilled, (state, action) => {
        const payment = state.payments.find((p) => p.id === action.payload.id)
        if (payment) {
          payment.status = 'REFUNDED'
        }
      })
  },
})

export const { clearError } = adminSlice.actions
export default adminSlice.reducer