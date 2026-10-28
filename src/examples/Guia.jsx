// Esta página organiza a consulta; seu único estado controla a abertura do guia completo.
import { useState } from 'react';
import BlocoCodigo from '../components/BlocoCodigo.jsx';
import Icone from '../components/Icone.jsx';
// ?raw é um recurso do Vite: importa o conteúdo como texto para exibi-lo/copiar.
// Não executamos AppBase nem interpretamos o Markdown como um componente React.
import modelo from '../modelos/AppBase.jsx?raw';
import guiaCompleto from '../../docs/GUIA-PROVA.md?raw';

// Cada objeto descreve uma receita. codigo é uma string, não uma função executada.
// Os trechos ilustram padrões; imports, estados e campos devem ser adaptados ao uso.
// Deixar a lista fora do componente também a separa do estado da interface.
const receitas = [
  { titulo: 'Ler o formato certo do JSON', detalhe: 'Array na raiz, objeto com listas ou campos aninhados.', codigo: "import dados from './data/arquivo.json';\n\n// Escolha UMA das alternativas, conforme o formato do arquivo.\n// A: o JSON começa com [ ... ]:\nconst itens = dados;\n\n// B: se começa com { \"produtos\": [ ... ] }, substitua a linha acima por:\n// const itens = dados.produtos;\n\n// Campo aninhado: acesse um nível de cada vez.\nconst nomes = itens.map((item) => item.fabricante?.nome ?? 'Não informado');" },
  { titulo: 'Componentes, props e eventos', detalhe: 'O pai guarda o estado. O filho recebe dados e funções.', codigo: "function Card({ item, aoSelecionar }) {\n  return (\n    <article>\n      <h2>{item.nome}</h2>\n      <button onClick={() => aoSelecionar(item)}>Ver detalhes</button>\n    </article>\n  );\n}\n\n// Dentro do pai:\nconst [selecionado, setSelecionado] = useState(null);\nreturn itens.map((item) => (\n  <Card key={item.id} item={item} aoSelecionar={setSelecionado} />\n));" },
  { titulo: 'Pesquisa sem diferenciar acentos', detalhe: '“pratica” também encontra “prática”.', codigo: "function normalizar(valor) {\n  return String(valor ?? '').normalize('NFD')\n    .replace(/[\\u0300-\\u036f]/g, '').toLowerCase().trim();\n}\n\nconst filtrados = itens.filter((item) =>\n  normalizar(item.nome).includes(normalizar(busca))\n);" },
  { titulo: 'Combinar dois ou mais filtros', detalhe: 'Use && para exigir todas as condições.', codigo: "const filtrados = itens.filter((item) => {\n  const porNome = item.nome.toLowerCase().includes(busca.toLowerCase());\n  const porCategoria = !categoria || String(item.categoriaId) === categoria;\n  const porEstoque = !somenteDisponiveis || item.estoque > 0;\n  return porNome && porCategoria && porEstoque;\n});\n\n// Quando o JSON guarda vários tipos em cada item:\n// Ex.: item.tipos = ['Planta', 'Veneno'].\nconst porTipos = itens.filter((item) =>\n  tiposSelecionados.every((tipo) => (item.tipos ?? []).includes(tipo))\n);\n// every exige TODOS os tipos; some exige PELO MENOS UM.\n// Se os tipos forem objetos, compare tipo.id com o ID escolhido." },
  { titulo: 'Ordenar números e somar valores', detalhe: 'Copie o array antes de sort. Dê um valor inicial ao reduce.', codigo: "// Se não passou por filter, crie uma cópia antes de ordenar.\nconst porPreco = [...itens].sort((a, b) => a.preco - b.preco);\nconst porNome = [...itens].sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));\nconst total = itens.reduce((soma, item) => soma + item.preco, 0);\nconst quantidade = itens.filter((item) => item.estoque > 0).length;" },
  { titulo: 'Criar opções a partir dos dados', detalhe: 'Set remove categorias repetidas quando não existe um catálogo separado.', codigo: "// Ex.: cada item tem categoria: 'Livro', em vez de categoriaId.\nconst categorias = [...new Set(itens.map((item) => item.categoria))];\n\n<select value={categoria} onChange={(event) => setCategoria(event.target.value)}>\n  <option value=\"\">Todas</option>\n  {categorias.map((nome) => <option key={nome} value={nome}>{nome}</option>)}\n</select>" },
  { titulo: 'Converter valores do formulário', detalhe: 'Inputs retornam texto. Converta números ao salvar.', codigo: "function salvar(event) {\n  event.preventDefault();\n  // Number('') é 0: valide o campo vazio antes da conversão.\n  if (preco.trim() === '' || !Number.isFinite(Number(preco))) return;\n  const novoItem = {\n    id: crypto.randomUUID(),\n    nome: nome.trim(),\n    preco: Number(preco),\n  };\n  setItens((atuais) => [...atuais, novoItem]);\n}" },
  { titulo: 'Tratar lista vazia e valor zero', detalhe: 'Evite renderizar um zero acidental com &&.', codigo: "// Use length > 0, em vez de apenas length && ...\n{itens.length > 0 ? (\n  itens.map((item) => <p key={item.id}>{item.nome}</p>)\n) : (\n  <p>Nenhum resultado.</p>\n)}\n\n// ?? preserva valores válidos como 0 e false.\nconst estoque = item.estoque ?? 'Não informado';\nconst tags = item.tags ?? [];\nconst categoria = categorias.find((c) => c.id === item.categoriaId);\nconst nomeCategoria = categoria?.nome ?? 'Sem categoria';" },
];

