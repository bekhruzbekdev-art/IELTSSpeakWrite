import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { App } from './App';
import { AuthProvider } from './auth/AuthContext';
import { AppDataProvider } from './state/AppDataContext';
import { ThemeProvider } from './theme/ThemeContext';
import './styles/global.css';

const container = document.getElementById('root');

if (!container) {
  throw new Error('Root container #root was not found in index.html');
}

createRoot(container).render(
  <StrictMode>
    <ThemeProvider>
      <AuthProvider>
        <AppDataProvider>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </AppDataProvider>
      </AuthProvider>
    </ThemeProvider>
  </StrictMode>,
);
