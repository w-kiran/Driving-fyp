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
  scheduleResults: ScheduleResult[]
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
  scheduleResults: [],
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
  { name: string; instructorLevel: string; availableSlots: string[] },
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

export const updateInstructor = createAsyncThunk<
  Instructor,
  { id: number; data: { name: string; instructorLevel: string; availableSlots: string[] } },
  { rejectValue: string }
>('admin/updateInstructor', async ({ id, data }, { rejectWithValue }) => {
  try {
    const response = await instance.put<{ instructor: Instructor }>(`/instructors/${id}`, data)
    return response.data.instructor
  } catch (err: unknown) {
    const error = err as { response?: { data?: { message?: string } } }
    return rejectWithValue(error.response?.data?.message || 'Failed to update instructor')
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
  { name: string; vehicleNumber: string; type: 'CAR' | 'BIKE' | 'SCOOTER' },
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

export const updateVehicle = createAsyncThunk<
  Vehicle,
  { id: number; name: string; vehicleNumber: string; type: 'CAR' | 'BIKE' | 'SCOOTER' },
  { rejectValue: string }
>('admin/updateVehicle', async ({ id, name, vehicleNumber, type }, { rejectWithValue }) => {
  try {
    const response = await instance.put<{ vehicle: Vehicle }>(`/vehicles/${id}`, { name, vehicleNumber, type })
    return response.data.vehicle
  } catch (err: unknown) {
    const error = err as { response?: { data?: { message?: string } } }
    return rejectWithValue(error.response?.data?.message || 'Failed to update vehicle')
  }
})

export const deleteVehicle = createAsyncThunk<number, number, { rejectValue: string }>(
  'admin/deleteVehicle',
  async (id, { rejectWithValue }) => {
    try {
      await instance.delete(`/vehicles/${id}`)
      return id
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } }
      return rejectWithValue(error.response?.data?.message || 'Failed to delete vehicle')
    }
  }
)

export const toggleVehicleActive = createAsyncThunk<
  { id: number; active: boolean },
  number,
  { rejectValue: string }
>('admin/toggleVehicle', async (id, { rejectWithValue }) => {
  try {
    const response = await instance.patch<{ vehicle: Vehicle }>(`/vehicles/${id}/toggle`)
    return { id, active: response.data.vehicle.active }
  } catch (err: unknown) {
    const error = err as { response?: { data?: { message?: string } } }
    return rejectWithValue(error.response?.data?.message || 'Failed to update vehicle')
  }
})

export const fetchBookings = createAsyncThunk<
  Booking[],
  { sortBy?: string; sortOrder?: string } | undefined,
  { rejectValue: string }
>(
  'admin/fetchBookings',
  async (params, { rejectWithValue }) => {
    try {
      const queryParams: Record<string, string> = {}
      if (params?.sortBy) queryParams.sortBy = params.sortBy
      if (params?.sortOrder) queryParams.sortOrder = params.sortOrder
      const response = await instance.get<{ bookings: Booking[] }>('/admin/bookings', {
        params: queryParams,
      })
      return response.data.bookings
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } }
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch bookings')
    }
  }
)

export const deleteBooking = createAsyncThunk<number, number, { rejectValue: string }>(
  'admin/deleteBooking',
  async (id, { rejectWithValue }) => {
    try {
      await instance.delete(`/admin/bookings/${id}`)
      return id
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } }
      return rejectWithValue(error.response?.data?.message || 'Failed to delete booking')
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

export const fetchLessons = createAsyncThunk<
  Lesson[],
  { sortBy?: string; sortOrder?: string } | undefined,
  { rejectValue: string }
>(
  'admin/fetchLessons',
  async (params, { rejectWithValue }) => {
    try {
      const queryParams: Record<string, string> = {}
      if (params?.sortBy) queryParams.sortBy = params.sortBy
      if (params?.sortOrder) queryParams.sortOrder = params.sortOrder
      const response = await instance.get<{ lessons: Lesson[] }>('/admin/lessons', {
        params: queryParams,
      })
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

export const fetchStudents = createAsyncThunk<
  Student[],
  { sortBy?: string; sortOrder?: string } | undefined,
  { rejectValue: string }
>(
  'admin/fetchStudents',
  async (params, { rejectWithValue }) => {
    try {
      const queryParams: Record<string, string> = {}
      if (params?.sortBy) queryParams.sortBy = params.sortBy
      if (params?.sortOrder) queryParams.sortOrder = params.sortOrder
      const response = await instance.get<{ students: Student[] }>('/admin/students', {
        params: queryParams,
      })
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

export interface ScheduleResult {
  priorityRank: number
  bookingId: number
  studentId: number
  examDate: string | null
  failures: number
  lessonsCompleted: number
  preferredDate: string
  preferredSlot: string
  assignedDate: string
  assignedSlot: string
  timeRange: string
  shifted: boolean
  instructorName: string
  vehicleType: string
}

export const generateSchedule = createAsyncThunk<
  { scheduled: number; failed: number; results: ScheduleResult[] },
  void,
  { rejectValue: string }
>('admin/generateSchedule', async (_, { rejectWithValue }) => {
  try {
    const response = await instance.post<{ scheduled: number; failed: number; results: ScheduleResult[] }>('/admin/schedule/generate')
    return response.data
  } catch (err: unknown) {
    const error = err as { response?: { data?: { message?: string } } }
    return rejectWithValue(error.response?.data?.message || 'Failed to generate schedule')
  }
})

export const fetchPayments = createAsyncThunk<
  Payment[],
  { sortBy?: string; sortOrder?: string } | undefined,
  { rejectValue: string }
>(
  'admin/fetchPayments',
  async (params, { rejectWithValue }) => {
    try {
      const queryParams: Record<string, string> = {}
      if (params?.sortBy) queryParams.sortBy = params.sortBy
      if (params?.sortOrder) queryParams.sortOrder = params.sortOrder
      const response = await instance.get<{ payments: Payment[] }>('/admin/payments', {
        params: queryParams,
      })
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
      .addCase(updateInstructor.fulfilled, (state, action: PayloadAction<Instructor>) => {
        const index = state.instructors.findIndex((i) => i.id === action.payload.id)
        if (index !== -1) {
          state.instructors[index] = action.payload
        }
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
      .addCase(updateVehicle.fulfilled, (state, action: PayloadAction<Vehicle>) => {
        const index = state.vehicles.findIndex((v) => v.id === action.payload.id)
        if (index !== -1) {
          state.vehicles[index] = action.payload
        }
      })
      .addCase(deleteVehicle.fulfilled, (state, action: PayloadAction<number>) => {
        state.vehicles = state.vehicles.filter((v) => v.id !== action.payload)
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
      .addCase(deleteBooking.fulfilled, (state, action: PayloadAction<number>) => {
        state.bookings = state.bookings.filter((b) => b.id !== action.payload)
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
        state.scheduleResults = []
      })
      .addCase(generateSchedule.fulfilled, (state, action) => {
        state.scheduleGenerating = false
        state.scheduleResults = action.payload.results
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