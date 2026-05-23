export type Role = 'ADMIN' | 'STUDENT'

export interface User {
  id: number
  name: string
  email: string
  role: Role
}

export interface AuthState {
  user: User | null
  token: string | null
  role: Role | null
  isAuthenticated: boolean
  loading: boolean
  error: string | null
}

export type Slot = 'MORNING' | 'AFTERNOON' | 'EVENING'
export type VehicleType = 'CAR' | 'BIKE' | 'SCOOTER'
export type ExperienceLevel = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED'
export type BookingStatus = 'PENDING' | 'SCHEDULED' | 'COMPLETED'
export type LessonStatus = 'PENDING' | 'SCHEDULED' | 'COMPLETED'

export interface Student {
  id: number
  name: string
  address: string
  dob: string
  phone: string
  userId: number
  user?: User
}

export interface Booking {
  id: number
  studentId: number
  preferredSlot: Slot
  preferredDate: string
  vehicleType: VehicleType
  trainingDuration: number
  experienceLevel: ExperienceLevel
  lessonsCompleted: number
  failures: number
  examDate?: string
  status: BookingStatus
  createdAt: string
  student?: Student
}

export interface Instructor {
  id: number
  name: string
  availableSlots: Slot[]
  dailyLessonCount: number
}

export interface Vehicle {
  id: number
  type: VehicleType
  availableSlots: Slot[]
  active: boolean
}

export interface Lesson {
  id: number
  slot: Slot
  trainingDuration: number
  status: LessonStatus
  studentId: number
  instructorId: number
  vehicleId: number
  createdAt: string
  notes?: string
  instructor?: Instructor
  student?: Student
  vehicle?: Vehicle
}

export interface DashboardStats {
  students: number
  instructors: number
  vehicles: number
  bookings: {
    pending: number
  }
  lessons: {
    scheduled: number
    completed: number
  }
  instructorLoad: Array<{
    id: number
    name: string
    dailyLessonCount: number
    totalLessons: number
  }>
}

export interface Notification {
  id: number
  userId: number
  type: string
  title: string
  message: string
  read: boolean
  createdAt: string
}

export interface Payment {
  id: number
  studentId: number
  bookingId?: number
  amount: number
  currency: string
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED'
  paymentMethod: string
  transactionId?: string
  createdAt: string
}