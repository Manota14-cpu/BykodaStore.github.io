import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from '@/App';
import { initTheme } from '@/lib/theme';
import '@/styles/tailwind.css';

initTheme();

const container = document.getElementById('root');
if (!container) throw new Error('No se encontró el nodo raíz #root');

createRoot(container).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
);