export default function Guia() {
  // false evita renderizar o documento longo inicialmente. O botão alterna a flag;
  // quando ela fica true, o JSX condicional no final monta o bloco com o texto completo.
  const [mostrarGuia, setMostrarGuia] = useState(false);
  return (
    <div className="example-stack">
      {/* Este roteiro parte do arquivo real e do enunciado; as funções da prova
          ainda não são conhecidas, então os exemplos devem ser escolhidos por requisito. */}
      <div className="section-intro"><div><span className="eyebrow">UM PASSO DE CADA VEZ</span><h2>Comece pelo essencial.</h2></div><p className="muted">O conteúdo da prova ainda é uma hipótese. Use estes padrões conforme os requisitos e as tecnologias permitidas no enunciado.</p></div>
      <div className="guide-checklist panel"><h3>Quando receber o arquivo</h3><ol><li><span>1</span><div><strong>Leia o enunciado e o JSON</strong><p>Identifique a lista principal, seus campos, IDs e relações.</p></div></li><li><span>2</span><div><strong>Faça a lista aparecer</strong><p>Importe os dados e use map com uma key estável.</p></div></li><li><span>3</span><div><strong>Implemente uma regra por vez</strong><p>Busca, filtro, detalhes e as demais funções solicitadas.</p></div></li><li><span>4</span><div><strong>Confira os casos que costumam falhar</strong><p>Pesquisa vazia, nenhum resultado, listas vazias e valores zero.</p></div></li></ol></div>
      <div className="callout"><Icone nome="codigo" /><p><strong>O modelo mínimo já funciona.</strong> Abra <a href="#modelo">Modelo mínimo no menu</a> ou <a href={`${import.meta.env.BASE_URL}modelo.html`} target="_blank" rel="noreferrer">a página isolada, sem o CSS do caderno</a>. Para copiar, use o arquivo abaixo em <code>src/App.jsx</code>, ajuste o import para <code>./data/catalogo.json</code> e troque os campos conforme o JSON recebido.</p></div>
      {/* details/summary abrem e fecham conteúdo nativamente, sem precisar de outro estado.
          O modelo é exibido do arquivo real; ao copiar, o caminho do import deve acompanhar a nova pasta. */}
      <details className="recipe-details"><summary>Modelo mínimo: JSON + busca + categoria + detalhes <span className="badge">AppBase.jsx</span></summary><BlocoCodigo titulo="src/modelos/AppBase.jsx — ajuste o import ao copiar" codigo={modelo} /></details>
      <div className="guide-section-heading"><div><h3>Receitas para consultar</h3><p className="muted">Abra o padrão que você precisa e adapte os nomes dos campos.</p></div><span className="badge">{receitas.length} padrões</span></div>
      {/* map transforma o array de receitas em seções expansíveis; titulo é a chave
          estável e index só formata a numeração visual, começando por 01. */}
      <div className="recipes-list">{receitas.map((receita, index) => <details className="recipe-details" key={receita.titulo}><summary><span className="recipe-index">{String(index + 1).padStart(2, '0')}</span><span><strong>{receita.titulo}</strong><small>{receita.detalhe}</small></span><Icone nome="codigo" tamanho={18} /></summary><BlocoCodigo titulo={receita.titulo} codigo={receita.codigo} /></details>)}</div>
      <section className="panel"><div className="panel-heading"><h3>Onde encontrar cada exemplo</h3><Icone nome="livro" /></div><div className="table-wrap"><table className="data-table"><thead><tr><th>Se o enunciado pedir…</th><th>Consulte</th></tr></thead><tbody><tr><td>Busca, filtro, ordem, tabela ou paginação</td><td><a href="#catalogo">Catálogo JSON</a></td></tr><tr><td>Adicionar, editar ou remover</td><td><a href="#cadastro">Formulário e CRUD</a></td></tr><tr><td>Dados ligados por IDs e totais</td><td><a href="#relacionamentos">Relacionamentos</a></td></tr><tr><td>Carregamento assíncrono, erro e nova tentativa</td><td><a href="#carregamento">Carregar com fetch</a></td></tr><tr><td>Guardar favoritos ao recarregar</td><td><code>src/hooks/useLocalStorage.js</code></td></tr></tbody></table></div></section>
      <div className="guide-docs panel"><div><h3>O guia também está no repositório.</h3><p className="muted"><code>docs/GUIA-PROVA.md</code> reúne as explicações completas. <code>docs/REFERENCIAS.md</code> registra os arquivos estudados nos dois repositórios.</p></div><button type="button" className="button button-secondary" aria-expanded={mostrarGuia} onClick={() => setMostrarGuia(!mostrarGuia)}>{mostrarGuia ? 'Fechar guia completo' : 'Ler guia completo'}</button></div>
      {/* && monta o documento somente quando mostrarGuia é true.
          BlocoCodigo recebe Markdown como texto, mantendo o arquivo fácil de copiar. */}
      {mostrarGuia && <BlocoCodigo titulo="docs/GUIA-PROVA.md" codigo={guiaCompleto} linguagem="markdown" />}
    </div>
  );
}
