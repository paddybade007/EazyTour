import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import './hover.css'
import { GoogleOAuthProvider } from '@react-oauth/google';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* Apni Client ID yahan daalna */}
    <GoogleOAuthProvider clientId="364395717925-vdv6o1m61a5669c846gcu5vc9fpimoca.apps.googleusercontent.com">
      <App />
    </GoogleOAuthProvider>
  </React.StrictMode>,
)
