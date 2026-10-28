// Funções puras: recebem dados e devolvem resultados sem alterar o JSON.
// Não dependem do React; podem ser chamadas em componentes ou em testes do Node.

// Converte null/undefined em texto vazio, remove acentos, ignora maiúsculas
// e tira espaços das pontas. Assim, " PRÁTICA " pode encontrar "prática".
export function normalizarTexto(valor) {
  return String(valor ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

// Todas as opções são opcionais graças aos valores padrão na desestruturação.
// A função devolve uma lista nova; o componente mantém em estado apenas os controles.
export function filtrarItens(
  itens,
  {
    busca = '',
    categoria = '',
    somenteDisponiveis = false,
    somenteFavoritos = false,
    favoritos = [],
    ordenacao = 'nome-asc',
  } = {},
) {
  const termo = normalizarTexto(busca);
  // Uma busca formada só por dígitos (com # opcional) vira ID exato: #001 -> 1.
  // Outras buscas procuram parte do nome; adapte esse critério aos campos da prova.
  const idBuscado = /^#?\d+$/.test(termo)
    ? Number(termo.replace('#', ''))
    : null;
  // Set permite testar favoritos com has; String alinha IDs vindos de select e JSON.
  const idsFavoritos = new Set(favoritos.map(String));

  // filter percorre os itens e mantém somente aqueles que atendem a todos os critérios.
  // Um filtro desligado produz true e, portanto, não restringe a lista.
  const resultado = itens.filter((item) => {
    const correspondeBusca = !termo || (idBuscado !== null
      ? Number(item.id) === idBuscado
      : normalizarTexto(item.nome).includes(termo));
    // Não usar !categoria aqui: um ID numérico 0 também pode ser uma categoria válida.
    const correspondeCategoria = categoria === '' || categoria == null || String(item.categoriaId) === String(categoria);
    const correspondeEstoque = !somenteDisponiveis || Number(item.estoque) > 0;
    const correspondeFavorito = !somenteFavoritos || idsFavoritos.has(String(item.id));

    return correspondeBusca && correspondeCategoria && correspondeEstoque && correspondeFavorito;
  });

  // filter cria um novo array. Por isso, sort não altera o array recebido.
  return resultado.sort((a, b) => {
    // localeCompare ordena nomes em português; numeric ordena IDs 2 antes de 10.
    // O desempate dá uma ordem previsível quando dois preços/estoques são iguais.
    const desempate = String(a.id).localeCompare(String(b.id), 'pt-BR', { numeric: true });
    if (ordenacao === 'nome-desc') return b.nome.localeCompare(a.nome, 'pt-BR') || desempate;
    if (ordenacao === 'preco-asc') return a.preco - b.preco || desempate;
    if (ordenacao === 'preco-desc') return b.preco - a.preco || desempate;
    if (ordenacao === 'estoque-desc') return b.estoque - a.estoque || desempate;
    if (ordenacao === 'id-asc') return desempate;
    return a.nome.localeCompare(b.nome, 'pt-BR') || desempate;
  });
}

// Divide os resultados já filtrados/ordenados em páginas. Faça a paginação por último.
export function paginarItens(itens, pagina = 1, porPagina = 6) {
  // Converte números vindos de inputs, descarta valores inválidos e elimina frações.
  const tamanho = Number.isFinite(Number(porPagina)) && Number(porPagina) >= 1
    ? Math.floor(Number(porPagina))
    : 6;
  // Usa ao menos página 1, mesmo com lista vazia. O recorte vazio continua sendo [].
  const totalPaginas = Math.max(1, Math.ceil(itens.length / tamanho));
  const paginaSolicitada = Number.isFinite(Number(pagina)) ? Math.floor(Number(pagina)) : 1;
  // Se os filtros reduzirem a lista, limita a página para não deixar a tela fora do total.
  const paginaAtual = Math.max(1, Math.min(paginaSolicitada, totalPaginas));
  const inicio = (paginaAtual - 1) * tamanho;

  // slice recebe início inclusivo e fim exclusivo; não remove itens da lista original.
  return {
    itens: itens.slice(inicio, inicio + tamanho),
    pagina: paginaAtual,
    totalPaginas,
    total: itens.length,
  };
}

// Cria o formatador uma vez. Moeda é apresentação: mantenha o preço numérico nos dados.
const moeda = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

export function formatarMoeda(valor) {
  return moeda.format(Number(valor));
}

// Resolve uma relação por IDs: por exemplo, os itemIds guardados em uma coleção.
export function resolverItens(ids, itens) {
  // map preserva a ordem da coleção; filter remove referências inexistentes.
  // IDs repetidos continuam repetidos. Use uma key por ocorrência ao renderizar a relação.
  return ids
    .map((id) => itens.find((item) => String(item.id) === String(id)))
    .filter((item) => item !== undefined);
}

// Recebe campos ainda como strings do formulário e devolve erros por nome do campo.
// Um objeto vazio ({}) significa que os valores passaram nestas regras de validação.
export function validarItem(campos) {
  const erros = {};
  const nome = String(campos?.nome ?? '').trim();
  const categoria = String(campos?.categoriaId ?? '').trim();
  const preco = campos?.preco;
  const estoque = campos?.estoque;
  // Number('') é 0: confira vazio ANTES da conversão para não aceitar campo sem preencher.
  const estaVazio = (valor) => valor === null || valor === undefined || String(valor).trim() === '';

  if (nome.length < 3) erros.nome = 'Digite um nome com pelo menos 3 caracteres.';
  // Aqui a regra exige categoria preenchida; o select fornece as categorias do catálogo.
  if (!categoria) erros.categoriaId = 'Selecione uma categoria.';
  // isFinite rejeita NaN e Infinity; preço zero é permitido.
  if (estaVazio(preco) || !Number.isFinite(Number(preco)) || Number(preco) < 0) {
    erros.preco = 'Informe um preço válido, maior ou igual a zero.';
  }
  // Estoque aceita zero, exige um inteiro e rejeita negativos ou campos vazios.
  if (estaVazio(estoque) || !Number.isInteger(Number(estoque)) || Number(estoque) < 0) {
    erros.estoque = 'Informe uma quantidade inteira, maior ou igual a zero.';
  }

  return erros;
}
