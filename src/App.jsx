// Hooks controlam a navegação e a aba ativa. Cada exemplo fica em um arquivo próprio.
import { useEffect, useState } from 'react';
import ModeloMinimo from './examples/ModeloMinimo.jsx';
import Catalogo from './examples/Catalogo.jsx';
import Cadastro from './examples/Cadastro.jsx';
import Relacionamentos from './examples/Relacionamentos.jsx';
import Carregamento from './examples/Carregamento.jsx';
import Guia from './examples/Guia.jsx';
import Icone from './components/Icone.jsx';
import BlocoCodigo from './components/BlocoCodigo.jsx';
// Recurso do Vite: leia o JSON público como texto para mostrá-lo no visualizador.
// Isso serve ao caderno de consulta; o exemplo de fetch continua lendo a URL local.
import codigoDadosPublicos from '/dados-exemplo.json?url&raw';

// Uma configuração por página evita repetir menu, título e seleção de componente.
// componente guarda a função React; arquivo aponta para o texto mostrado na aba de código.
const paginas = [
  { id: 'modelo', nome: 'Modelo mínimo', icone: 'codigo', componente: ModeloMinimo, arquivo: './modelos/AppBase.jsx', tema: 'Comece com um único componente' },
  { id: 'catalogo', nome: 'Catálogo JSON', icone: 'grade', componente: Catalogo, arquivo: './examples/Catalogo.jsx', tema: 'Busca, filtros e detalhes' },
  { id: 'cadastro', nome: 'Formulário e CRUD', icone: 'editar', componente: Cadastro, arquivo: './examples/Cadastro.jsx', tema: 'Criar, editar e remover' },
  { id: 'relacionamentos', nome: 'Relacionamentos', icone: 'relacao', componente: Relacionamentos, arquivo: './examples/Relacionamentos.jsx', tema: 'Conectar dados por ID' },
  { id: 'carregamento', nome: 'Carregar com fetch', icone: 'carregar', componente: Carregamento, arquivo: './examples/Carregamento.jsx', tema: 'useEffect, loading e erro' },
  { id: 'guia', nome: 'Guia da prova', icone: 'livro', componente: Guia, arquivo: './modelos/AppBase.jsx', tema: 'Do enunciado à implementação' },
];

// import.meta.glob é um recurso do Vite, não um hook do React.
// query: '?raw' importa o conteúdo como texto; eager: true carrega esses textos de imediato.
// Assim, o botão Copiar oferece o arquivo real, incluindo seus comentários.
// Esta parte monta o caderno e não é necessária no modelo mínimo da prova.
const arquivos = { ...import.meta.glob([
  './examples/*.jsx', './components/*.jsx', './hooks/*.js',
  './utils/*.js', './data/*.json', './modelos/*.jsx', './styles.css',
  './App.jsx', './main.jsx', '../vite.config.js', '../index.html', '../modelo.html', '../package.json',
  '../docs/*.md',
], { query: '?raw', import: 'default', eager: true }),
  '../public/dados-exemplo.json': codigoDadosPublicos,
};

function nomeArquivo(caminho) {
  // ./ identifica um arquivo dentro de src; ../ identifica um arquivo fora dela.
  return caminho.startsWith('../') ? caminho.slice(3) : `src/${caminho.slice(2)}`;
}

function paginaDoEndereco() {
  // Ex.: /#cadastro abre diretamente o exemplo de formulário.
  // Um hash desconhecido volta para o catálogo, em vez de procurar uma página inexistente.
  const id = window.location.hash.slice(1);
  return paginas.some((pagina) => pagina.id === id) ? id : 'catalogo';
}

