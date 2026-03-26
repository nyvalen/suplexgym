import { Navigate } from "react-router-dom"

const ProtectedRoute = ({ allowedRoles, children }) => {
  //   function getUserRole() {
  //     return fetch("http://localhost:5103/api/user/profile", {
  //       method: "GET",
  //       headers: {
  //         "Content-Type": "application/json",
  //         Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
  //       },
  //     })
  //       .then((response) => response.json())
  //       .then((data) => {
  //         console.log("User Role:", data.role)
  //         console.log("Allowed Roles:", allowedRoles)
  //         console.log(data)

  //         if (allowedRoles !== data.role) {
  //           return <Navigate to="/" replace />
  //         }
  //       })
  //       .catch((error) => {
  //         console.error("Error fetching user role:", error)
  //         return null
  //       })
  //   }
  //   getUserRole()
  function decodeToken(token) {
    const payload = token.split(".")[1]

    const decoded = atob(payload)

    return JSON.parse(decoded)
  }

  const token = localStorage.getItem("accessToken")

  const data = token !== undefined && token !== "" ? decodeToken(token) : ""

  console.log(data)
  console.log("User Role:", data.role)
  console.log("Allowed Roles:", allowedRoles)
  if (allowedRoles !== data.role) {
    return <Navigate to="/" replace />
  }
  return children
}

export default ProtectedRoute
