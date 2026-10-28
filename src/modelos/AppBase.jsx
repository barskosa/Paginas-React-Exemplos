// MODELO MÍNIMO: copie para src/App.jsx e ajuste o import para './data/catalogo.json'.
// Depois troque itens, categorias, nome e categoriaId pelas chaves do JSON da prova.
import { useState } from 'react';
// O import já entrega um objeto JavaScript: não é necessário chamar JSON.parse aqui.
import dados from '../data/catalogo.json';

export default function AppBase() {
  // useState devolve o valor atual e uma função para atualizá-lo.
  // Ao chamar setBusca/setCategoria, React renderiza a tela com os novos resultados.
  const [busca, setBusca] = useState('');
  const [categoria, setCategoria] = useState('');
  // null significa que nenhum item está aberto no painel de detalhes.
  const [selecionado, setSelecionado] = useState(null);

  // A lista é derivada: guarde as escolhas no estado e calcule os resultados a partir delas.
  // filter cria outro array; sort ordena essa cópia sem mudar o JSON importado.
  const visiveis = dados.itens
    .filter((item) => {
      // includes aceita parte do nome; toLowerCase ignora diferenças entre maiúsculas/minúsculas.
      const correspondeNome = item.nome.toLowerCase().includes(busca.trim().toLowerCase());
      // Categoria vazia significa Todas. select entrega texto, então compare usando String.
      const correspondeCategoria = !categoria || String(item.categoriaId) === categoria;
      // && exige que a busca E a categoria correspondam ao mesmo item.
      return correspondeNome && correspondeCategoria;
    })
    .sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));

  return (
    <main>
      <h1>Meu catálogo</h1>
      {/* Campo controlado: o estado preenche value e o evento devolve o texto digitado. */}
      <label>
        Buscar por nome
        <input value={busca} onChange={(event) => setBusca(event.target.value)} />
      </label>
      <label>
        Categoria
        <select value={categoria} onChange={(event) => setCategoria(event.target.value)}>
          <option value="">Todas</option>
          {/* Cada categoria do JSON vira uma opção. key ajuda React a identificar cada elemento. */}
          {dados.categorias.map((item) => (
            <option key={item.id} value={item.id}>{item.nome}</option>
          ))}
        </select>
      </label>
      <p>{visiveis.length} resultados</p>
      {/* Compare length com zero para exibir uma mensagem quando não houver registros. */}
      {visiveis.length === 0 && <p>Nenhum item encontrado.</p>}
      <ul>
        {/* map transforma cada objeto da lista em um trecho de JSX. */}
        {visiveis.map((item) => (
          <li key={item.id}>
            <strong>{item.nome}</strong> — R$ {item.preco.toFixed(2)}
            {/* A função só roda no clique; guardar item abre a seção de detalhes abaixo. */}
            <button onClick={() => setSelecionado(item)}>Ver detalhes</button>
          </li>
        ))}
      </ul>
      {/* && monta a seção apenas enquanto selecionado contém um objeto. */}
      {selecionado && (
        <section aria-label="Detalhes do item">
          <h2>{selecionado.nome}</h2>
          <p>{selecionado.descricao}</p>
          <p>Estoque: {selecionado.estoque}</p>
          {/* Voltar para null remove a seção na próxima renderização. */}
          <button onClick={() => setSelecionado(null)}>Fechar detalhes</button>
        </section>
      )}
    </main>
  );
}
