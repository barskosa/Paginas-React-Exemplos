// Apresentação reutilizável: o pai decide quando a lista está vazia e o que fazer.
// titulo/descricao explicam o resultado; acao é o texto e aoAcao é o callback do botão.
export default function EstadoVazio({ titulo = 'Nenhum resultado', descricao, acao, aoAcao }) {
  return (
    <div className="empty-state" role="status">
      {/* O desenho é decorativo; role="status" anuncia a mensagem quando ela aparece. */}
      <span className="empty-state-icon" aria-hidden="true">
        <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M4 6h16v14H4zM7 3h10M8 10h8M9 14h6" />
        </svg>
      </span>
      <h3>{titulo}</h3>
      {/* && renderiza o conteúdo opcional apenas quando a prop foi fornecida. */}
      {descricao && <p>{descricao}</p>}
      {acao && aoAcao && <button type="button" className="button button-secondary" onClick={aoAcao}>{acao}</button>}
    </div>
  );
}
