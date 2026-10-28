import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import {
  filtrarItens,
  normalizarTexto,
  paginarItens,
  resolverItens,
  validarItem,
} from '../src/utils/catalogo.js';

const dados = JSON.parse(await readFile(new URL('../src/data/catalogo.json', import.meta.url), 'utf8'));
const { itens } = dados;
const ids = (lista) => lista.map((item) => item.id);

test('JSON contém IDs únicos, tipos corretos e casos vazios intencionais', () => {
  assert.equal(itens.length, 12);
  assert.equal(new Set(ids(itens)).size, itens.length);
  for (const item of itens) {
    assert.equal(typeof item.id, 'number');
    assert.equal(typeof item.preco, 'number');
    assert.equal(Number.isInteger(item.estoque), true);
    assert.equal(Array.isArray(item.tags), true);
    assert.equal(dados.categorias.some((categoria) => categoria.id === item.categoriaId), true);
  }
  assert.equal(itens.some((item) => item.tags.length === 0), true);
  assert.equal(itens.some((item) => item.estoque === 0), true);
  assert.equal(dados.colecoes.some((colecao) => colecao.itemIds.length === 0), true);
});

test('busca ignora acentos, maiúsculas e espaços nas extremidades', () => {
  assert.equal(normalizarTexto('  PRÁTICA  '), 'pratica');
  assert.equal(normalizarTexto(null), '');
  assert.deepEqual(ids(filtrarItens(itens, { busca: '  PRATICA  ' })), [1]);
  assert.equal(filtrarItens(itens, { busca: 'javascript' }).length, 2);
});

test('busca numérica encontra somente ID exato e aceita zeros e #', () => {
  for (const busca of ['1', '001', '#001']) {
    assert.deepEqual(ids(filtrarItens(itens, { busca })), [1]);
  }
  assert.deepEqual(filtrarItens(itens, { busca: '#999' }), []);
});

test('combina busca, categoria, estoque e favoritos com operação AND', () => {
  assert.deepEqual(ids(filtrarItens(itens, {
    busca: 'React',
    categoria: 'frontend',
    somenteDisponiveis: true,
    somenteFavoritos: true,
    favoritos: ['1'],
  })), [1]);
  assert.deepEqual(filtrarItens(itens, {
    busca: 'React', categoria: 'design', somenteFavoritos: true, favoritos: [1],
  }), []);
  assert.deepEqual(filtrarItens(itens, { categoria: 'dados' }), []);
  assert.deepEqual(filtrarItens(itens, { somenteFavoritos: true }), []);
  assert.equal(filtrarItens(itens, { somenteDisponiveis: true }).length, 10);
});

test('categoria e favoritos aceitam IDs equivalentes em string e número', () => {
  const lista = [{ id: 25, nome: 'Exemplo', categoriaId: 7, preco: 1, estoque: 1 }];
  assert.equal(filtrarItens(lista, { categoria: '7', somenteFavoritos: true, favoritos: ['25'] }).length, 1);
  const comZero = [...lista, { id: 26, nome: 'Categoria zero', categoriaId: 0, preco: 0, estoque: 0 }];
  assert.deepEqual(ids(filtrarItens(comZero, { categoria: 0 })), [26]);
});

test('cada ordenação respeita a direção solicitada sem mutar os dados', () => {
  const copia = JSON.stringify(itens);
  const porPreco = filtrarItens(itens, { ordenacao: 'preco-asc' });
  assert.equal(porPreco[0].id, 12);
  assert.equal(porPreco.at(-1).id, 1);
  assert.deepEqual(ids(filtrarItens(itens, { ordenacao: 'preco-desc' })), ids(porPreco).reverse());
  assert.equal(filtrarItens(itens, { ordenacao: 'estoque-desc' })[0].id, 12);
  assert.deepEqual(ids(filtrarItens(itens, { ordenacao: 'id-asc' })), ids(itens));
  const porNome = filtrarItens(itens, { ordenacao: 'nome-asc' });
  assert.deepEqual(ids(filtrarItens(itens, { ordenacao: 'nome-desc' })), ids(porNome).reverse());
  assert.equal(JSON.stringify(itens), copia);
  assert.notEqual(porPreco, itens);
});

test('paginação calcula páginas e limita valores fora do intervalo', () => {
  assert.deepEqual(ids(paginarItens(itens, 1, 6).itens), [1, 2, 3, 4, 5, 6]);
  const ultima = paginarItens(itens, 100, 5);
  assert.equal(ultima.pagina, 3);
  assert.equal(ultima.totalPaginas, 3);
  assert.equal(ultima.total, 12);
  assert.deepEqual(ids(ultima.itens), [11, 12]);
  assert.equal(paginarItens(itens, -2, 6).pagina, 1);
  assert.equal(paginarItens(itens, Number.NaN, 0).pagina, 1);
  assert.equal(paginarItens(itens, 1, Number.POSITIVE_INFINITY).itens.length, 6);
});

test('paginação de lista vazia permanece utilizável', () => {
  assert.deepEqual(paginarItens([], 5, 6), { itens: [], pagina: 1, totalPaginas: 1, total: 0 });
});

test('relações preservam ordem, aceitam string e ignoram IDs inexistentes', () => {
  const referencias = ['3', 999, 1];
  assert.deepEqual(ids(resolverItens(referencias, itens)), [3, 1]);
  assert.deepEqual(referencias, ['3', 999, 1]);
  assert.deepEqual(ids(resolverItens([1, 3, 1], itens)), [1, 3, 1]);
  assert.deepEqual(resolverItens([], itens), []);
  const colecao = dados.colecoes.find((item) => item.id === 'interfaces');
  assert.equal(resolverItens(colecao.itemIds, itens).length, 3);
});

test('formulário aceita zero e números em strings, mas exige nome e categoria', () => {
  assert.deepEqual(validarItem({ nome: ' Item ', categoriaId: 'frontend', preco: '0', estoque: '0' }), {});
  assert.deepEqual(validarItem({ nome: 'Item', categoriaId: 'frontend', preco: 5.99, estoque: 2 }), {});
  const erros = validarItem({ nome: '  a ', categoriaId: '', preco: 1, estoque: 1 });
  assert.equal(typeof erros.nome, 'string');
  assert.equal(typeof erros.categoriaId, 'string');
});

test('formulário rejeita números vazios, negativos, infinitos e estoque fracionado', () => {
  for (const valor of ['', '   ', null, undefined, -1, 'abc', Number.POSITIVE_INFINITY]) {
    const erros = validarItem({ nome: 'Item', categoriaId: 'frontend', preco: valor, estoque: valor });
    assert.equal(typeof erros.preco, 'string', `Preço inválido: ${String(valor)}`);
    assert.equal(typeof erros.estoque, 'string', `Estoque inválido: ${String(valor)}`);
  }
  assert.equal(typeof validarItem({ nome: 'Item', categoriaId: 'frontend', preco: 1, estoque: 1.5 }).estoque, 'string');
  assert.equal(Object.keys(validarItem()).length, 4);
});
