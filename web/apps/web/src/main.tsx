import { lazy, StrictMode, Suspense } from "react"
import { createRoot } from "react-dom/client"

import "@workspace/ui/globals.css"
import "./i18n"
import { createBrowserRouter, RouterProvider } from "react-router-dom"
import { ThemeProvider } from "./components/theme-provider.tsx"
import { AuthProvider } from "./context/auth-provider.tsx"
import ProtectedRoute from "./components/protected-route.tsx"

const Page = lazy(() => import("@/pages/page.tsx"))
const LoginPage = lazy(() => import("./pages/login-page.tsx"))
const AdminPage = lazy(() => import("./pages/admin-page.tsx"))
const NewsPage = lazy(() => import("@/pages/news-page.tsx"))

function withLoadingFallback(element: React.ReactNode) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      {element}
    </Suspense>
  )
}

const router = createBrowserRouter([
  { path: "/", element: withLoadingFallback(<Page />) },
  { path: "/news", element: withLoadingFallback(<NewsPage />) },
  {
    path: "/admin",
    element: (
      // Both admin and staff can access /admin
      <ProtectedRoute allowedRoles={["admin", "staff"]}>
        {withLoadingFallback(<AdminPage />)}
      </ProtectedRoute>
    ),
  },
  { path: "/login", element: withLoadingFallback(<LoginPage />) },
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
