import { Navigate } from "react-router-dom"

function decodeToken(token: string) {
  try {
    const payload = token.split(".")[1]
    return JSON.parse(atob(payload))
  } catch {
    return null
  }
}

// Roles that are allowed to access the admin panel
const PRIVILEGED_ROLES = ["admin", "staff"]

const ProtectedRoute = ({
  allowedRoles,
  children,
}: {
  allowedRoles: string | string[]
  children: React.ReactNode
}) => {
  const token = localStorage.getItem("accessToken")
  if (!token) return <Navigate to="/login" replace />

  const data = decodeToken(token)
  if (!data) return <Navigate to="/login" replace />

  const userRole: string = data.role ?? ""
  const allowed = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles]

  if (!allowed.includes(userRole)) {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}

export default ProtectedRoute
