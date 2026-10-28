// Estado atualiza a tela; ref guarda o temporizador sem provocar nova renderização.
import { useEffect, useRef, useState } from 'react';

// Recebe código como texto. O componente exibe e copia esse texto, sem executá-lo.
export default function BlocoCodigo({ titulo, codigo, linguagem = 'jsx' }) {
  const [mensagem, setMensagem] = useState('');
  const temporizador = useRef(null);

  // A função devolvida pelo efeito é o cleanup: cancela a limpeza do aviso ao desmontar.
  useEffect(() => () => clearTimeout(temporizador.current), []);

  // Este callback só roda ao clicar. await espera a permissão/gravação do clipboard.
  async function copiar() {
    // Cliques repetidos reiniciam a duração do aviso em vez de acumular timers.
    clearTimeout(temporizador.current);
    try {
      await navigator.clipboard.writeText(codigo.trim());
      setMensagem('Copiado!');
    } catch {
      // A API pode estar indisponível ou bloqueada; a seleção manual continua possível.
      setMensagem('Selecione o código para copiar.');
    }
    temporizador.current = setTimeout(() => setMensagem(''), 3500);
  }

  return (
    <section className="code-block" aria-label={titulo || 'Exemplo de código'}>
      <div className="code-toolbar">
        <span className="code-title">{titulo || linguagem}</span>
        <div className="inline-actions">
          <span className="code-feedback" role="status">{mensagem}</span>
          <button type="button" className="button button-ghost" onClick={copiar} aria-label={`Copiar ${titulo || 'código'}`}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true"><rect x="8" y="8" width="12" height="13" rx="2" /><path d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3" /></svg>
            Copiar
          </button>
        </div>
      </div>
      {/* pre mantém espaços e linhas; React trata o código como texto, não como HTML. */}
      <pre className="code-content"><code data-language={linguagem}>{codigo.trim()}</code></pre>
    </section>
  );
}
