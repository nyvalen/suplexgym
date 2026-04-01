import { StrictMode } from "react"
import { createRoot } from "react-dom/client"

import "@workspace/ui/globals.css"
import { createBrowserRouter, RouterProvider } from "react-router-dom"
import { ThemeProvider } from "./components/theme-provider.tsx"
import { AuthProvider } from "./context/auth-provider.tsx"
import { SidebarProvider } from "@workspace/ui/components/sidebar"
import Page from "@/pages/page.tsx"
import LoginPage from "./pages/login-page.tsx"
import AdminPage from "./pages/admin-page.tsx"
import ProtectedRoute from "./components/protected-route.tsx"
import NewsPage from "./pages/news-page.tsx"
const router = createBrowserRouter([
  { path: "/", element: <Page /> },
  { path: "/news", element: <NewsPage /> },
  {
    path: "/admin",
    element: (
      <ProtectedRoute allowedRoles={"admin"}>
        <AdminPage />
      </ProtectedRoute>
    ),
  },
  { path: "/login", element: <LoginPage /> },
  // { path: "*", element: <NotFoundPage /> },
])

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AuthProvider>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <RouterProvider router={router} />
      </ThemeProvider>
    </AuthProvider>
  </StrictMode>
)
