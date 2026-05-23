import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { instance } from '@/api/apiClient'
import { User, Role, AuthState } from '@/types'

const initialState: AuthState = {
  user: null,
  token: localStorage.getItem('token'),
  role: (localStorage.getItem('role') as Role) || null,
  isAuthenticated: !!localStorage.getItem('token'),
  loading: false,
  error: null,
}

interface LoginResponse {
  token: string
  user: User
}

export const login = createAsyncThunk<
  LoginResponse,
  { email: string; password: string; role: 'ADMIN' | 'STUDENT' },
  { rejectValue: string }
>('auth/login', async ({ email, password, role }, { rejectWithValue }) => {
  try {
    const url = role === 'ADMIN' ? '/auth/admin/login' : '/auth/student/login'
    const response = await instance.post<LoginResponse>(url, { email, password })
    return response.data
  } catch (err: unknown) {
    const error = err as { response?: { data?: { message?: string } } }
    return rejectWithValue(error.response?.data?.message || 'Login failed')
  }
})

export const register = createAsyncThunk<
  void,
  {
    name: string
    email: string
    password: string
    phone: string
    address: string
    dob: string
  },
  { rejectValue: string }
>('auth/register', async (data, { rejectWithValue }) => {
  try {
    await instance.post('/auth/student/register', data)
  } catch (err: unknown) {
    const error = err as { response?: { data?: { message?: string } } }
    return rejectWithValue(error.response?.data?.message || 'Registration failed')
  }
})

export const logout = createAsyncThunk('auth/logout', async () => {
  try {
    await instance.post('/auth/logout')
  } catch {
    // Continue with logout even if API fails
  } finally {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    localStorage.removeItem('role')
  }
})

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loadUser: (state) => {
      const userStr = localStorage.getItem('user')
      const role = localStorage.getItem('role') as Role
      if (userStr) {
        state.user = JSON.parse(userStr)
        state.role = role
        state.isAuthenticated = true
      }
    },
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(login.fulfilled, (state, action: PayloadAction<LoginResponse>) => {
        state.loading = false
        state.user = action.payload.user
        state.role = action.payload.user.role
        state.isAuthenticated = true
        state.token = action.payload.token
        localStorage.setItem('token', action.payload.token)
        localStorage.setItem('user', JSON.stringify(action.payload.user))
        localStorage.setItem('role', action.payload.user.role)
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload || 'Login failed'
      })
      .addCase(register.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(register.fulfilled, (state) => {
        state.loading = false
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload || 'Registration failed'
      })
      .addCase(logout.fulfilled, (state) => {
        state.user = null
        state.token = null
        state.role = null
        state.isAuthenticated = false
      })
  },
})

export const { loadUser, clearError } = authSlice.actions
export default authSlice.reducer