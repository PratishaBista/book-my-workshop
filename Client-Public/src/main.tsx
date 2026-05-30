import React from 'react'
import ReactDOM from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import App from './App.tsx'
import './index.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 60 * 1000,   // 1 hour data stays fresh for the whole session
      gcTime: 60 * 60 * 1000,      // 1 hour keep unused cache in memory
      retry: 1,                     // retry once on failure
      refetchOnWindowFocus: false,  // don't spam API when user switches tabs
    },
  },
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </React.StrictMode>,
)