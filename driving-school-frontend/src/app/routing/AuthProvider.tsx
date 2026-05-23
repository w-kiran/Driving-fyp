import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { RootState } from '@/store'
import { loadUser, logout } from '@/store/slices/authSlice'

interface AuthContextType {
  isAuthenticated: boolean
  role: string | null
  user: { id: number; name: string; email: string; role: string } | null
  logout: () => void
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  role: null,
  user: null,
  logout: () => {},
})

export const useAuth = () => useContext(AuthContext)

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const dispatch = useAppDispatch()
  const { user, role, isAuthenticated, token } = useAppSelector((state: RootState) => state.auth)
  const [initialized, setInitialized] = useState(false)

  useEffect(() => {
    const savedToken = localStorage.getItem('token')
    if (savedToken && !token) {
      dispatch(loadUser())
    }
    setInitialized(true)
  }, [dispatch, token])

  const handleLogout = () => {
    dispatch(logout())
  }

  if (!initialized) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="spinner" />
      </div>
    )
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, role, user, logout: handleLogout }}>
      {children}
    </AuthContext.Provider>
  )
}