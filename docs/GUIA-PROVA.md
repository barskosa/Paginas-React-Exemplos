# Guia de consulta — React + Vite + JSON

Comece pelo enunciado: confirme os campos, funcionalidades e tecnologias permitidas. Os nomes `itens`, `nome` e `categoriaId` abaixo são exemplos; ajuste-os ao arquivo recebido.

**Para abrir o modelo mínimo funcionando:** inicie o projeto com `npm.cmd run dev` e escolha **Modelo mínimo** no menu. A página [http://127.0.0.1:5173/modelo.html](http://127.0.0.1:5173/modelo.html) abre o mesmo componente isolado, sem importar o CSS do caderno. Use a porta exibida no terminal se ela for diferente. O código está em [src/modelos/AppBase.jsx](../src/modelos/AppBase.jsx).

## Encontre o exemplo certo

| Se a prova pedir… | Consulte |
| --- | --- |
| Começar com um único componente, sem helpers deste caderno | [AppBase.jsx](../src/modelos/AppBase.jsx) |
| Listar dados, pesquisar, filtrar, ordenar, favoritar ou abrir detalhes | [Catalogo.jsx](../src/examples/Catalogo.jsx) |
| Criar, editar ou excluir registros com formulário | [Cadastro.jsx](../src/examples/Cadastro.jsx) |
| Exibir os itens de um grupo/equipe por IDs | [Relacionamentos.jsx](../src/examples/Relacionamentos.jsx) |
| Ler JSON de `public` com carregamento e erro | [Carregamento.jsx](../src/examples/Carregamento.jsx) |
| Reutilizar busca, select, mensagem vazia, modal ou paginação | [components](../src/components/) |
| Adaptar busca, ordenação e resumos | [catalogo.js](../src/utils/catalogo.js) |

Os componentes do projeto têm dependências locais de CSS, dados e utilitários. Ao copiar um exemplo completo, acompanhe seus imports. Os trechos deste guia mostram a lógica mínima.

Na interface, abra **Código-fonte** e escolha o arquivo no seletor. Além dos componentes, ele inclui o JSON, os estilos, o modelo inicial e estes documentos. Alternar entre Demonstração e Código-fonte mantém o estado do exemplo. Sair para outro exemplo desmonta o anterior: o CRUD volta aos três itens iniciais quando você retornar. Somente os favoritos do catálogo persistem no navegador.

Para usar o modelo mínimo em outro projeto, copie [AppBase.jsx](../src/modelos/AppBase.jsx) para `src/App.jsx` e ajuste o import para `./data/catalogo.json`. Os campos continuam precisando corresponder ao JSON recebido. A entrada independente [modelo.html](../modelo.html) utiliza [src/modelos/main.jsx](../src/modelos/main.jsx) sem importar os estilos do caderno. A opção do menu mostra essa mesma página em um iframe, isolando o modelo dos estilos da navegação.

## 1. Executar o projeto

Neste repositório:

```powershell
npm.cmd install
npm.cmd run dev
```

Para iniciar **outro projeto em uma pasta nova**, se o enunciado permitir:

```powershell
npm.cmd create vite@latest minha-prova -- --template react
cd minha-prova
npm.cmd install
npm.cmd run dev
```

Abra o endereço exibido no terminal. `npm.cmd` evita o bloqueio de `npm.ps1` em alguns PowerShell. Use `npm.cmd run build` para conferir a compilação antes da entrega. Se já houver um projeto fornecido, preserve a configuração dele.

## 2. Primeiro descubra o formato do JSON

```js
// A: o próprio arquivo é um array: [{ id: 1, nome: '...' }]
import dados from './data/dados.json';
const itens = dados;

// B: o arquivo é um objeto: { itens: [{ id: 1, nome: '...' }] }
// Use esta declaração no lugar da anterior:
// const itens = dados.itens;
```

`dados.map is not a function` normalmente significa que você tentou percorrer o objeto inteiro em vez do array dentro dele. Inspecione um registro com `console.log(dados)` e confira `Array.isArray(dados.itens)`.

O catálogo deste projeto tem esta estrutura; abaixo está um recorte com um item e uma coleção:

```json
{
  "categorias": [{ "id": "frontend", "nome": "Front-end" }],
  "itens": [{
    "id": 1,
    "nome": "React na prática",
    "categoriaId": "frontend",
    "preco": 89.9,
    "estoque": 12,
    "descricao": "Um guia de componentes, props e estado para construir interfaces com React.",
    "tags": ["React", "Componentes"]
  }],
  "colecoes": [{ "id": "primeiros-passos", "nome": "Primeiros passos", "itemIds": [2, 1, 4] }]
}
```

Os IDs 2 e 4 da coleção estão entre os demais itens do arquivo completo.

Preserve o JSON original. Adapte o código de leitura e a apresentação. Um array vazio é um dado válido; não invente uma categoria ou tipo para preencher o arquivo.

Se preferir adaptar nomes em um único ponto, crie novos objetos em memória:

```js
const itens = dados.produtos.map((produto) => ({
  id: produto.codigo,
  nome: produto.titulo,
  preco: produto.valor,
  estoque: produto.quantidade,
}));
```

Esse mapeamento é opcional. Não converta IDs como `"001"` para número se os zeros fizerem parte do identificador.

## 3. Listar dados e passar props

```jsx
function CardItem({ item, onDetalhes }) {
  return (
    <article>
      <h2>{item.nome}</h2>
      <p>Estoque: {item.estoque}</p>
      <button type="button" onClick={() => onDetalhes(item)}>
        Ver detalhes
      </button>
    </article>
  );
}

// Dentro do return do componente pai:
// {itens.map((item) => (
//   <CardItem key={item.id} item={item} onDetalhes={setSelecionado} />
// ))}
```

`item` é um objeto recebido por props; `onDetalhes` é a função que o filho chama para avisar o pai. `key` identifica cada elemento na lista e não chega como prop ao componente. Em uma lista com IDs únicos, use `key={item.id}`.

## 4. Busca + filtro + ordenação

Exemplo independente para substituir o `App.jsx` de um projeto React com o JSON do catálogo:

```jsx
import { useState } from 'react';
import dados from './data/catalogo.json';

const normalizar = (texto) => String(texto ?? '')
  .normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();

export default function App() {
  const [busca, setBusca] = useState('');
  const [categoria, setCategoria] = useState('');
  const [ordem, setOrdem] = useState('nome');
  const termo = normalizar(busca);

  // A lista é calculada. Não precisa de outro useState ou useEffect.
  const resultado = dados.itens.filter((item) => {
    const nomeOuId = normalizar(item.nome).includes(termo)
      || String(item.id) === termo;
    const mesmaCategoria = categoria === ''
      || String(item.categoriaId) === categoria;
    return nomeOuId && mesmaCategoria;
  });

  const ordenados = [...resultado].sort((a, b) => ordem === 'preco'
    ? a.preco - b.preco
    : a.nome.localeCompare(b.nome, 'pt-BR'));

  return (
    <main>
      <label>
        Busca
        <input value={busca} onChange={(e) => setBusca(e.target.value)} />
      </label>
      <label>
        Categoria
        <select value={categoria} onChange={(e) => setCategoria(e.target.value)}>
          <option value="">Todas</option>
          {dados.categorias.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
        </select>
      </label>
      <label>
        Ordem
        <select value={ordem} onChange={(e) => setOrdem(e.target.value)}>
          <option value="nome">Nome</option>
          <option value="preco">Menor preço</option>
        </select>
      </label>
      <p>{ordenados.length} resultado(s)</p>
      {ordenados.length === 0 ? <p>Nenhum resultado encontrado.</p> : (
        <ul>{ordenados.map((item) => <li key={item.id}>{item.nome}</li>)}</ul>
      )}
    </main>
  );
}
```

O valor de um `select` chega como **string**. Por isso a comparação usa `String(item.categoriaId)`. Para números use subtração no `sort`; para texto use `localeCompare`. Copie o array antes de ordenar para preservar os dados.

## 5. Escolha o método certo de array

| Método | Devolve | Exemplo |
| --- | --- | --- |
| `map` | Um novo array transformado | `itens.map((i) => i.nome)` |
| `filter` | Um novo array com os aprovados | `itens.filter((i) => i.estoque > 0)` |
| `find` | O primeiro registro ou `undefined` | `itens.find((i) => i.id === id)` |
| `some` | Se pelo menos um satisfaz a regra | `itens.some((i) => i.estoque === 0)` |
| `every` | Se todos satisfazem a regra | `tiposSelecionados.every((t) => item.tipos.includes(t))` |
| `includes` | Se um valor está no array/texto | `favoritos.includes(item.id)` |
| `reduce` | Um valor acumulado | `itens.reduce((soma, i) => soma + i.preco * i.estoque, 0)` |
| `slice` | Um trecho sem mudar o original | `itens.slice(0, 6)` |

Para obter opções únicas sem um catálogo separado: `const categorias = [...new Set(itens.map((i) => i.categoria))]`. Se o JSON já traz a lista oficial de categorias, use essa lista, inclusive categorias sem itens.

## 6. Detalhes e renderização condicional

```jsx
const [selecionado, setSelecionado] = useState(null);

// Dentro do return:
// <button onClick={() => setSelecionado(item)}>Detalhes</button>
// {selecionado && (
//   <section>
//     <h2>{selecionado.nome}</h2>
//     <p>{selecionado.descricao ?? 'Descrição não informada'}</p>
//     <button onClick={() => setSelecionado(null)}>Fechar</button>
//   </section>
// )}
```

Para um modal pronto, consulte [Modal.jsx](../src/components/Modal.jsx). `??` usa o texto alternativo apenas para `null`/`undefined`; `||` também substituiria valores como `0` e `''`.

## 7. Resolver relacionamentos por IDs

```js
const categoria = dados.categorias.find((c) => c.id === item.categoriaId);
const rotulo = categoria?.nome ?? 'Categoria não encontrada';

// Preserva a ordem e as repetições de itemIds:
const membros = colecao.itemIds.map((id) => dados.itens.find((i) => i.id === id));
// Ao renderizar, trate um membro undefined como referência não encontrada.
```

Se usar `itens.filter((item) => colecao.itemIds.includes(item.id))`, a saída segue a ordem de `itens` e elimina as repetições da relação. Use `map` + `find` quando a ordem/repetição tiver significado, como os Pokémon de um treinador. Para uma relação repetida, uma chave composta ``key={`${id}-${indice}`}`` diferencia as posições.

IDs numéricos e textuais não são iguais em `===`. Confira o tipo no arquivo antes de comparar. Se precisar comparar representações, use `String(idA) === String(idB)` sem alterar o JSON.

Para tipos como objetos, `item.tipos.some((tipo) => tipo.id === idTipo)`; para tipos como strings, `item.tipos.includes(nomeTipo)`. Para ausência: `(item.tipos ?? []).length === 0`. `some` em um array vazio devolve `false`; `every` em um array vazio devolve `true`, útil quando nenhum filtro foi escolhido.

## 8. Formulário e CRUD em memória

Imports e estados dentro do componente:

```jsx
import { useState } from 'react';
import dados from './data/catalogo.json';

// Dentro do componente:
// const [itens, setItens] = useState(() => [...dados.itens]);
// const [nome, setNome] = useState('');
// const [preco, setPreco] = useState('');
```

Um campo controlado usa `value` e `onChange`. Em `input type="number"`, `event.target.value` continua sendo texto. Valide antes de converter um campo vazio para número.

```jsx
function salvar(event) {
  event.preventDefault();
  const valor = Number(preco);
  if (!nome.trim() || preco === '' || !Number.isFinite(valor) || valor < 0) return;
  // Use o tipo de ID exigido pelo enunciado; este exemplo gera IDs textuais.
  const novo = { id: crypto.randomUUID(), nome: nome.trim(), preco: valor };
  setItens((atuais) => [...atuais, novo]);
  setNome('');
  setPreco('');
}

// JSX do formulário:
// <form onSubmit={salvar}>
//   <label>Nome <input required value={nome} onChange={(e) => setNome(e.target.value)} /></label>
//   <label>Preço <input required type="number" min="0" step="0.01" value={preco} onChange={(e) => setPreco(e.target.value)} /></label>
//   <button type="submit">Adicionar</button>
// </form>
```

Preencha também os demais campos obrigatórios do domínio. Para editar, remova ou altere usando os estados existentes:

```js
// Edição: atualize com map e um novo objeto. 'alteracoes' contém campos validados.
setItens((atuais) => atuais.map((item) =>
  item.id === idEditado ? { ...item, ...alteracoes, id: item.id } : item));

// Exclusão:
setItens((atuais) => atuais.filter((item) => item.id !== idExcluido));
```

Em um formulário, botões de cancelar/editar/excluir devem ter `type="button"` para evitar submit acidental. O navegador não regrava o JSON de `src`: alterações em memória desaparecem ao recarregar. Isso é suficiente quando o enunciado pede apenas manipulação de estado.

## 9. Favoritos e localStorage opcional

Sem persistência:

```js
const [favoritos, setFavoritos] = useState([]);

function alternarFavorito(id) {
  setFavoritos((atuais) => atuais.includes(id)
    ? atuais.filter((favorito) => favorito !== id)
    : [...atuais, id]);
}

// Só favoritos: itens.filter((item) => favoritos.includes(item.id))
```

Se o enunciado permitir ou exigir persistir no navegador, substitua a inicialização acima e acrescente o efeito:

```js
// Importe useEffect e useState de 'react'.
const [favoritos, setFavoritos] = useState(() => {
  try {
    const salvos = JSON.parse(localStorage.getItem('minha-prova:favoritos') ?? '[]');
    return Array.isArray(salvos)
      ? salvos.filter((id) => itens.some((item) => item.id === id))
      : [];
  } catch {
    return [];
  }
});

useEffect(() => {
  try {
    localStorage.setItem('minha-prova:favoritos', JSON.stringify(favoritos));
  } catch {
    // Se o armazenamento estiver indisponível, o estado em memória continua funcionando.
  }
}, [favoritos]);
```

`localStorage` guarda strings, por isso use `JSON.stringify` ao salvar e `JSON.parse` ao ler. Isso persiste só nesse navegador, sem banco ou sincronização entre dispositivos.

## 10. Paginação

```js
const porPagina = 6;
const [pagina, setPagina] = useState(1);
const totalPaginas = Math.max(1, Math.ceil(resultado.length / porPagina));
const paginaAtual = Math.min(pagina, totalPaginas);
const visiveis = resultado.slice((paginaAtual - 1) * porPagina, paginaAtual * porPagina);

// Ao mudar busca/filtro: setBusca(novoValor); setPagina(1);
// Anterior: setPagina((p) => Math.max(1, p - 1));
// Próxima: setPagina((p) => Math.min(totalPaginas, p + 1));
// Renderize 'visiveis', mas mostre resultado.length na contagem.
```

Aplique primeiro os filtros, depois a ordenação, depois a paginação. Desative Anterior na primeira página e Próxima na última. Para zero resultados, mostre a mensagem vazia.

## 11. JSON em public com fetch e useEffect

Para JSON local fixo em `src`, o import é mais direto e não exige efeito. Se a prova pedir `fetch`, coloque o arquivo em `public/data/itens.json`; esse exemplo espera **um array de itens** no arquivo.

A demonstração já pronta em [Carregamento.jsx](../src/examples/Carregamento.jsx) usa `public/dados-exemplo.json`. Para reutilizar esse arquivo no trecho abaixo, troque `data/itens.json` por `dados-exemplo.json`.

```jsx
import { useEffect, useState } from 'react';

export default function ListaRemota() {
  const [itens, setItens] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [tentativa, setTentativa] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    let ativo = true;
    setCarregando(true);
    setErro('');

    async function carregar() {
      try {
        const resposta = await fetch(`${import.meta.env.BASE_URL}data/itens.json`, {
          signal: controller.signal,
        });
        if (!resposta.ok) throw new Error(`Falha HTTP ${resposta.status}`);
        const dados = await resposta.json();
        if (!Array.isArray(dados)) throw new Error('Era esperado um array de itens.');
        if (ativo) setItens(dados);
      } catch (falha) {
        if (ativo && falha.name !== 'AbortError') setErro(falha.message);
      } finally {
        if (ativo) setCarregando(false);
      }
    }

    carregar();
    return () => { ativo = false; controller.abort(); };
  }, [tentativa]);

  if (carregando) return <p role="status">Carregando...</p>;
  if (erro) return (
    <div role="alert">
      <p>{erro}</p>
      <button onClick={() => setTentativa((n) => n + 1)}>Tentar novamente</button>
    </div>
  );
  if (itens.length === 0) return <p>Nenhum item disponível.</p>;
  return <ul>{itens.map((item) => <li key={item.id}>{item.nome}</li>)}</ul>;
}
```

`public` não aparece na URL. Para `{ "itens": [...] }`, valide `dados.itens` e use `setItens(dados.itens)`. Um HTTP 404 não faz `fetch` lançar erro sozinho: confira `resposta.ok`. Um caminho errado no Vite também pode devolver HTML; nesse caso `resposta.json()` falha e a mensagem de erro aparece.

O efeito retorna a limpeza, por isso ele não deve ser declarado `useEffect(async () => ...)`. Em desenvolvimento, `StrictMode` pode executar um ciclo extra de montagem/limpeza; isso ajuda a revelar efeitos sem limpeza.

## 12. Revisão rápida antes de entregar

- [ ] O JSON original está preservado e a lista tem a quantidade esperada.
- [ ] Os campos do enunciado aparecem, incluindo números com valor zero.
- [ ] Pesquisa e filtros funcionam juntos; limpar recupera os resultados.
- [ ] Ordenação numérica e textual funcionam sem alterar os dados originais.
- [ ] Nenhum resultado, lista vazia, tipos vazios e dados opcionais têm apresentação adequada.
- [ ] Detalhes abrem e fecham; não há acesso a propriedades de `null`/`undefined`.
- [ ] Relações usam IDs corretos e preservam a ordem quando exigido.
- [ ] Forms não recarregam a página, validam campos e atualizam o estado.
- [ ] O comportamento ao recarregar corresponde à persistência pedida.
- [ ] Console sem erro; links/imports e maiúsculas dos nomes de arquivo conferidos.
- [ ] `npm.cmd run build` passa e o projeto executa seguindo o README.

## Armadilhas que costumam consumir tempo

| Sintoma | Confira |
| --- | --- |
| `map is not a function` | A variável é o array correto dentro do JSON? |
| `Cannot read properties of undefined` | `find` pode não achar; um campo pode estar vazio. Use uma condição ou `?.`. |
| Campo não deixa digitar | Todo `value` controlado precisa de `onChange`. |
| Clique acontece sozinho | Use `onClick={() => abrir(item)}`, não `onClick={abrir(item)}`. |
| Estado parece não atualizar | Use o setter; não faça `itens.push(...)` ou `item.nome = ...` no estado. |
| Ordenação estranha | Números: `(a, b) => a.valor - b.valor`; strings: `localeCompare`. |
| `0` aparece no lugar de uma lista | Prefira `lista.length > 0 && ...` a `lista.length && ...`. |
| Select não encontra IDs | O select fornece string; confira se o JSON usa números. |
| Estado selecionado parece antigo após editar | Guarde o ID e encontre o registro na lista atual, ou atualize também a seleção. |
| Renderização infinita | Não chame setter diretamente durante a renderização; confira dependências dos efeitos. |
| Foto não abre | Confira caminho e nome; em `public/imagens/x.png`, a URL é `imagens/x.png` com a base do Vite. |

Fontes e padrões consultados estão em [REFERENCIAS.md](./REFERENCIAS.md).
