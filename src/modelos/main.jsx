// Entrada da página modelo.html. O código para copiar está em AppBase.jsx.
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import AppBase from './AppBase.jsx';

// Sem importar styles.css: esta página usa a aparência padrão do navegador.
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AppBase />
  </StrictMode>,
);
