import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';

// Arquivo de estilos global do Tailwind (Será gerado pelo PostCSS/Tailwind, mas incluímos o import para simular)
// import './index.css';

// Configurações e Renderização
const container = document.getElementById('root');
const root = createRoot(container);

// O código App.jsx precisa ser renomeado para App.jsx
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
