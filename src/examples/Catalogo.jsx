// useState guarda escolhas da interface. O JSON importado é a base fixa do catálogo.
// As funções utilitárias cuidam das regras; os componentes abaixo cuidam da apresentação.
import { useState } from 'react';
import dados from '../data/catalogo.json';
import { filtrarItens, formatarMoeda, paginarItens } from '../utils/catalogo.js';
import useLocalStorage from '../hooks/useLocalStorage.js';
import CampoBusca from '../components/CampoBusca.jsx';
import FiltroSelect from '../components/FiltroSelect.jsx';
import EstadoVazio from '../components/EstadoVazio.jsx';
import Paginacao from '../components/Paginacao.jsx';
import Modal from '../components/Modal.jsx';
import BlocoCodigo from '../components/BlocoCodigo.jsx';
import Icone from '../components/Icone.jsx';

// Cada valor corresponde a uma regra de sort em utils/catalogo.js.
// Manter as opções fora do componente evita misturá-las com o estado do usuário.
const ordenacoes = [
  { valor: 'nome-asc', label: 'Nome: A → Z' }, { valor: 'nome-desc', label: 'Nome: Z → A' },
  { valor: 'preco-asc', label: 'Menor preço' }, { valor: 'preco-desc', label: 'Maior preço' },
  { valor: 'estoque-desc', label: 'Maior estoque' }, { valor: 'id-asc', label: 'ID crescente' },
];

