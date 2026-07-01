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

export type Slot = 'SLOT_1' | 'SLOT_2' | 'SLOT_3' | 'SLOT_4' | 'SLOT_5' | 'SLOT_6' | 'SLOT_7' | 'SLOT_8' | 'SLOT_9' | 'SLOT_10' | 'SLOT_11' | 'SLOT_12'
export type VehicleType = 'CAR' | 'BIKE' | 'SCOOTER'
export type ExperienceLevel = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED'
export type InstructorLevel = 'JUNIOR' | 'INTERMEDIATE' | 'SENIOR'
export type BookingStatus = 'PENDING' | 'SCHEDULED' | 'COMPLETED' | 'CANCELLED'
export type LessonStatus = 'PENDING' | 'SCHEDULED' | 'COMPLETED' | 'CANCELLED'

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
  instructorLevel: InstructorLevel
  available: boolean
  dailyLessonCount: number
}

export interface Vehicle {
  id: number
  name: string
  vehicleNumber: string
  type: VehicleType
  active: boolean
}

export interface Lesson {
  id: number
  slot: Slot
  scheduledDate: string
  trainingDuration: number
  status: LessonStatus
  studentId: number
  instructorId: number
  vehicleId: number
  createdAt: string
  notes?: string
  priorityRank?: number
  instructor?: Instructor
  student?: Student
  vehicle?: Vehicle
}

export interface ChartDay {
  date: string
  total: number
  CAR: number
  BIKE: number
  SCOOTER: number
}

export interface ChartCount {
  status?: string
  type?: string
  count: number
}

export interface DashboardCharts {
  bookingTrends: ChartDay[]
  lessonDistribution: ChartCount[]
  bookingDistribution: ChartCount[]
  bookingByType: Array<{ type: string; count: number }>
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
  charts?: DashboardCharts
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
  student?: Student & { user?: User }
  booking?: Booking
}