export default function App() {
  // O inicializador é passado como função: leia o endereço apenas ao criar o estado.
  const [paginaId, setPaginaId] = useState(paginaDoEndereco);
  // Estado guarda as escolhas que podem mudar por uma ação do usuário.
  const [aba, setAba] = useState('demo');
  const [arquivo, setArquivo] = useState('./examples/Catalogo.jsx');
  // Valores derivados são calculados em cada render; não precisam de outro useState.
  const pagina = paginas.find((item) => item.id === paginaId);
  // Nome iniciado com maiúscula permite renderizar o componente escolhido como <Exemplo />.
  const Exemplo = pagina.componente;

  useEffect(() => {
    // Um clique no menu, ou Voltar/Avançar do navegador, pode alterar o hash.
    function atualizar() {
      setPaginaId(paginaDoEndereco());
      setAba('demo');
    }
    window.addEventListener('hashchange', atualizar);
    // A limpeza remove o listener ao desmontar e evita inscrições duplicadas.
    return () => window.removeEventListener('hashchange', atualizar);
  }, []);

  function abrirCodigo() {
    // Primeiro escolha o arquivo principal da página e depois mostre a aba de código.
    setArquivo(pagina.arquivo);
    setAba('codigo');
  }

  return (
    <div className="app-shell">
      {/* Atalho de teclado: leva o foco ao conteúdo sem percorrer todo o menu. */}
      <a className="skip-link" href="#conteudo" onClick={(event) => { event.preventDefault(); document.getElementById('conteudo').focus(); }}>Pular para o conteúdo</a>
      {/* A barra lateral é compartilhada por todos os exemplos. */}
      <aside className="sidebar">
        <a className="brand" href="#catalogo" aria-label="React em consulta, início">
          <span className="brand-icon"><Icone nome="codigo" tamanho={24} /></span>
          <span>react<span className="brand-light"> em consulta</span><small>SEU CADERNO DE CÓDIGO</small></span>
        </a>
        <div className="sidebar-section-label">EXEMPLOS PRÁTICOS <span>{String(paginas.filter((item) => item.id !== 'guia').length).padStart(2, '0')}</span></div>
        <nav className="main-nav" aria-label="Exemplos e guia">
          {/* map transforma a configuração em links; key usa um ID estável. */}
          {paginas.map((item, index) => (
            <a key={item.id} href={`#${item.id}`} className={`nav-link ${paginaId === item.id ? 'active' : ''} ${item.id === 'guia' ? 'nav-guide' : ''}`} aria-current={paginaId === item.id ? 'page' : undefined}>
              <Icone nome={item.icone} /><span>{item.nome}</span><span className="nav-number">{item.id !== 'guia' ? `0${index + 1}` : <Icone nome="seta" tamanho={16} />}</span>
            </a>
          ))}
        </nav>
        <div className="sidebar-note">
          <span className="note-symbol">{'{ }'}</span>
          <strong>O tema muda.<br />A lógica você já tem.</strong>
          <p>Troque os dados e os campos. Reaproveite os padrões.</p>
          <a href="#guia">Como adaptar <Icone nome="seta" tamanho={15} /></a>
        </div>
        <div className="sidebar-bottom">
          <span className="status-dot" /> Funciona com dados locais
          <div>React + Vite · JavaScript + CSS</div>
        </div>
      </aside>

      <div className="workspace">
        <header className="topbar">
          <div className="breadcrumb">Caderno de estudos <span>/</span> <strong>{pagina.nome}</strong></div>
          <a className="reference-link" href="https://github.com/joaopauloaramuni/desenvolvimento-e-integracao-de-aplicacoes-web/tree/main/PROJETOS/React" target="_blank" rel="noreferrer">Referência da disciplina <Icone nome="externo" tamanho={14} /></a>
        </header>
        <main id="conteudo" className="main-content" tabIndex={-1}>
          {/* Apresentação do caderno. Os exemplos práticos começam na example-section. */}
          <section className="page-hero">
            <div>
              <span className="eyebrow"><span className="eyebrow-line" /> APRENDA. CONSULTE. ADAPTE.</span>
              <h1>Do JSON para a tela<span>.</span></h1>
              <p>Os padrões que você precisa, com exemplos que funcionam.</p>
            </div>
            <div className="hero-code" aria-hidden="true"><span className="code-bracket">{'{'}</span><div><span className="hero-code-key">dados</span><span>.map(</span><br /><span className="hero-code-indent">item <span className="hero-code-arrow">=&gt;</span> &lt;Card /&gt;</span><br /><span>)</span></div><span className="code-bracket">{'}'}</span></div>
          </section>

          <div className="learning-path" aria-label="Etapas para resolver">
            <div><span className="step-number">01</span><span><strong>Entenda o JSON</strong><small>Campos, listas e relações</small></span></div>
            <Icone nome="seta" tamanho={16} />
            <div><span className="step-number">02</span><span><strong>Exiba os dados</strong><small>Componentes, props e map</small></span></div>
            <Icone nome="seta" tamanho={16} />
            <div><span className="step-number">03</span><span><strong>Adicione as regras</strong><small>Estado, eventos e filtros</small></span></div>
          </div>

          <section className="example-section" aria-label={pagina.nome}>
            {/* Os botões mudam a visualização; aria-pressed informa qual está selecionado. */}
            <div className="example-section-header">
              <div className="example-title"><span className="example-icon"><Icone nome={pagina.icone} tamanho={19} /></span><div><h2>{pagina.nome}</h2><p>{pagina.tema}</p></div></div>
              <div className="view-switch" aria-label="Visualização">
                <button type="button" aria-pressed={aba === 'demo'} className={aba === 'demo' ? 'selected' : ''} onClick={() => setAba('demo')}><Icone nome="grade" tamanho={15} /> Demonstração</button>
                <button type="button" aria-pressed={aba === 'codigo'} className={aba === 'codigo' ? 'selected' : ''} onClick={abrirCodigo}><Icone nome="codigo" tamanho={17} /> Código-fonte</button>
              </div>
            </div>
            {/* hidden esconde sem desmontar: consultar o código preserva os filtros e o CRUD.
                Ao navegar para outro exemplo, Exemplo muda de componente e seu estado reinicia. */}
            <div hidden={aba !== 'demo'}><Exemplo /></div>
            {/* Renderização condicional: o seletor e o bloco só aparecem na aba de código. */}
            {aba === 'codigo' && (
              <div className="example-stack source-view">
                <div className="callout"><Icone nome="codigo" /><p><strong>Este é o código real do projeto.</strong> Copie o exemplo e os arquivos que ele importa. Para começar com menos arquivos, escolha <code>modelos/AppBase.jsx</code>.</p></div>
                {/* Select controlado: value vem do estado; onChange atualiza o arquivo escolhido. */}
                <label className="field"><span className="field-label">Arquivo para consultar e copiar</span><select value={arquivo} onChange={(event) => setArquivo(event.target.value)}>{Object.keys(arquivos).sort().map((caminho) => <option key={caminho} value={caminho}>{nomeArquivo(caminho)}</option>)}</select></label>
                <BlocoCodigo titulo={nomeArquivo(arquivo)} codigo={arquivos[arquivo] ?? ''} linguagem={arquivo.split('.').pop()} />
              </div>
            )}
          </section>
          <footer className="page-footer"><span>Feito para entender o código e adaptar ao enunciado.</span><a href="https://github.com/barskosa/pokedex" target="_blank" rel="noreferrer">Baseado também na Pokédex <Icone nome="externo" tamanho={13} /></a></footer>
        </main>
      </div>
    </div>
  );
}
