// useEffect sincroniza a tela com a leitura do arquivo; useState guarda resposta/status.
// Os componentes auxiliares só exibem o exemplo de código e as mensagens da interface.
import { useEffect, useState } from 'react';
import BlocoCodigo from '../components/BlocoCodigo.jsx';
import EstadoVazio from '../components/EstadoVazio.jsx';

// Esta string é uma receita menor para copiar. O efeito real, abaixo, acrescenta
// validações de conteúdo e permite refazer a leitura pelos botões da demonstração.
const codigo = `// Arquivo: public/dados-exemplo.json
// Imports de src/data são mais simples se os dados forem fixos.
useEffect(() => {
  const controller = new AbortController();

  async function carregar() {
    setCarregando(true);
    setErro('');
    try {
      const resposta = await fetch(
        import.meta.env.BASE_URL + 'dados-exemplo.json',
        { signal: controller.signal }
      );
      if (!resposta.ok) throw new Error('Não foi possível carregar.');
      const dados = await resposta.json();
      if (!Array.isArray(dados)) throw new Error('Formato inválido.');
      if (!controller.signal.aborted) setItens(dados);
    } catch (erro) {
      if (!controller.signal.aborted) setErro(erro.message);
    } finally {
      if (!controller.signal.aborted) setCarregando(false);
    }
  }

  carregar();
  return () => controller.abort();
}, []);`;

export default function Carregamento() {
  // O nome escolhe qual arquivo buscar. tentativa muda mesmo ao pedir o mesmo
  // arquivo, criando outro objeto requisicao e acionando novamente o efeito.
  const [requisicao, setRequisicao] = useState({ arquivo: 'dados-exemplo.json', tentativa: 0 });
  // Estes estados representam os quatro resultados possíveis: carregando, erro,
  // sucesso com lista vazia ou sucesso com registros. A renderização decide qual mostrar.
  const [itens, setItens] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  useEffect(() => {
    // Cada execução recebe seu próprio controlador. Quando a solicitação muda
    // ou o componente desmonta, a limpeza cancela a leitura anterior.
    const controller = new AbortController();

    // Declaramos uma função async dentro do efeito: o próprio useEffect precisa
    // devolver a função de limpeza, em vez de uma Promise.
    async function carregar() {
      // Uma nova tentativa esconde o erro anterior e mostra o estado de carregamento.
      setCarregando(true);
      setErro('');
      try {
        // Em public/dados-exemplo.json, "public" não faz parte da URL.
        // BASE_URL respeita a pasta base configurada no Vite, inclusive em um subdiretório.
        const resposta = await fetch(`${import.meta.env.BASE_URL}${requisicao.arquivo}`, { signal: controller.signal });
        // fetch não lança erro automaticamente para HTTP 404/500: precisamos de ok.
        if (!resposta.ok) throw new Error('O arquivo solicitado não foi encontrado.');
        // O Vite pode devolver index.html para uma URL inexistente.
        // Valide o conteúdo, mesmo se o status HTTP for 200.
        if (!resposta.headers.get('content-type')?.includes('application/json')) throw new Error('O endereço não retornou um arquivo JSON.');
        const recebidos = await resposta.json();
        // JSON válido ainda pode ter o formato errado. Aqui a tela espera um array
        // cujos registros tenham id, nome e categoria; ajuste a regra ao arquivo da prova.
        if (!Array.isArray(recebidos) || !recebidos.every((item) => item && (typeof item.id === 'number' || typeof item.id === 'string') && typeof item.nome === 'string' && typeof item.categoria === 'string')) throw new Error('O JSON não tem a estrutura esperada.');
        // Uma resposta antiga não pode substituir o estado depois do cancelamento.
        if (!controller.signal.aborted) setItens(recebidos);
      } catch (falha) {
        // Cancelar é esperado ao sair/trocar a solicitação: nesse caso não exibimos erro.
        if (!controller.signal.aborted) setErro(falha.message);
      } finally {
        // O loading termina tanto no sucesso quanto na falha, se a execução ainda for atual.
        if (!controller.signal.aborted) setCarregando(false);
      }
    }

    carregar();
    // No StrictMode o React também testa montagem/limpeza em desenvolvimento.
    // A dependência requisicao refaz a leitura ao trocar arquivo ou aumentar tentativa.
    return () => controller.abort();
  }, [requisicao]);

  function solicitar(arquivo) {
    // A atualização funcional conserva a contagem mais recente sem mutar o objeto anterior.
    setRequisicao((anterior) => ({ arquivo, tentativa: anterior.tentativa + 1 }));
  }

  return (
    <div className="example-stack">
      <div className="section-intro"><div><span className="eyebrow">useEffect + fetch</span><h2>Prepare cada estado da tela.</h2></div><p className="muted">Este exemplo lê um JSON da pasta public. O arquivo é local: nenhuma API externa é necessária.</p></div>
      {/* Um botão usa o arquivo real; o outro permite experimentar a apresentação do erro. */}
      <section className="panel">
        <div className="panel-heading"><h3>Leitura de arquivo local</h3><span className="badge">public/dados-exemplo.json</span></div>
        <div className="inline-actions"><button className="button button-primary" type="button" onClick={() => solicitar('dados-exemplo.json')}>Carregar novamente</button><button className="button button-secondary" type="button" onClick={() => solicitar('arquivo-inexistente.json')}>Simular erro</button></div>
        {/* A ordem das condições importa: loading → erro → lista vazia → lista com dados.
            aria-busy e os roles anunciam o estado também para leitores de tela. */}
        <div className="fetch-result" aria-busy={carregando}>
          {carregando ? <div className="empty-state" role="status"><span className="loading-spinner" aria-hidden="true" /><h3>Carregando dados…</h3></div> : erro ? <div className="fetch-error" role="alert"><EstadoVazio titulo="Não foi possível carregar" descricao={erro} acao="Tentar novamente" aoAcao={() => solicitar('dados-exemplo.json')} /></div> : itens.length === 0 ? <EstadoVazio titulo="O arquivo está vazio" descricao="A leitura funcionou, mas não há registros para exibir." /> : <ul className="fetch-list">{itens.map((item) => <li key={item.id}><span className="badge">#{String(item.id).padStart(3, '0')}</span><strong>{item.nome}</strong><span className="muted">{item.categoria}</span></li>)}</ul>}
        </div>
        <p className="callout">Para um JSON fixo em <code>src/data</code>, prefira <code>import dados from './data/arquivo.json'</code>. Use <code>fetch</code> quando o enunciado pedir carregamento assíncrono.</p>
      </section>
      <BlocoCodigo titulo="Carregar, tratar erros e cancelar a requisição ao desmontar" codigo={codigo} />
    </div>
  );
}
