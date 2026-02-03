
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/index.css'
import App from './App.jsx'

const root = document.getElementById('root');
console.log('Root element:', root);

if (root) {
  try {
    createRoot(root).render(
      <StrictMode>
        <App />
      </StrictMode>,
    )
    console.log('React app mounted');
  } catch (err) {
    console.error('Error mounting React app:', err);
  }
} else {
  console.error('Root element not found');
}
