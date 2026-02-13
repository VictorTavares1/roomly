import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { BrowserRouter } from 'react-router-dom'
// O import já está aqui, perfeito:
import { AuthProvider } from './context/AuthContext'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* ADICIONA O AUTHPROVIDER AQUI A ENVOLVER TUDO  */}
    <AuthProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </AuthProvider>
    {/* FECHA O AUTHPROVIDER AQUI */}
  </React.StrictMode>,
)