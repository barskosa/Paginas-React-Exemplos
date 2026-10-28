// useRef acessa o elemento real; useId conecta o título; useEffect sincroniza o dialog.
import { useEffect, useId, useRef } from 'react';

// Monte o componente apenas quando houver um item selecionado.
// O <dialog> nativo cuida do foco e impede interação com o fundo.
// titulo nomeia a janela; children é o JSX interno; aoFechar limpa a seleção no pai.
export default function Modal({ titulo, aoFechar, children }) {
  const referencia = useRef(null);
  const tituloId = useId();

  useEffect(() => {
    // O efeito roda após o elemento existir no DOM. Guarda foco e rolagem para restaurar.
    const dialogo = referencia.current;
    const focoAnterior = document.activeElement;
    const overflowAnterior = document.body.style.overflow;
    dialogo.showModal();
    document.body.style.overflow = 'hidden';

    // Ao desmontar, fecha a janela e devolve o foco se o botão anterior ainda existir.
    // Isso também mantém o comportamento correto no ciclo extra de efeitos do StrictMode.
    return () => {
      dialogo.close();
      document.body.style.overflow = overflowAnterior;
      if (focoAnterior instanceof HTMLElement && focoAnterior.isConnected) focoAnterior.focus();
    };
  }, []);

  // O clique no backdrop chega ao dialog. As coordenadas distinguem o fundo
  // da área interna; clicar no conteúdo não deve fechar a janela.
  function fecharPeloFundo(event) {
    if (event.target !== event.currentTarget) return;
    const area = event.currentTarget.getBoundingClientRect();
    if (event.clientX < area.left || event.clientX > area.right || event.clientY < area.top || event.clientY > area.bottom) aoFechar();
  }

  // Escape dispara onCancel. preventDefault deixa o pai fechar pela atualização
  // do estado, mantendo a presença do componente e a janela nativa sincronizadas.
  return (
    <dialog
      ref={referencia}
      className="modal"
      aria-labelledby={tituloId}
      onCancel={(event) => { event.preventDefault(); aoFechar(); }}
      onClick={fecharPeloFundo}
    >
      <div className="modal-header">
        <h2 id={tituloId}>{titulo}</h2>
        <button type="button" className="button button-ghost icon-button" onClick={aoFechar} aria-label="Fechar janela">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="m6 6 12 12M6 18 18 6" /></svg>
        </button>
      </div>
      <div className="modal-body">{children}</div>
    </dialog>
  );
}
