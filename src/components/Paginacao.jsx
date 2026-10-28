// Este componente mostra os controles; o pai calcula o recorte com slice/paginarItens.
// pagina e totalPaginas são números; aoMudar(novaPagina) atualiza o estado no pai.
export default function Paginacao({ pagina, totalPaginas, aoMudar }) {
  // Uma página, ou nenhuma, dispensa navegação. Retornar null não cria elementos.
  if (totalPaginas <= 1) return null;

  return (
    <nav className="pagination" aria-label="Paginação dos resultados">
      {/* disabled evita solicitar páginas fora do intervalo pelos botões de navegação. */}
      <button type="button" className="button button-secondary" disabled={pagina <= 1} onClick={() => aoMudar(pagina - 1)}>Anterior</button>
      <div className="pagination-pages">
        {/* Array.from cria [1, 2, ...]; map cria os botões. A página atual recebe aria-current. */}
        {Array.from({ length: totalPaginas }, (_, indice) => indice + 1).map((numero) => (
          <button
            key={numero}
            type="button"
            className={`button ${numero === pagina ? 'button-primary' : 'button-ghost'}`}
            aria-label={`Página ${numero}`}
            aria-current={numero === pagina ? 'page' : undefined}
            onClick={() => aoMudar(numero)}
          >{numero}</button>
        ))}
      </div>
      <span className="pagination-summary">{pagina} de {totalPaginas}</span>
      <button type="button" className="button button-secondary" disabled={pagina >= totalPaginas} onClick={() => aoMudar(pagina + 1)}>Próxima</button>
    </nav>
  );
}
