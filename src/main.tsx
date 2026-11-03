import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import 'bootstrap/dist/css/bootstrap.min.css'
import '@fontsource/space-mono/400.css'
import '@fontsource/space-mono/700.css'
import './styles/index.css'
import './styles/shop.css'
import App from './app/App.tsx'

const queryClient = new QueryClient()

const root = document.getElementById('root')
if (!root) throw new Error('index.html is missing the #root element')

createRoot(root).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </StrictMode>,
)
