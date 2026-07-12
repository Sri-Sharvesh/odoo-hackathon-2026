import { QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from '@/contexts/AuthProvider'
import { ThemeProvider } from '@/contexts/ThemeProvider'
import { AppRoutes } from '@/routes/AppRoutes'
import { queryClient } from '@/services/queryClient'

/**
 * Provider composition root. Order matters:
 * Theme (paints immediately) → QueryClient (data) → Router (navigation) → Auth
 * (session) → routes. AuthProvider sits inside the router so it can use navigation hooks.
 */
export default function App() {
  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AuthProvider>
            <AppRoutes />
          </AuthProvider>
        </BrowserRouter>
      </QueryClientProvider>
    </ThemeProvider>
  )
}
