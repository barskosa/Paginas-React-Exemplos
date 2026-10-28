// ReactDOM conecta componentes React a um elemento real do HTML.
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
// App monta o caderno; importar CSS aqui aplica os estilos à aplicação inteira.
import App from './App.jsx';
import './styles.css';

// O elemento root está em index.html. render coloca a árvore React dentro dele.
createRoot(document.getElementById('root')).render(
  // StrictMode ajuda a detectar problemas em desenvolvimento.
  // Nessa fase, React pode executar renderizações e efeitos adicionais para conferir a limpeza.
  <StrictMode>
    <App />
  </StrictMode>,
);
