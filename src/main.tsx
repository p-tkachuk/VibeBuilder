import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ReactFlowProvider } from '@xyflow/react'
import './index.css'
import App from './App.tsx'
import { ServiceLocator } from './services/ServiceLocator'

// Initialize the service locator with all services
ServiceLocator.initialize();

// IMPORTANT: ReactFlowProvider is required for React Flow to work properly
// React Flow uses Zustand for state management and requires this provider
// DO NOT remove this provider or the app will break with Zustand errors
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ReactFlowProvider>
      <App />
    </ReactFlowProvider>
  </StrictMode>,
)
