import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import AppRoutes from './routes/AppRoutes';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { UIProvider } from "./context/UIContext";

export default function App(){
  return (
    <BrowserRouter> {/* ✅ Wrap everything with BrowserRouter */}
      <UIProvider>
        <AuthProvider>
          <ThemeProvider>
            <div className="">
              <AppRoutes />
            </div>
          </ThemeProvider>
        </AuthProvider>
      </UIProvider>
    </BrowserRouter>
  );
}