export default function Catalogo() {
  // Adapte aqui as chaves do JSON recebido: dados.itens e dados.categorias.
  // Estes estados guardam os filtros, sem modificar os itens do arquivo original.
  const [busca, setBusca] = useState('');
  const [categoria, setCategoria] = useState('');
  const [ordenacao, setOrdenacao] = useState('nome-asc');
  const [somenteDisponiveis, setSomenteDisponiveis] = useState(false);
  const [somenteFavoritos, setSomenteFavoritos] = useState(false);
  // Página e formato mudam apenas como o resultado aparece.
  // null significa que nenhum item foi escolhido para o modal de detalhes.
  const [pagina, setPagina] = useState(1);
  const [visualizacao, setVisualizacao] = useState('cards');
  const [selecionado, setSelecionado] = useState(null);
  // O hook usa uma chave própria no navegador e devolve também um aviso de falha.
  // Persistência é opcional. Para só memória: useState([]), removendo o aviso na tela.
  const [favoritos, setFavoritos, aviso] = useLocalStorage('react-consulta:favoritos', []);

  // Dados derivados: não precisamos guardar outra lista em useState ou useEffect.
  // filtrarItens combina busca, categoria, disponibilidade e favoritos, depois ordena.
  // Só após esses passos recortamos seis itens para a página atual.
  const filtrados = filtrarItens(dados.itens, { busca, categoria, ordenacao, somenteDisponiveis, somenteFavoritos, favoritos });
  const resultado = paginarItens(filtrados, pagina, 6);
  // Esta condição habilita o botão de limpar quando há alguma restrição aplicada.
  const filtrosAtivos = busca || categoria || somenteDisponiveis || somenteFavoritos;

  // Os componentes filhos entregam o novo valor por props. Reiniciar a página
  // evita continuar, por exemplo, na página 2 de um resultado que agora só tem uma.
  function mudarFiltro(setter, valor) {
    setter(valor);
    setPagina(1);
  }

  function limparFiltros() {
    // Limpar os filtros não apaga os favoritos; apenas volta a mostrar todos os itens.
    setBusca(''); setCategoria(''); setSomenteDisponiveis(false); setSomenteFavoritos(false); setPagina(1);
  }

  function alternarFavorito(id) {
    // A versão funcional do setter recebe o estado mais recente.
    // Se o ID já existe, filter o remove; caso contrário, spread cria um novo array.
    // String permite comparar IDs lidos como texto ou número sem alterar o JSON.
    setFavoritos((atuais) => atuais.some((atual) => String(atual) === String(id))
      ? atuais.filter((atual) => String(atual) !== String(id)) : [...atuais, id]);
  }

  function nomeCategoria(id) {
    // A categoria fica em outra lista. find pode devolver undefined;
    // ?. e ?? mantêm a tela utilizável se uma referência não for encontrada.
    return dados.categorias.find((item) => String(item.id) === String(id))?.nome ?? 'Sem categoria';
  }

  function botaoFavorito(item) {
    // A mesma função desenha o botão nos cartões e na tabela.
    // aria-pressed informa se está marcado; a função no onClick só roda no clique.
    const favorito = favoritos.some((id) => String(id) === String(item.id));
    return <button type="button" className={`favorite-button ${favorito ? 'is-favorite' : ''}`} aria-label={`${favorito ? 'Remover dos' : 'Adicionar aos'} favoritos: ${item.nome}`} aria-pressed={favorito} onClick={() => alternarFavorito(item.id)}><Icone nome="favorito" tamanho={18} /></button>;
  }

  return (
    <div className="example-stack">
      {/* A contagem inicial vem diretamente do JSON, antes de qualquer filtro. */}
      <div className="catalog-intro"><div><span className="mini-label">EXEMPLO COM DADOS LOCAIS</span><h3>Biblioteca de estudo</h3><p>Busque, filtre e explore os itens do arquivo JSON.</p></div><span className="file-badge"><Icone nome="codigo" tamanho={15} /> catalogo.json <span>{dados.itens.length} itens</span></span></div>
      {/* Inputs controlados recebem o estado atual e uma função para atualizá-lo. */}
      <div className="panel filter-panel">
        <div className="filter-grid">
          <CampoBusca valor={busca} aoMudar={(valor) => mudarFiltro(setBusca, valor)} label="Buscar na biblioteca" placeholder="Nome ou ID do item..." />
          <FiltroSelect label="Categoria" valor={categoria} aoMudar={(valor) => mudarFiltro(setCategoria, valor)} opcoes={[{ valor: '', label: 'Todas as categorias' }, ...dados.categorias.map((item) => ({ valor: item.id, label: item.nome }))]} />
          <FiltroSelect label="Ordenar por" valor={ordenacao} aoMudar={(valor) => mudarFiltro(setOrdenacao, valor)} opcoes={ordenacoes} />
        </div>
        <div className="filter-bottom">
          <div className="checkbox-group"><label><input type="checkbox" checked={somenteDisponiveis} onChange={(event) => mudarFiltro(setSomenteDisponiveis, event.target.checked)} /> Somente disponíveis</label><label><input type="checkbox" checked={somenteFavoritos} onChange={(event) => mudarFiltro(setSomenteFavoritos, event.target.checked)} /> Meus favoritos <span className="count-bubble">{favoritos.length}</span></label></div>
          <button className="text-button" type="button" disabled={!filtrosAtivos} onClick={limparFiltros}>Limpar filtros</button>
        </div>
      </div>
      {/* Uma falha no localStorage gera aviso; o catálogo continua usando o estado em memória. */}
      {aviso && <p className="storage-warning" role="status">{aviso}</p>}
      <div className="results-toolbar"><p role="status"><strong>{filtrados.length}</strong> {filtrados.length === 1 ? 'item encontrado' : 'itens encontrados'} <span>de {dados.itens.length} no JSON</span></p><div className="layout-switch" aria-label="Formato da lista"><button type="button" aria-label="Exibir em cartões" aria-pressed={visualizacao === 'cards'} className={visualizacao === 'cards' ? 'selected' : ''} onClick={() => setVisualizacao('cards')}><Icone nome="grade" tamanho={16} /></button><button type="button" aria-label="Exibir em tabela" aria-pressed={visualizacao === 'tabela'} className={visualizacao === 'tabela' ? 'selected' : ''} onClick={() => setVisualizacao('tabela')}><Icone nome="lista" tamanho={18} /></button></div></div>

      {filtrados.length === 0 ? <EstadoVazio titulo="Nenhum item por aqui" descricao="Experimente outro nome, categoria ou combinação de filtros." acao="Limpar filtros" aoAcao={limparFiltros} /> : visualizacao === 'cards' ? (
        <div className="catalog-grid">{resultado.itens.map((item) => (
          // map cria um cartão por item da página; key usa o ID estável do registro.
          <article className="catalog-card" key={item.id}>
            <div className="card-top"><span className={`book-symbol category-${item.categoriaId}`}><Icone nome={item.categoriaId === 'ferramentas' ? 'terminal' : item.categoriaId === 'design' ? 'caixa' : 'livro'} tamanho={25} /></span>{botaoFavorito(item)}</div>
            <span className="card-category">{nomeCategoria(item.categoriaId)} <span>#{String(item.id).padStart(3, '0')}</span></span>
            <h4>{item.nome}</h4><p className="card-description">{item.descricao}</p>
            <div className="card-meta"><strong>{formatarMoeda(item.preco)}</strong><span className={`stock-label ${item.estoque === 0 ? 'out-of-stock' : ''}`}><span />{item.estoque > 0 ? `${item.estoque} disponíveis` : 'Indisponível'}</span></div>
            <button className="card-details" type="button" onClick={() => setSelecionado(item)}>Ver detalhes <Icone nome="seta" tamanho={16} /></button>
          </article>
        ))}</div>
      ) : (
        <div className="table-wrap panel"><table className="data-table"><caption className="sr-only">Itens da biblioteca de estudo</caption><thead><tr><th>ID</th><th>Nome</th><th>Categoria</th><th>Preço</th><th>Estoque</th><th>Ações</th></tr></thead><tbody>{resultado.itens.map((item) => <tr key={item.id}><td>#{item.id}</td><td><strong>{item.nome}</strong></td><td>{nomeCategoria(item.categoriaId)}</td><td>{formatarMoeda(item.preco)}</td><td>{item.estoque}</td><td><div className="inline-actions">{botaoFavorito(item)}<button type="button" className="button button-ghost" onClick={() => setSelecionado(item)} aria-label={`Detalhes de ${item.nome}`}>Detalhes</button></div></td></tr>)}</tbody></table></div>
      )}
      {/* Cartões e tabela usam resultado.itens; a contagem acima usa todos os filtrados.
          A paginação só aparece quando existe resultado, e devolve a página por props. */}
      {filtrados.length > 0 && <Paginacao pagina={resultado.pagina} totalPaginas={resultado.totalPaginas} aoMudar={setPagina} />}
      <div className="pattern-strip"><span className="pattern-label"><Icone nome="codigo" tamanho={17} /> O QUE ESTE EXEMPLO PRATICA</span><div>{['import JSON', 'useState', 'props', 'filter + sort', 'map', 'localStorage'].map((tag) => <code key={tag}>{tag}</code>)}</div></div>
      <details className="recipe-details"><summary>Entenda a lógica: filtrar → ordenar → paginar → exibir <Icone nome="codigo" tamanho={17} /></summary><BlocoCodigo titulo="O fluxo dos dados" codigo={'// 1. Estado guarda as escolhas do usuário.\nconst [busca, setBusca] = useState(\'\');\n\n// 2. A lista é calculada a partir dos dados e das escolhas.\nconst filtrados = dados.itens\n  .filter((item) => item.nome.toLowerCase().includes(busca.toLowerCase()))\n  .sort((a, b) => a.nome.localeCompare(b.nome, \'pt-BR\'));\n\n// 3. filter cria outro array: sort não altera o JSON original.\n// 4. map transforma cada item em um componente.\nreturn filtrados.map((item) => <p key={item.id}>{item.nome}</p>);'} /></details>

      {selecionado && <Modal titulo={selecionado.nome} aoFechar={() => setSelecionado(null)}><div className="detail-content"><span className="badge">{nomeCategoria(selecionado.categoriaId)}</span><p>{selecionado.descricao}</p><dl className="detail-grid"><div><dt>Identificador</dt><dd>#{String(selecionado.id).padStart(3, '0')}</dd></div><div><dt>Preço</dt><dd>{formatarMoeda(selecionado.preco)}</dd></div><div><dt>Estoque</dt><dd>{selecionado.estoque} unidades</dd></div></dl><div className="tag-list">{selecionado.tags.length ? selecionado.tags.map((tag) => <span className="badge" key={tag}>{tag}</span>) : <span className="muted">Este item não tem tags.</span>}</div><BlocoCodigo titulo="Objeto original no JSON" linguagem="json" codigo={JSON.stringify(selecionado, null, 2)} /></div></Modal>}
    </div>
  );
}
