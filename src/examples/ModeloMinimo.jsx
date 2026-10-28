import Icone from '../components/Icone.jsx';

// Esta apresentação pertence ao caderno. O modelo para a prova é AppBase.jsx.
export default function ModeloMinimo() {
  const endereco = `${import.meta.env.BASE_URL}modelo.html`;

  return (
    <div className="example-stack">
      <div className="section-intro">
        <div><span className="eyebrow">COMECE POR AQUI</span><h2>Um componente para começar.</h2></div>
        <p className="muted">O código está em <code>src/modelos/AppBase.jsx</code>. Ele usa apenas React e o JSON para listar, buscar, filtrar e abrir detalhes.</p>
      </div>
      <div className="callout">
        <Icone nome="codigo" />
        <p>Abra <strong>Código-fonte</strong> para consultar e copiar o modelo comentado. Ao copiá-lo para <code>src/App.jsx</code>, ajuste o import para <code>./data/catalogo.json</code>.</p>
      </div>
      <div className="inline-actions">
        <a className="button button-secondary" href={endereco} target="_blank" rel="noreferrer">Abrir modelo em outra aba <Icone nome="externo" tamanho={14} /></a>
        <span className="muted">A demonstração abaixo funciona sem o CSS do caderno.</span>
      </div>
      {/* iframe isola o documento e seus estilos. Ele carrega o AppBase real,
          a mesma página que o link acima abre, em vez de uma imagem estática. */}
      <iframe className="minimal-preview" title="Demonstração do modelo mínimo" src={endereco} />
    </div>
  );
}
