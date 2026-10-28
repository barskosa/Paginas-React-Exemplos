// O estado guarda a lista/formulário. A ref permite focar o input sem procurar seu ID.
// Dados, validação e componentes são separados para reaproveitar cada responsabilidade.
import { useRef, useState } from 'react';
import dados from '../data/catalogo.json';
import { formatarMoeda, validarItem } from '../utils/catalogo.js';
import BlocoCodigo from '../components/BlocoCodigo.jsx';
import EstadoVazio from '../components/EstadoVazio.jsx';
import Modal from '../components/Modal.jsx';

// Até os campos numéricos começam como texto: é assim que os inputs entregam seus valores.
const formularioVazio = { nome: '', categoriaId: '', preco: '', estoque: '' };
// Esta string é material de consulta exibido por BlocoCodigo; não é executada pelo app.
const codigo = `// Criar: um novo array, com o novo item no final.
setItens((atuais) => [...atuais, novoItem]);

// Editar: substitua somente o item de mesmo ID.
setItens((atuais) => atuais.map((item) =>
  String(item.id) === String(idEmEdicao)
    ? { ...item, ...camposValidados }
    : item
));

// Excluir: mantenha todos, exceto o item escolhido.
setItens((atuais) => atuais.filter((item) =>
  String(item.id) !== String(idParaExcluir)
));`;

