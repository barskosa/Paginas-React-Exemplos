// A seleção fica no estado. O JSON traz listas separadas que se conectam por IDs;
// utilitários resolvem as relações e os componentes reaproveitam a apresentação.
import { useState } from 'react';
import dados from '../data/catalogo.json';
import { formatarMoeda, resolverItens } from '../utils/catalogo.js';
import FiltroSelect from '../components/FiltroSelect.jsx';
import EstadoVazio from '../components/EstadoVazio.jsx';
import BlocoCodigo from '../components/BlocoCodigo.jsx';

// Exemplo textual para consulta: BlocoCodigo mostra esta string, sem executá-la.
const codigo = `// O JSON guarda IDs; resolva cada ID na lista de itens.
const relacionados = colecao.itemIds
  .map((id) => dados.itens.find((item) =>
    String(item.id) === String(id)
  ))
  .filter(Boolean); // Não renderize referências inexistentes.

// Encontre o nome da categoria em outra lista.
const categoria = dados.categorias.find((categoria) =>
  String(categoria.id) === String(item.categoriaId)
);
const nomeCategoria = categoria?.nome ?? 'Sem categoria';

// O valor inicial 0 também permite somar uma lista vazia.
const total = relacionados.reduce((soma, item) => soma + item.preco, 0);`;

export default function Relacionamentos() {
  // O select fornece texto. O primeiro ID vira o valor inicial;
  // ?. e ?? permitem também um JSON cuja lista de coleções esteja vazia.
  const [colecaoId, setColecaoId] = useState(String(dados.colecoes[0]?.id ?? ''));
  // Guardamos apenas o ID escolhido. A coleção e seus itens são dados derivados,
  // recalculados na renderização quando a escolha muda, sem um useEffect adicional.
  const colecao = dados.colecoes.find((entrada) => String(entrada.id) === colecaoId);
  // A função percorre itemIds na ordem original e procura cada registro em itens.
  // Referências inexistentes são ignoradas na lista; os IDs ausentes aparecem no aviso.
  const relacionados = resolverItens(colecao?.itemIds ?? [], dados.itens);
  const idsAusentes = (colecao?.itemIds ?? []).filter((id) => !dados.itens.some((item) => String(item.id) === String(id)));
  // reduce acumula o preço de uma unidade de cada item relacionado.
  // O valor inicial 0 também produz um total válido para uma coleção vazia.
  const total = relacionados.reduce((soma, item) => soma + item.preco, 0);

  return (
    <div className="example-stack">
      <div className="section-intro"><div><span className="eyebrow">find + map + reduce</span><h2>Conecte os dados pelos IDs.</h2></div><p className="muted">O mesmo padrão relaciona treinadores e Pokémon, pedidos e produtos, turmas e alunos.</p></div>
      {/* O select recebe opções criadas com map e devolve o ID escolhido por props. */}
      <section className="panel">
        <div className="panel-heading"><h3>Explore uma coleção</h3><span className="badge">Relacionamento entre listas</span></div>
        <FiltroSelect label="Coleção" valor={colecaoId} aoMudar={setColecaoId} opcoes={dados.colecoes.map((entrada) => ({ valor: String(entrada.id), label: entrada.nome }))} />
        {/* Uma seleção inexistente não permite acessar descricao diretamente. */}
        {colecao && <p className="muted">{colecao.descricao}</p>}
        {/* Dados incompletos geram um aviso, sem impedir a exibição dos itens válidos. */}
        {idsAusentes.length > 0 && <p className="callout" role="status">Referência ausente no JSON: {idsAusentes.join(', ')}. Os outros itens continuam sendo exibidos.</p>}
        {relacionados.length === 0 ? <EstadoVazio titulo="Esta coleção ainda está vazia" descricao="Um array vazio é um resultado válido. Mostre uma mensagem antes de tentar acessar seus itens." /> : (
          <div className="collection-items">
            {relacionados.map((item, indice) => {
              // Cada item aponta para uma categoria em outra lista. O fallback no
              // JSX cobre uma categoria ausente; a chave ID + posição permite repetição.
              const categoria = dados.categorias.find((entrada) => String(entrada.id) === String(item.categoriaId));
              return <article className="collection-card" key={`${item.id}-${indice}`}><div><span className="badge">#{String(item.id).padStart(3, '0')}</span><h3>{item.nome}</h3><p className="muted">{categoria?.nome ?? 'Sem categoria'}</p></div><strong>{formatarMoeda(item.preco)}</strong></article>;
            })}
          </div>
        )}
        {/* O resumo usa a mesma lista válida renderizada nos cartões. */}
        <div className="collection-total"><span>{relacionados.length} itens relacionados</span><strong>Total: {formatarMoeda(total)}</strong></div>
      </section>
      <BlocoCodigo titulo="Resolver relacionamentos e calcular um total" codigo={codigo} />
    </div>
  );
}
