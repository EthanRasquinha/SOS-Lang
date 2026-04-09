import { Navigate } from "react-router-dom"
import { useAuth } from "./AuthContext" 

// A simple protected route component that checks if the user is authenticated

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()

  if (loading) return <div>Loading...</div>

  if (!user) {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}