export default function Cadastro() {
  // slice cria outro array com três registros. Todas as alterações abaixo criam
  // novos arrays/objetos, portanto os registros importados do JSON ficam preservados.
  // A função inicializadora só prepara a lista quando este componente é montado.
  const [itens, setItens] = useState(() => dados.itens.slice(0, 3));
  // campos controla os inputs; erros associa cada mensagem ao nome do campo.
  const [campos, setCampos] = useState(formularioVazio);
  const [erros, setErros] = useState({});
  // Sem ID em edição o formulário cria um item. O item para excluir só abre
  // a confirmação; a lista é alterada depois do clique em Confirmar exclusão.
  const [idEmEdicao, setIdEmEdicao] = useState(null);
  const [itemParaExcluir, setItemParaExcluir] = useState(null);
  // A mensagem confirma a última operação; a ref aponta para o input de nome.
  const [mensagem, setMensagem] = useState('');
  const nomeRef = useRef(null);

  function alterarCampo(event) {
    // name corresponde à chave do objeto campos. [name] atualiza só essa chave,
    // preservando as outras com spread; o erro desse campo é limpo ao digitar.
    const { name, value } = event.target;
    setCampos((atuais) => ({ ...atuais, [name]: value }));
    setErros((atuais) => ({ ...atuais, [name]: undefined }));
    setMensagem('');
  }

  function limpar() {
    // A mesma ação é usada ao terminar uma operação ou cancelar a edição.
    setCampos(formularioVazio);
    setErros({});
    setIdEmEdicao(null);
  }

  function salvar(event) {
    // Impede o submit HTML de recarregar a página e perder o estado em memória.
    event.preventDefault();
    // A validação devolve um objeto vazio quando está tudo certo. Havendo erros,
    // o foco vai para o primeiro campo inválido e return impede salvar dados ruins.
    const encontrados = validarItem(campos);
    setErros(encontrados);
    const primeiroCampoInvalido = Object.keys(encontrados)[0];
    if (primeiroCampoInvalido) {
      event.currentTarget.elements.namedItem(primeiroCampoInvalido)?.focus();
      return;
    }

    // Só convertemos após validar: Number('') seria 0, ocultando um campo não preenchido.
    // trim remove espaços no começo/fim, sem alterar o que está no JSON original.
    const novosCampos = {
      nome: campos.nome.trim(),
      categoriaId: campos.categoriaId,
      preco: Number(campos.preco),
      estoque: Number(campos.estoque),
    };
    if (idEmEdicao !== null) {
      // map substitui apenas o registro escolhido por um novo objeto.
      // Os outros campos (ID, descrição e tags) são preservados pelo spread de item.
      setItens((atuais) => atuais.map((item) => String(item.id) === String(idEmEdicao) ? { ...item, ...novosCampos } : item));
      setMensagem('Item atualizado.');
    } else {
      // Inclusão imutável: outro array recebe o novo registro. O UUID fornece um
      // ID textual único; adapte o gerador se o enunciado exigir um formato específico.
      setItens((atuais) => [...atuais, { id: crypto.randomUUID(), ...novosCampos, descricao: 'Item cadastrado neste exemplo.', tags: [] }]);
      setMensagem('Item cadastrado.');
    }
    limpar();
  }

  function editar(item) {
    // Preenche o formulário com o registro existente. String normaliza os valores
    // para os inputs controlados, e a ref leva o usuário ao primeiro campo.
    setIdEmEdicao(item.id);
    setCampos({ nome: item.nome, categoriaId: String(item.categoriaId), preco: String(item.preco), estoque: String(item.estoque) });
    setErros({});
    setMensagem('');
    nomeRef.current?.focus();
  }

  function excluir() {
    // filter cria a lista sem o registro confirmado. Se ele estava em edição,
    // o formulário também é limpo para não tentar editar um item que já foi removido.
    setItens((atuais) => atuais.filter((item) => String(item.id) !== String(itemParaExcluir.id)));
    if (String(idEmEdicao) === String(itemParaExcluir.id)) limpar();
    setMensagem('Item excluído.');
    setItemParaExcluir(null);
  }

  return (
    <div className="example-stack">
      <div className="section-intro">
        <div><span className="eyebrow">useState + eventos</span><h2>Do formulário para a lista.</h2></div>
        <p className="muted">Crie, edite e exclua itens com estado imutável. As alterações ficam em memória e não modificam o JSON original.</p>
      </div>
      {/* O formulário e a tabela compartilham o estado de Cadastro.
          Cada operação atualiza esse estado e o React renderiza a lista novamente. */}
      <div className="example-columns crud-layout">
        <section className="panel">
          <div className="panel-heading"><h3>{idEmEdicao === null ? 'Cadastrar item' : 'Editar item'}</h3><span className="badge">Formulário controlado</span></div>
          {/* noValidate deixa a função validarItem produzir as mensagens em português.
              value/onChange tornam cada input controlado pelo objeto campos. */}
          <form onSubmit={salvar} noValidate className="example-stack">
            {Object.values(erros).some(Boolean) && <p className="field-error" role="alert">Revise os campos indicados antes de salvar.</p>}
            <div className="field">
              <label className="field-label" htmlFor="cadastro-nome">Nome</label>
              <input ref={nomeRef} id="cadastro-nome" name="nome" value={campos.nome} onChange={alterarCampo} placeholder="Ex.: Aprendendo React" required minLength={3} aria-invalid={Boolean(erros.nome)} aria-describedby={erros.nome ? 'erro-nome' : undefined} />
              {erros.nome && <span id="erro-nome" className="field-error">{erros.nome}</span>}
            </div>
            <div className="field">
              <label className="field-label" htmlFor="cadastro-categoria">Categoria</label>
              <select id="cadastro-categoria" name="categoriaId" value={campos.categoriaId} onChange={alterarCampo} required aria-invalid={Boolean(erros.categoriaId)} aria-describedby={erros.categoriaId ? 'erro-categoria' : undefined}>
                <option value="">Selecione uma categoria</option>
                {dados.categorias.map((categoria) => <option key={categoria.id} value={categoria.id}>{categoria.nome}</option>)}
              </select>
              {erros.categoriaId && <span id="erro-categoria" className="field-error">{erros.categoriaId}</span>}
            </div>
            <div className="form-grid">
              <div className="field">
                <label className="field-label" htmlFor="cadastro-preco">Preço (R$)</label>
                <input id="cadastro-preco" type="number" name="preco" min="0" step="0.01" value={campos.preco} onChange={alterarCampo} placeholder="0,00" required aria-invalid={Boolean(erros.preco)} aria-describedby={erros.preco ? 'erro-preco' : undefined} />
                {erros.preco && <span id="erro-preco" className="field-error">{erros.preco}</span>}
              </div>
              <div className="field">
                <label className="field-label" htmlFor="cadastro-estoque">Estoque</label>
                <input id="cadastro-estoque" type="number" name="estoque" min="0" step="1" value={campos.estoque} onChange={alterarCampo} placeholder="0" required aria-invalid={Boolean(erros.estoque)} aria-describedby={erros.estoque ? 'erro-estoque' : undefined} />
                {erros.estoque && <span id="erro-estoque" className="field-error">{erros.estoque}</span>}
              </div>
            </div>
            {/* Submit salva; cancelar é type="button" para não enviar o formulário. */}
            <div className="inline-actions">
              <button className="button button-primary" type="submit">{idEmEdicao === null ? 'Adicionar item' : 'Salvar alterações'}</button>
              {idEmEdicao !== null && <button className="button button-secondary" type="button" onClick={limpar}>Cancelar edição</button>}
            </div>
          </form>
        </section>
        {/* A tabela usa a lista atual, incluindo os itens adicionados nesta visita. */}
        <section className="panel">
          <div className="panel-heading"><h3>Itens em memória</h3><span className="badge">{itens.length} itens</span></div>
          <p className="feedback-message" role="status">{mensagem}</p>
          {itens.length === 0 ? <EstadoVazio titulo="Lista vazia" descricao="Use o formulário para adicionar o primeiro item." /> : (
            <div className="table-wrap">
              <table className="data-table">
                <thead><tr><th scope="col">Item</th><th scope="col">Preço</th><th scope="col">Estoque</th><th scope="col">Ações</th></tr></thead>
                <tbody>{itens.map((item) => (
                  <tr key={item.id}>
                    <td><strong>{item.nome}</strong><small className="muted">{dados.categorias.find((categoria) => String(categoria.id) === String(item.categoriaId))?.nome ?? 'Sem categoria'}</small></td>
                    <td>{formatarMoeda(item.preco)}</td><td>{item.estoque}</td>
                    <td><div className="inline-actions"><button className="button button-ghost" type="button" onClick={() => editar(item)} aria-label={`Editar ${item.nome}`}>Editar</button><button className="button button-danger" type="button" onClick={() => setItemParaExcluir(item)} aria-label={`Excluir ${item.nome}`}>Excluir</button></div></td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
          )}
        </section>
      </div>
      {/* Ler o trecho abaixo não executa as operações: são exemplos em uma string. */}
      <BlocoCodigo titulo="Adicionar, editar e excluir sem alterar o array original" codigo={codigo} />
      {/* null esconde o modal. Confirmar chama excluir; cancelar só limpa a seleção. */}
      {itemParaExcluir && <Modal titulo="Excluir item?" aoFechar={() => setItemParaExcluir(null)}><p>Excluir <strong>{itemParaExcluir.nome}</strong> da lista deste exemplo?</p><div className="inline-actions"><button type="button" className="button button-secondary" onClick={() => setItemParaExcluir(null)}>Cancelar</button><button type="button" className="button button-danger" onClick={excluir}>Confirmar exclusão</button></div></Modal>}
    </div>
  );
}
