import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import App from './App.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import { RoleProvider } from './context/RoleContext.jsx';
import { ToastProvider } from './context/ToastContext.jsx';
import './styles/tokens.css';
import './styles/app.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HashRouter>
      <AuthProvider>
        <RoleProvider>
          <ToastProvider>
            <App />
          </ToastProvider>
        </RoleProvider>
      </AuthProvider>
    </HashRouter>
  </React.StrictMode>,
);
