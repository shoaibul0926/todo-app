import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { createLocalStorageAdapter } from './storage/adapter'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App adapter={createLocalStorageAdapter()} />
  </StrictMode>,
)
