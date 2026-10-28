// Ícones locais em SVG: nenhuma biblioteca de interface é necessária.
// nome escolhe um desenho, tamanho define os pixels e ...props recebe atributos extras.
export default function Icone({ nome, tamanho = 20, ...props }) {
  // Este objeto é um dicionário de elementos JSX, não uma lista de dados da atividade.
  // Cada chave corresponde a um nome usado pelo componente que pede o ícone.
  const desenhos = {
    codigo: <><path d="m8 7-5 5 5 5m8-10 5 5-5 5m-3-13-2 16" /></>,
    grade: <><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /></>,
    editar: <><path d="M12 4H5a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h13a2 2 0 0 0 2-2v-7M16 3l5 5-10 10-6 1 1-6Z" /></>,
    relacao: <><rect x="3" y="3" width="7" height="6" rx="1.5" /><rect x="14" y="15" width="7" height="6" rx="1.5" /><path d="M6.5 9v9h7.5M10 6h7.5v9" /></>,
    carregar: <><path d="M20 8a8 8 0 1 0 1 7M20 3v5h-5" /></>,
    livro: <><path d="M12 5c-3-2-6-2-10-1v15c4-1 7-1 10 1 3-2 6-2 10-1V4c-4-1-7-1-10 1Zm0 0v15" /></>,
    seta: <><path d="M5 12h14m-6-6 6 6-6 6" /></>,
    externo: <><path d="M14 3h7v7m0-7L10 14M10 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-5" /></>,
    favorito: <><path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9Z" /></>,
    lista: <><path d="M9 5h12M9 12h12M9 19h12M3 5h.1M3 12h.1M3 19h.1" /></>,
    terminal: <><rect x="2" y="4" width="20" height="16" rx="3" /><path d="m6 9 3 3-3 3m7 0h5" /></>,
    check: <><path d="m5 12 4 4L19 6" /></>,
    caixa: <><path d="m12 3 9 5v9l-9 5-9-5V8Zm0 0v9m9-4-9 4-9-4m9 4v10" /></>,
  };
  // currentColor herda a cor do CSS. ?? usa o desenho padrão para um nome desconhecido.
  // Por padrão o ícone é decorativo: o texto/aria-label do botão comunica sua ação.
  return <svg width={tamanho} height={tamanho} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.65" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>{desenhos[nome] ?? desenhos.codigo}</svg>;
}
